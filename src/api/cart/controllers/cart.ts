import { factories } from "@strapi/strapi";
import { processCartItems } from "./helpers";
import customHandlers from "./customHandlers";

export default factories.createCoreController("api::cart.cart", ({ strapi }) => ({
    // Import custom handlers
    ...customHandlers,

    async myCart(ctx) {
        try {
            // Get the authenticated user ID
            const id = ctx.state.user?.id;

            if (!id) {
                return ctx.unauthorized("You must be logged in to view the cart.");
            }

            // Check if cartIds are provided in the request body
            const cartIds = ctx.request.body?.cartIds || [];
            console.log("Received cartIds:", cartIds);

            // Base query to find user's carts
            const query: any = {
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
            };

            // If cartIds array is provided and not empty, add filter for specific cart IDs
            if (cartIds && cartIds.length > 0) {
                query.filters.documentId = {
                    $in: cartIds,
                };
                console.log("Filtering carts by IDs:", cartIds);
            }

            const carts = await strapi.documents("api::cart.cart").findMany(query);
            console.log(`Found ${carts.length} carts`);

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
            console.log("Search term:", search);

            // Search for products based on Description, Tags, and Title
            const Products = await strapi.documents("api::product.product").findMany({
                filters: search
                    ? {
                          $or: [
                              { Descriptions: { $containsi: search } },
                              { Tags: { $containsi: search } },
                              { Name: { $containsi: search } },
                          ],
                      }
                    : {},
                populate: {
                    Thumbnail: true,
                    Price_Section: true,
                },
                status: "published",
                limit: 20,
            });

            console.log(`Found ${Products.length} products matching "${search || "all"}"`);

            const Collections = await strapi.documents("api::collection.collection").findMany({
                filters: search
                    ? {
                          Name: {
                              $containsi: search,
                          },
                      }
                    : {},
                fields: ["Name"],
                status: "published",
                limit: 10,
            });

            const Categories = await strapi.documents("api::collection.collection").findMany({
                filters: search
                    ? {
                          Name: {
                              $containsi: search,
                          },
                      }
                    : {},
                fields: ["Name"],
                status: "published",
                limit: 10,
            });

            return ctx.send({ Products, Collections, Categories });
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            return ctx.internalServerError("An error occurred while fetching suggestions ");
        }
    },

    async allBlogs(ctx) {
        try {
            const name = ctx?.request?.body?.name;
            const type = ctx?.request?.body?.type;
            const blogs = await strapi.documents("api::rasa-page.rasa-page").findMany({
                populate: {
                    Blogs: {
                        populate: {
                            Blog_Section: {
                                populate: {
                                    Images: {
                                        populate: {
                                            Media: true,
                                        },
                                    },
                                    Videos: {
                                        populate: {
                                            Media: true,
                                        },
                                    },
                                },
                            },
                            Thumbnail: true,
                        },
                    },
                },
                status: "published",
            });

            if (name) {
                blogs.forEach((blog) => {
                    if (blog.Blogs) {
                        blog.Blogs = blog.Blogs.filter((b) => b.Title === name);
                    }
                });
            } else if (type) {
                const filteredBlogs = blogs.map((blog) => ({
                    ...blog,
                    Blogs: blog.Blogs.filter((b) => {
                        // If no type is specified, include all blogs
                        if (!type) return true;

                        console.log("type ", type, "type of ", typeof type);

                        // Check if b.Type exists, if not, we can't match it with the filter
                        if (!b.Type) return false;

                        // Normalize both strings by trimming and converting to lowercase
                        const normalizedType = type.trim().toLowerCase();
                        console.log("type is correct", type);
                        const normalizedBlogType = b?.Type?.trim()?.toLowerCase();
                        console.log("b type is correct", b.Type);

                        // Check if they match exactly or if the blog type contains the search type
                        return normalizedBlogType === normalizedType;
                    }).map(({ Blog_Section, ...rest }) => rest),
                }));

                return ctx.send({ blogs: filteredBlogs });
            }

            return ctx.send({ blogs: blogs });
        } catch (error) {
            console.error("Error fetching blogs:", error);
            return ctx.internalServerError("An error occurred while fetching the blogs.");
        }
    },
    async pressAndMediaBlogs(ctx) {
        try {
            const name = ctx?.request?.body?.name;
            const type = ctx?.request?.body?.type;
            const blogs = await strapi.documents("api::press-and-media.press-and-media").findMany({
                populate: {
                    Blogs: {
                        populate: {
                            Blog_Section: {
                                populate: {
                                    Images: {
                                        populate: {
                                            Media: true,
                                        },
                                    },
                                    Videos: {
                                        populate: {
                                            Media: true,
                                        },
                                    },
                                },
                            },
                            Thumbnail: true,
                        },
                    },
                },
                status: "published",
            });

            if (name) {
                blogs.forEach((blog) => {
                    if (blog.Blogs) {
                        blog.Blogs = blog.Blogs.filter((b) => b.Title === name);
                    }
                });
            } else if (type) {
                const filteredBlogs = blogs.map((blog) => ({
                    ...blog,
                    Blogs: blog.Blogs.filter((b) => {
                        // If no type is specified, include all blogs
                        if (!type) return true;

                        console.log("type ", type, "type of ", typeof type);

                        // Check if b.Type exists, if not, we can't match it with the filter
                        if (!b.Type) return false;

                        // Normalize both strings by trimming and converting to lowercase
                        const normalizedType = type.trim().toLowerCase();
                        console.log("type is correct", type);
                        const normalizedBlogType = b?.Type?.trim()?.toLowerCase();
                        console.log("b type is correct", b.Type);

                        // Check if they match exactly or if the blog type contains the search type
                        return normalizedBlogType === normalizedType;
                    }).map(({ Blog_Section, ...rest }) => rest),
                }));

                return ctx.send({ blogs: filteredBlogs });
            }

            console.log("filtered ", blogs);

            return ctx.send({ blogs: blogs });
        } catch (error) {
            console.error("Error fetching blogs:", error);
            return ctx.internalServerError("An error occurred while fetching the blogs.");
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
