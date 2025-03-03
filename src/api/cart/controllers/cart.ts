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
                console.log("updating existing product");

                cartDetails = await strapi.documents("api::cart.cart").update({
                    documentId: existingCartItem?.[0]?.documentId,

                    data: {
                        Total_Price: payload?.Total_Price,
                        // // @ts-ignore
                        // Product: {
                        //     Quantity: payload?.Product?.Quantity,
                        // },
                        User: { id: userId },
                    },
                    status: "published",
                });
            } else {
                console.log("adding existing product");
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
    async addMultipleToCart(ctx) {
        try {
            const userId = ctx.state.user?.id;
            if (!userId) {
                return ctx.unauthorized("You must be logged in to add items to the cart.");
            }

            const carts = ctx.request.body?.carts;
            if (!carts || carts.length === 0) {
                return ctx.badRequest("No cart items provided.");
            }

            await processCartItems(carts, userId);

            return ctx.send({
                message: "All items added to the cart.",
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

    async suggestions(ctx) {
        try {
            const { search } = ctx.request.body;
            const Products = await strapi.documents("api::product.product").findMany({
                filters: {
                    Name: {
                        $containsi: search,
                    },
                },
                populate: {
                    Thumbnail: true,
                    Price_Section: true,
                },
                status: "published",
                limit: 10,
            });
            const Collections = await strapi.documents("api::collection.collection").findMany({
                filters: {
                    Name: {
                        $containsi: search,
                    },
                },
                fields: ["Name"],
                status: "published",
                limit: 10,
            });
            const Categories = await strapi.documents("api::collection.collection").findMany({
                filters: {
                    Name: {
                        $containsi: search,
                    },
                },
                fields: ["Name"],
                status: "published",
                limit: 10,
            });

            return ctx.send({ Products, Collections, Categories });
        } catch (error) {
            console.error("Error fetching suggetions:", error);
            return ctx.internalServerError("An error occurred while fetching suggetions ");
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

export async function processCartItems(carts, userId) {
    try {
        console.log("[processCartItems]  execution started");
        console.log("carts ", carts);
        console.log("user id ", userId);
        // Iterate over each cart item
        for (let cart of carts) {
            const { Product, Type, Total_Price } = cart;
            const productId = Product?.Product;

            // Validate product ID
            if (!productId) {
                throw new Error("Product document ID is required.");
            }

            // Fetch the product details along with the Price_Section
            const products = await strapi.documents("api::product.product").findMany({
                filters: { documentId: productId },
                populate: { Price_Section: true },
            });

            const productExists = products[0];
            if (!productExists) {
                throw new Error(`Product with ID ${productId} not found.`);
            }

            // Find the price section that matches the selected option
            const liveProduct = productExists?.Price_Section?.find((item) => item.Option === Product?.Option);

            // Prepare the payload with updated pricing details
            let payload = { Product, Type, Total_Price };
            if (liveProduct) {
                payload.Product.Price = liveProduct.Price;
                payload.Product.Discounted_Price = liveProduct.Discounted_Price;
                payload.Total_Price = liveProduct.Discount_Available ? liveProduct.Discounted_Price : liveProduct.Price;
            }

            // Check if the product already exists in the user's cart
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

            // If product exists in cart, update it
            if (existingCartItem?.length > 0) {
                await strapi.documents("api::cart.cart").update({
                    documentId: existingCartItem?.[0]?.documentId,
                    data: {
                        Type,
                        Total_Price: payload?.Total_Price,
                        Product: {
                            Discounted_Price: payload?.Product?.Discounted_Price,
                            Price: payload?.Product?.Price,
                            Size: payload?.Product?.Size,
                            Color: payload?.Product?.Color,
                            Discount_Available: payload?.Product?.Discount_Available,
                            Option: payload?.Product?.Option,
                            Product: payload?.Product?.Product,
                            Quantity: payload?.Product?.Quantity,
                        },
                        User: { id: userId },
                    },
                    status: "published",
                });
            }

            console.log("[processCartItems]  execution processed");
        }
    } catch (error) {
        console.error("Error processing cart items:", error.message);
        throw new Error("An error occurred while processing the cart items. Please try again later.");
    }
}
