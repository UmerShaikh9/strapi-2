import { factories } from "@strapi/strapi";
import { processCartItems } from "../../cart/controllers/helpers";
import paypalController from "./paypal";
import ccavenueController from "./ccavenue";

export default factories.createCoreController("api::order.order", ({ strapi }) => {
    // Create instances of the controllers
    const paypalCtrl = paypalController({ strapi });
    const ccavenueCtrl = ccavenueController({ strapi });

    return {
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

        async validateCoupon(ctx) {
            try {
                // Get the authenticated user ID
                // const id = ctx.state.user?.id;
                const couponCode = ctx.request.body?.couponCode;

                // if (!id) {
                //     return ctx.unauthorized("You must be logged in to view the orders.");
                // }
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

        // Import PayPal controller methods
        createOrder: paypalCtrl.createOrder,
        captureOrder: paypalCtrl.captureOrder,

        // Import CCAvenue controller methods
        createCCAvenueOrder: ccavenueCtrl.createCCAvenueOrder,
        handleCCAvenueCallback: ccavenueCtrl.handleCCAvenueCallback,
        handleCCAvenueErrorCallback: ccavenueCtrl.handleCCAvenueErrorCallback,
    };
});
