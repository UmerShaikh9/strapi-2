import { factories } from "@strapi/strapi";
import axios from "axios";
import { processCartItems } from "../../cart/controllers/helpers";
import crypto from "crypto";
const qs = require("querystring");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_API = process.env.PAYPAL_API;

// CCAvenue configuration
const CCAVENUE_MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;
const CCAVENUE_WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
const CCAVENUE_ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
const CCAVENUE_REDIRECT_URL = process.env.CCAVENUE_REDIRECT_URL;
const CCAVENUE_API_URL = process.env.CCAVENUE_API_URL;
const BACKEND_URL = process.env.BACKEND_URL;

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

            const { Full_Name, Address, City, Country, currency, Email, Phone, State, Pincode, couponId, cartIds } =
                ctx.request.body;

            if (!cartIds || cartIds?.length === 0) {
                return ctx.badRequest("Please select at least one product");
            }

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
                filters: { User: { id: id }, documentId: { $in: cartIds } },
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

            totalPriceINR = totalPriceINR; // Add 7% extra charge

            let TotalPrice = 0;

            let couponPayload = {};
            if (couponId) {
                console.log("coupon code present ", couponId);
                const couponDetails = await strapi.documents("api::coupon.coupon").findOne({ documentId: couponId });
                if (!couponDetails) {
                    return ctx.badRequest("Invalid Coupon Code");
                }

                console.log("coupon details ", couponDetails);
                const convertedAmount = convertCurrency({
                    totalPriceINR: (totalPriceINR - couponDetails?.Price) * 1.07,
                    currency,
                });
                TotalPrice = Number(convertedAmount);
                couponPayload = {
                    Coupon: couponId,
                };

                console.log("coupon code payload ", couponPayload);
                console.log("total price ", TotalPrice);
            } else {
                // Add 7% extra charge for international transactions
                const convertedAmount = convertCurrency({ totalPriceINR: totalPriceINR * 1.07, currency });
                console.log(`Converted ${totalPriceINR} INR to ${convertedAmount} ${currency}`);
                TotalPrice = Number(convertedAmount);
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

                // Get all cart items for the user
                const carts = await strapi.documents("api::cart.cart").findMany({
                    filters: { User: { id: id } },
                    populate: {
                        Product: { populate: { Product: true } },
                    },
                    status: "published",
                });

                // Create a map of product IDs from the order
                const orderedProductIds = order.Products.map((product) => product.Product?.documentId);

                // Only delete cart items that were included in the order
                for (let cart of carts) {
                    if (orderedProductIds.includes(cart.Product?.Product?.documentId)) {
                        await strapi.documents("api::cart.cart").delete({
                            documentId: cart.documentId,
                        });
                    }
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

    async createCCAvenueOrder(ctx) {
        try {
            console.log("createCCAvenueOrder called with body:", ctx.request.body);

            console.log("CCAVENUE_MERCHANT_ID", CCAVENUE_MERCHANT_ID);
            console.log("CCAVENUE_WORKING_KEY", CCAVENUE_WORKING_KEY);
            console.log("CCAVENUE_ACCESS_CODE", CCAVENUE_ACCESS_CODE);
            console.log("CCAVENUE_REDIRECT_URL", CCAVENUE_REDIRECT_URL);
            console.log("CCAVENUE_API_URL", CCAVENUE_API_URL);

            // Get the authenticated user ID
            const id = ctx.state.user?.id;
            if (!id) {
                return ctx.unauthorized("You must be logged in to create an order.");
            }

            const {
                Full_Name,
                Address,
                City,
                Country,
                Email,
                Phone,
                State,
                Pincode,
                amount,
                currency,
                couponId,
                cartIds,
            } = ctx.request.body;

            // Validate required fields
            if (!Full_Name || !Address || !City || !Country || !Email || !Phone || !State || !Pincode || !amount) {
                return ctx.badRequest("Missing required fields");
            }

            if (!cartIds || cartIds?.length === 0) {
                return ctx.badRequest("Please select at least one product");
            }

            // Fetch user's cart items
            let carts = await strapi.documents("api::cart.cart").findMany({
                filters: { User: { id: id } },
                populate: {
                    Product: { populate: { Product: true } },
                    User: true,
                },
                status: "published",
            });

            if (!carts || carts.length === 0) {
                return ctx.badRequest("Cart is empty");
            }

            // Process cart items and calculate total price
            let cartsData = carts?.map((cart) => ({
                ...cart,
                Product: {
                    ...cart?.Product,
                    Product: cart?.Product?.Product?.documentId,
                },
            }));

            // Process cart items (handling price and image things)
            await processCartItems(cartsData, id);

            // Fetch updated cart items after processing, filtered by cartIds
            let updatedCarts = await strapi.documents("api::cart.cart").findMany({
                filters: { User: { id: id }, documentId: { $in: cartIds } },
                populate: {
                    Product: { populate: { Product: true } },
                    User: true,
                },
                status: "published",
            });

            console.log("updatedCarts", updatedCarts);

            // Validate required fields
            if (updatedCarts?.length === 0) {
                return ctx.badRequest("No products selected for order");
            }

            let totalPriceINR = 0;
            const products = [];

            for (let cart of updatedCarts) {
                totalPriceINR += cart.Total_Price;
                // Create a new product object with the correct structure
                const productData = {
                    ...cart.Product,
                    Product: cart.Product?.Product?.documentId,
                };
                products.push(productData);
            }

            // Handle coupon if provided
            let finalAmount = totalPriceINR;
            let couponPayload = {};
            if (couponId) {
                console.log("coupon code present ", couponId);
                const couponDetails = await strapi.documents("api::coupon.coupon").findOne({ documentId: couponId });
                if (!couponDetails) {
                    return ctx.badRequest("Invalid Coupon Code");
                }
                console.log("coupon details ", couponDetails);
                finalAmount = totalPriceINR - couponDetails?.Price;
                couponPayload = {
                    Coupon: couponId,
                };
            }

            // Generate a unique order ID
            const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

            // Create order in database
            const orderDetails = await strapi.documents("api::order.order").create({
                data: {
                    Products: products,
                    User: id,
                    Total_Price: finalAmount,
                    Payment_Details: {
                        Amount: finalAmount,
                        Payment_Status: "INITIATED",
                        Order_Uid: orderId,
                        Payment_Method: "CCAVENUE",
                    },
                    Order_Status: "PENDING",
                    Currency: currency || "INR",
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

            // Format amount to 2 decimal places and convert to string
            const formattedAmount = finalAmount.toFixed(2);

            // Prepare data for CCAvenue
            const orderData = {
                merchant_id: CCAVENUE_MERCHANT_ID,
                order_id: orderId,
                currency: currency || "INR",
                amount: formattedAmount,
                redirect_url: `${BACKEND_URL}/api/order/ccavenue/callback`,
                cancel_url: `${BACKEND_URL}/api/order/error-callback`,
                language: "EN",
                billing_name: Full_Name,
                billing_address: Address,
                billing_city: City,
                billing_state: State,
                billing_zip: Pincode,
                billing_country: Country,
                billing_tel: Phone,
                billing_email: Email,
                delivery_name: Full_Name,
                delivery_address: Address,
                delivery_city: City,
                delivery_state: State,
                delivery_zip: Pincode,
                delivery_country: Country,
                delivery_tel: Phone,
                merchant_param1: orderDetails.documentId, // Store order document ID for reference
                integration_type: "REDIRECT",
            };

            // Convert order data to string format
            const postData = qs.stringify(orderData);

            // Encrypt the data
            const encRequest = encrypt(postData, CCAVENUE_WORKING_KEY);
            console.log("encRequest", encRequest);
            const decRequest = decrypt(encRequest, CCAVENUE_WORKING_KEY);
            console.log("decRequest", decRequest);

            // Create HTML form for redirection
            const htmlForm = `
                <form id="nonseamless" method="post" name="redirect" action="${CCAVENUE_API_URL}">
                    <input type="hidden" name="command" value="initiateTransaction" />
                    <input type="hidden" name="encRequest" value="${encRequest}" />
                    <input type="hidden" name="access_code" value="${CCAVENUE_ACCESS_CODE}" />
                </form>
                <script type="text/javascript">document.redirect.submit();</script>
            `;

            return ctx.send({
                success: true,
                message: "Order created successfully",
                orderId: orderId,
                order: orderDetails,
                paymentForm: htmlForm,
                redirectUrl: CCAVENUE_API_URL,
            });
        } catch (error) {
            console.error("Error creating CCAvenue order:", error);
            return ctx.throw(500, {
                success: false,
                message: error.message || "Error creating CCAvenue order",
            });
        }
    },

    async handleCCAvenueCallback(ctx) {
        try {
            console.log("handleCCAvenueCallback called with body:", ctx.request.body);

            const { encResp, order_id, tracking_id, bank_ref_no, merchant_param1 } = ctx.request.body;

            if (!encResp) {
                console.error("No encrypted response received");
                return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?error=no_response`);
            }

            // Decrypt the response
            const decryptedData = decrypt(encResp, CCAVENUE_WORKING_KEY);
            console.log("Decrypted response:", decryptedData);

            // Parse the decrypted data
            const responseData = qs.parse(decryptedData);
            console.log("Parsed response data:", responseData);

            const order_status = responseData?.order_status;

            // // Get the order document ID from merchant_param1
            const orderDocumentId = merchant_param1 || responseData.merchant_param1;

            if (!orderDocumentId) {
                console.error("No order document ID found in response");
                return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?error=invalid_order`);
            }

            // Update order status in database
            const order = await strapi.documents("api::order.order").findOne({
                documentId: orderDocumentId,
                status: "published",
                populate: {
                    Products: {
                        populate: {
                            Product: true,
                        },
                    },
                    Payment_Details: true,
                    User: true,
                },
            });

            if (!order) {
                console.error("Order not found:", orderDocumentId);
                return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?error=order_not_found`);
            }

            console.log("order details ", order);

            // Update order with payment details
            await strapi.documents("api::order.order").update({
                documentId: orderDocumentId,
                data: {
                    Payment_Details: {
                        Amount: order?.Payment_Details?.Amount,
                        Payment_Status: order_status == "Success" ? "COMPLETED" : "FAILED",
                        Order_Uid: order?.Payment_Details?.Order_Uid,
                        Paypal_Response: responseData as any,
                    },
                    Order_Status: order_status == "Success" ? "CONFIRMED" : "PENDING",
                },
                status: "published",
            });

            // If payment is successful, update product quantities and clear cart

            if (order_status === "Success") {
                // Update product quantities
                console.log("transaction success");
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

                // Clear only the ordered products from user's cart
                if (order.User && order.User.id) {
                    const carts = await strapi.documents("api::cart.cart").findMany({
                        filters: { User: { documentId: order.User.documentId } },
                        populate: {
                            Product: { populate: { Product: true } },
                        },
                        status: "published",
                    });

                    // Create a map of product IDs from the order
                    const orderedProductIds = order.Products.map((product) => product.Product?.documentId);

                    // Only delete cart items that were included in the order
                    for (let cart of carts) {
                        if (orderedProductIds.includes(cart.Product?.Product?.documentId)) {
                            await strapi.documents("api::cart.cart").delete({
                                documentId: cart.documentId,
                            });
                        }
                    }
                }
            }

            return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/my-order?payment=success&order_id=${order_id}`);
        } catch (error) {
            console.error("Error handling CCAvenue callback:", error);
            return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?error=processing_error`);
        }
    },

    async handleCCAvenueErrorCallback(ctx) {
        try {
            console.log("handleCCAvenueErrorCallback called with body:", ctx.request.body);

            const { encResp, order_id, tracking_id, bank_ref_no, order_status, merchant_param1 } = ctx.request.body;

            // Log the error details
            console.error("CCAvenue payment failed:", {
                order_id,
                tracking_id,
                bank_ref_no,
                order_status,
                merchant_param1,
            });

            // If we have the order document ID, we can update the order status
            if (merchant_param1) {
                await strapi.documents("api::order.order").update({
                    documentId: merchant_param1,
                    data: {
                        Payment_Details: {
                            Payment_Status: "FAILED",
                        },
                        Order_Status: "PENDING",
                    },
                    status: "published",
                });
            }

            return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?order_id=${order_id}&status=${order_status}`);
        } catch (error) {
            console.error("Error handling CCAvenue error callback:", error);
            return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?error=processing_error`);
        }
    },
}));

const encrypt = (plainText, workingKey) => {
    try {
        // Generate key using MD5 hash of workingKey
        const key = crypto.createHash("md5").update(workingKey).digest();

        // Fixed IV used by CCAvenue
        const iv = Buffer.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
        ]);

        const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
        let encrypted = cipher.update(plainText, "utf8", "hex");
        encrypted += cipher.final("hex");

        return encrypted;
    } catch (err) {
        console.error("Encryption error:", err);
        throw err;
    }
};

const decrypt = (encryptedText, workingKey) => {
    try {
        console.log("Decrypting data with key:", workingKey);
        console.log("Data to decrypt:", encryptedText);

        // Create MD5 hash of the working key
        const key = crypto.createHash("md5").update(workingKey).digest();

        // Fixed IV used by CCAvenue
        const iv = Buffer.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
        ]);

        // Create decipher
        const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

        // Decrypt the data
        let decrypted = decipher.update(encryptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");

        console.log("Decryption successful");
        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error);
        throw error;
    }
};

const exchangeRates = {
    USD: 0.012,
    EUR: 0.011,
    INR: 1,
    CAD: 0.016,
    GBP: 0.0095,
    AUD: 0.018,
    JPY: 1.78,
    SGD: 0.016,
};

function convertCurrency({ totalPriceINR, currency }) {
    const exchangeRate = exchangeRates[currency] || 1; // Default to 1 if currency not found
    return (totalPriceINR * exchangeRate).toFixed(2);
}
