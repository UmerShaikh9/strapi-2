/**
 * wishlist controller
 */

import { factories } from "@strapi/strapi";

// export default factories.createCoreController("api::wishlist.wishlist");

export default factories.createCoreController("api::wishlist.wishlist", ({ strapi }) => ({
    async myWishlist(ctx) {
        try {
            // Get the authenticated user ID
            const id = ctx.state.user?.id;

            if (!id) {
                return ctx.unauthorized("You must be logged in to view the Wishlist.");
            }

            const wishlist = await strapi.documents("api::wishlist.wishlist").findMany({
                filters: {
                    User: {
                        id: id,
                    },
                },
                populate: {
                    Product: { populate: { Thumbnail: true, Price_Section: true } },
                    User: true,
                },

                status: "published",
            });

            return ctx.send({ wishlist });
        } catch (error) {
            console.error("Error fetching user Wishlist:", error);
            return ctx.internalServerError("An error occurred while fetching the Wishlist. ");
        }
    },

    async addToWishlist(ctx) {
        try {
            // Get the authenticated user ID
            const userId = ctx.state.user?.id;

            if (!userId) {
                return ctx.unauthorized("You must be logged in to add items to the wishlist.");
            }

            const { Product } = ctx.request.body;
            const productId = Product;

            if (!productId) {
                return ctx.badRequest("Product document id is required.");
            }

            const productExists = await strapi.documents("api::product.product").findOne({ documentId: productId });

            if (!productExists) {
                return ctx.notFound("Product not found.");
            }

            const existingWishlist = await strapi.documents("api::wishlist.wishlist").findMany({
                filters: {
                    Product: {
                        documentId: productId,
                    },
                    User: { id: userId },
                },
            });

            let wishlistDetails = {};
            if (existingWishlist?.length > 0) {
                wishlistDetails = await strapi.documents("api::wishlist.wishlist").update({
                    documentId: existingWishlist?.[0]?.documentId,

                    data: {
                        Product: productId,
                        User: { id: userId },
                    },
                    status: "published",
                });
            } else {
                wishlistDetails = await strapi.documents("api::wishlist.wishlist").create({
                    data: {
                        Product: productId,
                        User: { id: userId },
                    },
                    status: "published",
                });
            }

            return ctx.send({
                message: "Item added to Wishlist.",
                wishlish: wishlistDetails,
            });
        } catch (error) {
            console.error("Error adding item to wishlist:", error);
            return ctx.internalServerError("An error occurred while adding the item to the wishlist.");
        }
    },

    async removeFromWishlist(ctx) {
        try {
            const userId = ctx.state.user?.id;

            if (!userId) {
                return ctx.unauthorized("You must be logged in to remove items from the Wishlist.");
            }

            const { productId } = ctx.query;
            console.log(ctx.request);
            if (!productId) {
                return ctx.badRequest("productId ID is required.");
            }

            const wishlists = await strapi.documents("api::wishlist.wishlist").findMany({
                filters: {
                    Product: {
                        documentId: productId,
                    },
                    User: {
                        id: userId,
                    },
                },
            });

            const wishlistId = wishlists[0]?.documentId;
            // Check if the Wishlist item exists and belongs to the authenticated user
            const wishlistItem = await strapi.documents("api::wishlist.wishlist").findOne({
                documentId: wishlistId as string,
                filters: { User: { id: userId } },
            });

            if (!wishlistItem) {
                return ctx.notFound("Wishlist item not found or does not belong to the user.");
            }

            await strapi.documents("api::wishlist.wishlist").delete({
                documentId: wishlistId as string,
            });

            return ctx.send({
                message: "Item removed from the Wishlist.",
            });
        } catch (error) {
            console.error("Error removing item from Wishlist:", error);
            return ctx.internalServerError("An error occurred while removing the item from the Wishlist.");
        }
    },
}));
