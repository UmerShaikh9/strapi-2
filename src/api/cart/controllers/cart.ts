import { factories } from "@strapi/strapi";
import { processCartItems } from "./helpers";
import customHandlers from "./customHandlers";

export default factories.createCoreController("api::cart.cart", ({ strapi }) => ({
    // Import custom handlers
    ...customHandlers,

    async myCart(ctx) {
        try {
            // Get the authenticated user ID if available
            const userId = ctx.state.user?.id;
            // Get guest session ID from request
            const guestSessionId = ctx.request.body?.guestSessionId;

            // Check if cartIds are provided in the request body
            const cartIds = ctx.request.body?.cartIds || [];
            console.log("Received cartIds:", cartIds);

            // Base query to find carts
            const query: any = {
                filters: {},
                populate: {
                    Product: { populate: { Product: { populate: { Thumbnail: true } } } },
                    User: true,
                },
                status: "published",
            };

            // Add filter based on whether user is authenticated or guest
            if (userId) {
                query.filters.User = {
                    id: userId,
                };
            } else if (guestSessionId) {
                query.filters.GuestSessionId = guestSessionId;
            } else {
                return ctx.badRequest("Either user authentication or guest session ID is required.");
            }

            console.log(`query ${JSON.stringify(query, null, 2)}`);

            // If cartIds array is provided and not empty, add filter for specific cart IDs
            if (cartIds && cartIds.length > 0) {
                query.filters.documentId = {
                    $in: cartIds,
                };
                console.log("Filtering carts by IDs:", cartIds);
            }

            console.log("query filter ", query);

            const carts = await strapi.documents("api::cart.cart").findMany(query);

            let cartsData = carts?.map((cart) => ({
                ...cart,
                Product: {
                    // @ts-ignore
                    ...cart?.Product,
                    // @ts-ignore
                    Product: cart?.Product?.Product?.documentId,
                },
            }));

            await processCartItems(cartsData, userId, guestSessionId ? true : false);

            console.log(`Found ${carts.length} carts`);

            let updatedCarts = await strapi.documents("api::cart.cart").findMany(query);
            console.log("updatedCarts", updatedCarts);

            return ctx.send({ carts: updatedCarts });
        } catch (error) {
            console.error("Error fetching user cart:", error);
            return ctx.internalServerError("An error occurred while fetching the cart. ");
        }
    },
    async addToCart(ctx) {
        try {
            console.log("ctx ", ctx);
            // Get the authenticated user ID if available
            const userId = ctx.state.user?.id;
            // Get guest session ID from request or generate one if not present
            const guestSessionId = ctx.request.body?.guestSessionId || `guest_${Date.now()}`;

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
                console.log("payload is a string");
                return ctx.badRequest(payload);
            }

            if (!productId) {
                console.log("productId is required");
                return ctx.badRequest("Product document id is required.");
            }

            const productExists = await strapi.documents("api::product.product").findOne({ documentId: productId });

            if (!productExists) {
                console.log("product not found");
                return ctx.notFound("Product not found.");
            }

            // Build filter based on whether user is authenticated or guest
            const filter: any = {
                Product: {
                    Product: {
                        documentId: productId,
                    },
                },
            };

            // Add user filter if authenticated, otherwise use guest session ID
            if (userId) {
                filter.User = { id: userId };
            } else {
                filter.GuestSessionId = guestSessionId;
            }

            const existingCartItem = await strapi.documents("api::cart.cart").findMany({
                filters: filter,
            });

            let cartDetails = {};

            const Total_Price =
                (payload?.Product?.Discount_Available ? payload?.Product?.Discounted_Price : payload?.Product?.Price) *
                payload?.Product?.Quantity;

            console.log("payload", payload);
            if (existingCartItem?.length > 0) {
                console.log("updating existing product");

                cartDetails = await strapi.documents("api::cart.cart").update({
                    documentId: existingCartItem?.[0]?.documentId,
                    data: {
                        Total_Price: Total_Price,
                        //  @ts-ignore
                        Product: {
                            Quantity: payload?.Product?.Quantity,
                            Discounted_Price: payload?.Product?.Discounted_Price,
                            Price: payload?.Product?.Price,
                            Size: payload?.Product?.Size,
                            Color: payload?.Product?.Color,
                            Discount_Available: payload?.Product?.Discount_Available,
                            Option: payload?.Product?.Option,
                            Product: payload?.Product?.Product,
                        },
                        ...(userId ? { User: { id: userId } } : { GuestSessionId: guestSessionId }),
                    },
                    status: "published",
                });
            } else {
                console.log("adding new product");
                cartDetails = await strapi.documents("api::cart.cart").create({
                    data: {
                        ...payload,
                        Total_Price: Total_Price,
                        ...(userId ? { User: { id: userId } } : { GuestSessionId: guestSessionId }),
                    },
                    status: "published",
                });
            }

            return ctx.send({
                message: "Item added to cart.",
                cart: cartDetails,
                guestSessionId: !userId ? guestSessionId : undefined,
            });
        } catch (error) {
            console.error("Error adding item to cart:", error);
            return ctx.internalServerError("An error occurred while adding the item to the cart.");
        }
    },
    async addMultipleToCart(ctx) {
        try {
            // Get the authenticated user ID if available
            const userId = ctx.state.user?.id;
            // Get guest session ID from request or generate one if not present
            const guestSessionId = ctx.request.body?.guestSessionId || `guest_${Date.now()}`;

            const carts = ctx.request.body?.carts;
            if (!carts || carts.length === 0) {
                return ctx.badRequest("No cart items provided.");
            }

            // Add guest session ID to each cart item if user is not authenticated
            const processedCarts = userId ? carts : carts.map((cart) => ({ ...cart, guestSessionId }));

            // Process cart items
            if (userId) {
                await processCartItems(processedCarts, userId);
            } else {
                // For guest users, we need to handle the cart items differently
                for (const cart of processedCarts) {
                    // Create a new context object with all necessary properties
                    const newCtx = {
                        ...ctx,
                        badRequest: ctx?.badRequest,
                        notFound: ctx?.notFound,
                        send: ctx?.send,
                        internalServerError: ctx?.internalServerError,
                        state: { ...ctx.state },
                        request: {
                            ...ctx.request,
                            body: {
                                ...cart,
                                TotalPrice: cart?.Total_Price,
                                guestSessionId,
                            },
                        },
                    };

                    await this.addToCart(newCtx);
                }
            }

            return ctx.send({
                message: "All items added to the cart.",
                guestSessionId: !userId ? guestSessionId : undefined,
            });
        } catch (error) {
            console.error("Error adding item to cart:", error);
            return ctx.internalServerError("An error occurred while adding the item to the cart.");
        }
    },
    async removeFromCart(ctx) {
        try {
            // Get the authenticated user ID if available
            const userId = ctx.state.user?.id;
            // Get guest session ID from request
            const guestSessionId = ctx.request.query?.guestSessionId;

            const { cartId } = ctx.query;
            console.log("ctx.request", ctx.request);
            console.log("guestSessionId", guestSessionId);
            if (!cartId) {
                return ctx.badRequest("Cart ID is required.");
            }

            // Build filter based on whether user is authenticated or guest
            const filter: any = {
                documentId: cartId as string,
            };

            // Add user filter if authenticated, otherwise use guest session ID
            if (userId) {
                filter.filters = { User: { id: userId } };
            } else if (guestSessionId) {
                filter.filters = { GuestSessionId: guestSessionId };
            } else {
                return ctx.badRequest("Either user authentication or guest session ID is required.");
            }

            // Check if the cart item exists and belongs to the authenticated user or guest
            const cartItem = await strapi.documents("api::cart.cart").findOne(filter);

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
    async assignCartToUser(ctx) {
        try {
            // Get the authenticated user ID
            const userId = ctx.state.user?.id;
            if (!userId) {
                return ctx.unauthorized("User must be logged in to assign cart.");
            }

            // Get guest session ID from request body
            const guestSessionId = ctx.request.body?.guestSessionId;
            if (!guestSessionId) {
                return ctx.badRequest("Guest session ID is required.");
            }

            // Find all cart items associated with the guest session
            const guestCartItems = await strapi.documents("api::cart.cart").findMany({
                filters: {
                    GuestSessionId: guestSessionId,
                },
            });

            if (!guestCartItems || guestCartItems.length === 0) {
                return ctx.send({
                    message: "No cart items found for the guest session.",
                    assigned: false,
                });
            }

            console.log("guestCartItems", guestCartItems?.length);
            console.log("user id", userId);

            // Update each cart item to be associated with the user
            const updatedItems = await Promise.all(
                guestCartItems.map(async (item) => {
                    return await strapi.documents("api::cart.cart").update({
                        documentId: item.documentId,
                        data: {
                            User: { id: userId },
                            GuestSessionId: null,
                        },
                        status: "published",
                    });
                })
            );

            return ctx.send({
                message: "Cart items successfully assigned to user.",
                assigned: true,
                items: updatedItems,
            });
        } catch (error) {
            console.error("Error assigning cart to user:", error);
            return ctx.internalServerError("An error occurred while assigning cart to user.");
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
