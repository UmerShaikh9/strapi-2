import { factories } from "@strapi/strapi";
import Razorpay from "razorpay";
import crypto from "crypto";
import order from "../routes/order";

export default factories.createCoreController("api::order.order", ({ strapi }) => ({
    async checkout(ctx) {
        try {
            // Get the authenticated user ID
            const id = ctx.state.user?.id;

            if (!id) {
                return ctx.unauthorized("You must be logged in to view the cart.");
            }

            const carts = await strapi.documents("api::cart.cart").findMany({
                filters: {
                    User: {
                        id: id,
                    },
                },
                populate: {
                    Product: {
                        populate: {
                            Product: true,
                        },
                    },
                    User: true,
                },
                status: "published",
            });

            let TotalPrice = 0;

            const Products = [];
            for (let cart of carts) {
                TotalPrice += cart.Total_Price;
                Products.push(cart.Product);
            }

            const razorpayInstance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY,
                key_secret: process.env.RAZORPAY_SECRET_KEY,
            });

            const options = {
                amount: Number(TotalPrice) * 100, // Amount in paise
                currency: "INR",
            };

            const order = await razorpayInstance.orders.create(options);

            const orderDetails = await strapi.documents("api::order.order").create({
                data: {
                    Products: Products,
                    User: id,
                    Total_Price: TotalPrice,
                    Payment_Details: {
                        Amount: TotalPrice,
                        Payment_Status: "INITIATED",
                        Razorpay_Order_Uid: order?.id,
                    },
                    Order_Status: "PENDING",
                },
                status: "published",
            });

            return ctx.send({
                success: true,
                message: "Order created successfully",
                order: orderDetails,
            });
        } catch (error) {
            console.error("Error during checkout:", error);
            return ctx.internalServerError("Internal server error");
        }
    },
    async paymentVerification(ctx) {
        try {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = ctx.request.body;
            console.log("body", ctx.request.body);

            const generated_signature = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expected_signature = crypto
                .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
                .update(generated_signature)
                .digest("hex");

            //find order based on razorpay order id
            const orders = await strapi.documents("api::order.order").findMany({
                filters: {
                    Payment_Details: {
                        Razorpay_Order_Uid: razorpay_order_id,
                    },
                },
                populate: "*",
                status: "published",
            });

            if (!orders || orders.length === 0) {
                return ctx.notFound("Payment record not found");
            }
            const order = orders[0];

            if (expected_signature === razorpay_signature) {
                await strapi.documents("api::order.order").update({
                    documentId: order.documentId,
                    data: {
                        Payment_Details: {
                            Amount: order?.Payment_Details?.Amount,
                            Razorpay_Order_Uid: razorpay_order_id,
                            Razorpay_Payment_Uid: razorpay_payment_id,
                            Razorpay_Signature: razorpay_signature,
                            Payment_Status: "DONE",
                        },
                    },
                    status: "published",
                });

                return ctx.send({ success: true, message: "Payment success" });
            } else {
                await strapi.documents("api::order.order").update({
                    documentId: order?.documentId,
                    data: {
                        Payment_Details: {
                            Amount: order?.Payment_Details?.Amount,
                            Razorpay_Order_Uid: razorpay_order_id,
                            Payment_Status: "FAILED",
                        },
                    },
                    status: "published",
                });

                return ctx.badRequest("Signature mismatch during payment verification.");
            }
        } catch (error) {
            console.error("Database error during payment verification:", error);
            return ctx.internalServerError("Internal server error");
        }
    },
}));
