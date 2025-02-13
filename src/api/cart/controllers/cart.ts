import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::cart.cart", ({ strapi }) => ({
    async myCart(ctx) {
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
                    Product: { populate: { Product: { populate: { Thumbnail: true } } } },

                    User: true,
                },
                status: "published",
            });

            return ctx.send({ carts });
        } catch (error) {
            console.error("Error fetching user cart:", error);
            return ctx.internalServerError("An error occurred while fetching the cart. ");
        }
    },

    async addToCart(ctx) {
        try {
            // Get the authenticated user ID
            const userId = ctx.state.user?.id;

            if (!userId) {
                return ctx.unauthorized("You must be logged in to add items to the cart.");
            }

            const { Product } = ctx.request.body;
            const productId = Product?.Product;

            const requiredFields = [
                { property: "Product", optional: false },
                { property: "Type", optional: true },
                { property: "TotalPrice", optional: false },
            ];

            const payload: any = await validateRequestBody(ctx.request.body, requiredFields);
            console.log("payload ", payload);
            console.log("body data", ctx.request.body);

            if (typeof payload === "string") {
                return ctx.badRequest(payload);
            }

            if (!productId) {
                return ctx.badRequest("Product document id is required.");
            }

            const productExists = await strapi.documents("api::product.product").findOne({ documentId: productId });

            if (!productExists) {
                return ctx.notFound("Product not found.");
            }

            const existingCartItem = await strapi.documents("api::cart.cart").findMany({
                filters: {
                    Product: {
                        Product: {
                            documentId: productId,
                        },
                    },
                    User: { id: userId },
                },
            });

            let cartDetails = {};

            console.log("payload", payload);
            if (existingCartItem?.length > 0) {
                cartDetails = await strapi.documents("api::cart.cart").update({
                    documentId: existingCartItem?.[0]?.documentId,

                    data: {
                        ...payload,
                        Total_Price: payload?.Total_Price,
                        User: { id: userId },
                    },
                    status: "published",
                });
            } else {
                cartDetails = await strapi.documents("api::cart.cart").create({
                    data: {
                        ...payload,
                        Total_Price: payload?.TotalPrice,
                        User: { id: userId },
                    },
                    status: "published",
                });
            }

            return ctx.send({
                message: "Item added to cart.",
                cart: cartDetails,
            });
        } catch (error) {
            console.error("Error adding item to cart:", error);
            return ctx.internalServerError("An error occurred while adding the item to the cart.");
        }
    },

    async removeFromCart(ctx) {
        try {
            const userId = ctx.state.user?.id;

            if (!userId) {
                return ctx.unauthorized("You must be logged in to remove items from the cart.");
            }

            const { cartId } = ctx.query;
            console.log(ctx.request);
            if (!cartId) {
                return ctx.badRequest("Cart ID is required.");
            }

            // Check if the cart item exists and belongs to the authenticated user
            const cartItem = await strapi.documents("api::cart.cart").findOne({
                documentId: cartId as string,
                filters: { User: { id: userId } },
            });

            if (!cartItem) {
                return ctx.notFound("Cart item not found or does not belong to the user.");
            }

            await strapi.documents("api::cart.cart").delete({
                documentId: cartId as string,
            });

            return ctx.send({
                message: "Item removed from the cart.",
            });
        } catch (error) {
            console.error("Error removing item from cart:", error);
            return ctx.internalServerError("An error occurred while removing the item from the cart.");
        }
    },
}));

const validateRequestBody = async (body, keys) => {
    let missingKeys = [];
    let payload = {};

    for (const keyObj of keys) {
        const key = keyObj.property;
        const value = body[key];

        if (!value && !keyObj.optional) {
            missingKeys.push(key);
        } else if (value !== undefined) {
            payload[key] = value;
        }
    }

    if (missingKeys.length > 0) {
        const missingKeyString = missingKeys.join(", ");
        return `Please provide the following key(s): ${missingKeyString}`;
    }
    return payload;
};
