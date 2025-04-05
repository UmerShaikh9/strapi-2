import { factories } from "@strapi/strapi";
import axios from "axios";
import { processCartItems } from "../../cart/controllers/helpers";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_API = process.env.PAYPAL_API;

export default factories.createCoreController("api::order.order", ({ strapi }) => ({
    async myOrder(ctx) {
        try {
            // Get the authenticated user ID
            const id = ctx.state.user?.id;
            console.log("user id", id);

            if (!id) {
                return ctx.unauthorized("You must be logged in to view the orders.");
            }

            const orders = await strapi.documents("api::order.order").findMany({
                filters: {
                    User: {
                        id: id,
                    },
                },
                populate: {
                    Products: { populate: { Product: { populate: { Thumbnail: true } } } },
                    User: true,
                    Payment_Details: true,
                },
                status: "published",
            });

            return ctx.send({ orders });
        } catch (error) {
            console.error("Error fetching user cart:", error);
            return ctx.internalServerError("An error occurred while fetching the cart. ");
        }
    },
    async createOrder(ctx) {
        try {
            // Get the authenticated user ID
            const id = ctx.state.user?.id;

            if (!id) {
                return ctx.unauthorized("You must be logged in to view the cart.");
            }

            const { Full_Name, Address, City, Country, currency, Email, Phone, State, Pincode, couponId } =
                ctx.request.body;

            console.log("coupon code", couponId);

            if (!currency) {
                return ctx.badRequest("Currency is required.");
            }

            let carts = await strapi.documents("api::cart.cart").findMany({
                filters: { User: { id: id } },
                populate: {
                    Product: { populate: { Product: true } },
                    User: true,
                },
                status: "published",
            });

            let cartsData = carts?.map((cart) => ({
                ...cart,
                Product: {
                    ...cart?.Product,
                    Product: cart?.Product?.Product?.documentId,
                },
            }));

            // handling all price hand image things
            await processCartItems(cartsData, id);

            let updatedCarts = await strapi.documents("api::cart.cart").findMany({
                filters: { User: { id: id } },
                populate: {
                    Product: { populate: { Product: true } },
                    User: true,
                },
                status: "published",
            });

            let totalPriceINR = 0;
            const products = [];

            for (let cart of updatedCarts) {
                totalPriceINR += cart.Total_Price;
                // @ts-ignore
                cart.Product.Product = cart.Product?.Product?.documentId;
                products.push(cart.Product);
            }

            const convertedAmount = convertCurrency({ totalPriceINR, currency });
            console.log(`Converted ${totalPriceINR} INR to ${convertedAmount} ${currency}`);

            // Create PayPal Order with converted amount
            let TotalPrice = Number(convertedAmount);
            let couponPayload = {};
            if (couponId) {
                console.log("coupon code present ", couponId);
                const couponDetails = await strapi.documents("api::coupon.coupon").findOne({ documentId: couponId });
                if (!couponDetails) {
                    return ctx.badRequest("Invalid Coupon Code");
                }

                console.log("coupon details ", couponDetails);
                const convertedAmount = convertCurrency({
                    totalPriceINR: totalPriceINR - couponDetails?.Price,
                    currency,
                });
                TotalPrice = Number(convertedAmount);
                couponPayload = {
                    Coupon: couponId,
                };

                console.log("coupon code payload ", couponPayload);
                console.log("total price ", TotalPrice);
            }

            const response = await axios.post(
                `${PAYPAL_API}/v2/checkout/orders`,
                {
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: currency,
                                value: TotalPrice,
                            },
                        },
                    ],
                },
                {
                    auth: { username: PAYPAL_CLIENT_ID, password: PAYPAL_SECRET },
                    headers: { "Content-Type": "application/json" },
                }
            );

            console.log("order response ", response);

            const orderDetails = await strapi.documents("api::order.order").create({
                data: {
                    Products: products,
                    User: id,
                    Total_Price: TotalPrice,
                    Payment_Details: {
                        Amount: TotalPrice,
                        Payment_Status: "INITIATED",
                        Order_Uid: response?.data?.id,
                    },
                    Order_Status: "PENDING",
                    Currency: currency,
                    Full_Name,
                    Address,
                    City,
                    Country,
                    State,
                    Pincode,
                    Email,
                    Phone,
                    ...couponPayload,
                },
                status: "published",
            });

            return ctx.send({
                success: true,
                message: "Order created successfully",
                order: orderDetails,
                orderId: response?.data?.id,
            });
        } catch (error) {
            console.error("Error creating order:", error);

            if (error.details?.errors) {
                console.error("Validation Errors:", error.details.errors);
            }

            ctx.throw(500, error.response?.data || "Error creating order");
        }
    },

    async captureOrder(ctx) {
        try {
            // Get the authenticated user ID
            const id = ctx.state.user?.id;
            console.log("create order called");

            if (!id) {
                return ctx.unauthorized("You must be logged in to view the cart.");
            }
            const { orderID } = ctx.request.body;
            console.log("body", ctx.request.body);

            //find order based on razorpay order id
            const orders = await strapi.documents("api::order.order").findMany({
                filters: {
                    Payment_Details: {
                        Order_Uid: orderID,
                    },
                },
                populate: {
                    Payment_Details: true,
                    Products: {
                        populate: { Product: true },
                    },
                },
                status: "published",
            });

            if (!orders || orders.length === 0) {
                return ctx.notFound("Payment record not found");
            }

            // Capture PayPal Payment
            const response = await axios.post(
                `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
                {},
                {
                    auth: { username: PAYPAL_CLIENT_ID, password: PAYPAL_SECRET },
                    headers: { "Content-Type": "application/json" },
                }
            );

            const order = orders[0];

            await strapi.documents("api::order.order").update({
                documentId: order.documentId,
                data: {
                    Payment_Details: {
                        Amount: order?.Payment_Details?.Amount,
                        Payment_Status: response?.data.status,
                        Order_Uid: orderID,
                        Paypal_Response: response?.data as any,
                    },
                },
                status: "published",
            });

            if (response?.data?.status === "COMPLETED") {
                for (let product of order.Products) {
                    //Decrement product quantiy
                    await strapi.documents("api::product.product").update({
                        documentId: product.Product?.documentId,
                        data: {
                            Quantity: product?.Product?.Quantity - 1,
                        },
                        status: "published",
                    });
                }

                const carts = await strapi.documents("api::cart.cart").findMany({
                    filters: { User: { id: id } },
                    status: "published",
                });

                for (let cart of carts) {
                    await strapi.documents("api::cart.cart").delete({
                        documentId: cart.documentId,
                    });
                }
            }

            return ctx.send({ success: true, message: "Payment success", data: response?.data });
        } catch (error) {
            ctx.throw(500, error.response?.data || "Error capturing payment");
        }
    },

    async validateCoupon(ctx) {
        try {
            // Get the authenticated user ID
            const id = ctx.state.user?.id;
            const couponCode = ctx.request.body?.couponCode;

            if (!id) {
                return ctx.unauthorized("You must be logged in to view the orders.");
            }
            if (!couponCode) {
                return ctx.unauthorized("Coupon Code must be provided");
            }

            const couponDetails = await strapi
                .documents("api::coupon.coupon")
                .findMany({ filters: { Coupon_Code: couponCode, Active: true }, status: "published" });

            return ctx.send({ couponDetails: couponDetails });
        } catch (error) {
            console.error("Error fetching user cart:", error);
            return ctx.internalServerError("An error occurred while fetching the cart. ");
        }
    },
}));

const exchangeRates = {
    USD: 0.012,
    EUR: 0.011,
    INR: 1,
};

function convertCurrency({ totalPriceINR, currency }) {
    const exchangeRate = exchangeRates[currency] || 1; // Default to 1 if currency not found
    return (totalPriceINR * exchangeRate).toFixed(2);
}
