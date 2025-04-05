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
    async migrateManagementTeamDescriptionsToDescription(ctx) {
        try {
            const documents = await strapi.documents("api::management-page.management-page").findMany({
                populate: {
                    Team_Details: {
                        populate: {
                            Member_Details: {
                                populate: {
                                    Descriptions: {
                                        populate: {
                                            Description: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            let updatedCount = 0;
            for (const doc of documents) {
                if (doc.Team_Details?.Member_Details) {
                    const updatedEntry = { ...doc };
                    let hasChanges = false;

                    for (const member of doc.Team_Details.Member_Details) {
                        if (member.Descriptions?.Description) {
                            const blocks = member.Descriptions.Description.map((item) => ({
                                type: "paragraph",
                                children: [
                                    {
                                        type: "text",
                                        text: item.Text,
                                        bold: false,
                                        italic: false,
                                        underline: false,
                                        strikethrough: false,
                                        code: false,
                                    },
                                ],
                            }));

                            if (blocks.length > 0) {
                                member.Description = blocks as any;
                                hasChanges = true;
                            }
                        }
                    }

                    if (hasChanges) {
                        await strapi.documents("api::management-page.management-page").update({
                            documentId: doc.documentId,
                            data: {
                                Team_Details: updatedEntry.Team_Details,
                            },
                            status: "published",
                        });
                        updatedCount++;
                    }
                }
            }

            return ctx.send({
                message: `Migration completed. Updated ${updatedCount} documents.`,
            });
        } catch (error) {
            console.error("Error in migrateManagementTeamDescriptionsToDescription:", error);
            return ctx.internalServerError("An error occurred during migration");
        }
    },
    async migrateWeavingTechniqueDescriptionsToDescription(ctx) {
        try {
            const documents = await strapi
                .documents("api::banarasi-weave-technique.banarasi-weave-technique")
                .findMany({
                    populate: {
                        Weaving_Techniques: {
                            populate: {
                                Weave_Technique_Details: {
                                    populate: {
                                        Descriptions: {
                                            populate: {
                                                Description: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

            let updatedCount = 0;
            for (const doc of documents) {
                if (doc.Weaving_Techniques?.Weave_Technique_Details) {
                    const updatedEntry = { ...doc };
                    let hasChanges = false;

                    for (const detail of doc.Weaving_Techniques.Weave_Technique_Details) {
                        if (detail.Descriptions?.Description) {
                            const blocks = detail.Descriptions.Description.map((item) => ({
                                type: "paragraph",
                                children: [
                                    {
                                        type: "text",
                                        text: item.Text,
                                        bold: false,
                                        italic: false,
                                        underline: false,
                                        strikethrough: false,
                                        code: false,
                                    },
                                ],
                            }));

                            if (blocks.length > 0) {
                                detail.Description = blocks as any;
                                hasChanges = true;
                            }
                        }
                    }

                    if (hasChanges) {
                        await strapi.documents("api::banarasi-weave-technique.banarasi-weave-technique").update({
                            documentId: doc.documentId,
                            data: {
                                Weaving_Techniques: updatedEntry.Weaving_Techniques,
                            },
                            status: "published",
                        });
                        updatedCount++;
                    }
                }
            }

            return ctx.send({
                message: `Migration completed. Updated ${updatedCount} documents.`,
            });
        } catch (error) {
            console.error("Error in migrateWeavingTechniqueDescriptionsToDescription:", error);
            return ctx.internalServerError("An error occurred during migration");
        }
    },
    async migrateWeaveDesignPatternDescriptionsToDescription(ctx) {
        try {
            const documents = await strapi
                .documents("api::banarasi-weave-design-pattern.banarasi-weave-design-pattern")
                .findMany({
                    populate: {
                        Design_And_Patterns: {
                            populate: {
                                Patterns: {
                                    populate: {
                                        Descriptions: {
                                            populate: {
                                                Description: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

            let updatedCount = 0;
            for (const doc of documents) {
                if (doc.Design_And_Patterns?.Patterns) {
                    const updatedEntry = { ...doc };
                    let hasChanges = false;

                    for (const pattern of doc.Design_And_Patterns.Patterns) {
                        if (pattern.Descriptions?.Description) {
                            const blocks = pattern.Descriptions.Description.map((item) => ({
                                type: "paragraph",
                                children: [
                                    {
                                        type: "text",
                                        text: item.Text,
                                        bold: false,
                                        italic: false,
                                        underline: false,
                                        strikethrough: false,
                                        code: false,
                                    },
                                ],
                            }));

                            if (blocks.length > 0) {
                                pattern.Description = blocks as any;
                                hasChanges = true;
                            }
                        }
                    }

                    if (hasChanges) {
                        await strapi
                            .documents("api::banarasi-weave-design-pattern.banarasi-weave-design-pattern")
                            .update({
                                documentId: doc.documentId,
                                data: {
                                    Design_And_Patterns: updatedEntry.Design_And_Patterns,
                                },
                                status: "published",
                            });
                        updatedCount++;
                    }
                }
            }

            return ctx.send({
                message: `Migration completed. Updated ${updatedCount} documents.`,
            });
        } catch (error) {
            console.error("Error in migrateWeaveDesignPatternDescriptionsToDescription:", error);
            return ctx.internalServerError("An error occurred during migration");
        }
    },
    async migrateProductDescriptionToDescriptions(ctx) {
        try {
            const documents = await strapi.documents("api::product.product").findMany({});

            let updatedCount = 0;
            const batchSize = 50; // Process 50 products at a time
            const batches = [];

            // Create batches of products
            for (let i = 0; i < documents.length; i += batchSize) {
                batches.push(documents.slice(i, i + batchSize));
            }

            console.log(`Processing ${documents.length} products in ${batches.length} batches of ${batchSize}`);

            // Process each batch in parallel
            for (const batch of batches) {
                const batchPromises = batch.map(async (doc) => {
                    if (doc.Description) {
                        // Create a blocks format from the Description text
                        const blocks = [
                            {
                                type: "paragraph",
                                children: [
                                    {
                                        type: "text",
                                        text: doc.Description,
                                        bold: false,
                                        italic: false,
                                        underline: false,
                                        strikethrough: false,
                                        code: false,
                                    },
                                ],
                            },
                        ];

                        // Set the Descriptions field with the blocks format
                        const updateData: any = {
                            Descriptions: blocks,
                        };

                        try {
                            await strapi.documents("api::product.product").update({
                                documentId: doc.documentId,
                                data: updateData,
                                status: "published",
                            });

                            console.log("Product updated:", doc.Name || doc.documentId);
                            return true;
                        } catch (error) {
                            console.error(`Error updating product ${doc.Name || doc.documentId}:`, error);
                            return false;
                        }
                    }
                    return false;
                });

                // Wait for all products in this batch to be processed
                const results = await Promise.all(batchPromises);
                updatedCount += results.filter((result) => result).length;

                console.log(`Batch completed. Updated ${updatedCount} products so far.`);
            }

            return ctx.send({
                message: `Migration completed. Updated ${updatedCount} documents.`,
            });
        } catch (error) {
            console.error("Error in migrateProductDescriptionToDescriptions:", error);
            return ctx.internalServerError("An error occurred during migration");
        }
    },

    async countProductDescriptionFields(ctx) {
        try {
            const documents = await strapi.documents("api::product.product").findMany({});

            let descriptionCount = 0;
            let descriptionsCount = 0;

            // Arrays to store product names
            const descriptionProducts = [];
            const descriptionsProducts = [];
            const missingDescriptionsProducts = []; // Products with Description but not Descriptions

            for (const doc of documents) {
                const hasDescription = !!doc.Description;
                const hasDescriptions = !!doc.Descriptions;
                const productName = doc.Name || `Product ${doc.documentId}`;

                if (hasDescription) {
                    descriptionCount++;
                    descriptionProducts.push(productName);

                    // Check if this product has Description but not Descriptions
                    if (!hasDescriptions) {
                        missingDescriptionsProducts.push(productName);
                    }
                }

                if (hasDescriptions) {
                    descriptionsCount++;
                    descriptionsProducts.push(productName);
                }
            }

            return ctx.send({
                total: documents.length,
                descriptionCount,
                descriptionsCount,
                match: descriptionCount === descriptionsCount,
                descriptionProducts,
                descriptionsProducts,
                missingDescriptionsProducts, // Products that need migration
                missingCount: missingDescriptionsProducts.length,
                message: `Found ${documents.length} products. ${descriptionCount} have Description field, ${descriptionsCount} have Descriptions field. ${missingDescriptionsProducts.length} products have Description but not Descriptions.`,
            });
        } catch (error) {
            console.error("Error counting product description fields:", error);
            return ctx.internalServerError("An error occurred while counting product description fields");
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
