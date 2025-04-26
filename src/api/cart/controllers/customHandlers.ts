/**
 * Custom handlers for cart controller
 */

import { factories } from "@strapi/strapi";

export default {
    async getProductsFilters(ctx) {
        try {
            // Get all products with their size, color, and badge options
            const products = await strapi.documents("api::product.product").findMany({
                fields: ["id", "Name", "Size", "Color", "Badges"],
                populate: {
                    Fabric_Types: {
                        fields: ["id", "Name"],
                    },
                    Motif_And_Designs: {
                        fields: ["id", "Name"],
                    },
                    Weaving_Techniques: {
                        fields: ["id", "Name"],
                    },
                },
                status: "published",
            });

            // Get all fabric types
            const fabricTypes = await strapi.documents("api::fabric-type.fabric-type").findMany({
                fields: ["id", "Name"],
                status: "published",
            });

            // Get the product schema to access predefined options
            const productSchema = strapi.contentTypes["api::product.product"];

            // Get predefined options from the schema
            const predefinedSizes = productSchema.attributes.Size.options || [];
            const predefinedColors = productSchema.attributes.Color.options || [];
            const predefinedBadges = productSchema.attributes.Badges.options || [];

            // Extract unique size, color, and badge options from all products
            const allSizes = new Set();
            const allColors = new Set();
            const allFabricTypes = new Set();
            const allMotifAndDesigns = new Set();
            const allWeavingTechniques = new Set();
            const allBadges = new Set();

            // Add all predefined options to the sets
            predefinedSizes.forEach((size) => allSizes.add(size));
            predefinedColors.forEach((color) => allColors.add(color));
            predefinedBadges.forEach((badge) => allBadges.add(badge));

            // Add all fabric types to the set
            fabricTypes.forEach((fabricType) => {
                if (fabricType.Name && typeof fabricType.Name === "string" && fabricType.Name.trim() !== "") {
                    allFabricTypes.add(fabricType.Name);
                }
            });

            // Add all motif and designs to the set
            products.forEach((product) => {
                if (product.Motif_And_Designs) {
                    product.Motif_And_Designs.forEach((motif) => {
                        if (motif.Name && typeof motif.Name === "string" && motif.Name.trim() !== "") {
                            allMotifAndDesigns.add(motif.Name);
                        }
                    });
                }
            });

            // Add all weaving techniques to the set
            products.forEach((product) => {
                if (product.Weaving_Techniques) {
                    product.Weaving_Techniques.forEach((technique) => {
                        if (technique.Name && typeof technique.Name === "string" && technique.Name.trim() !== "") {
                            allWeavingTechniques.add(technique.Name);
                        }
                    });
                }
            });

            // Convert sets to arrays
            const sizeOptions = Array.from(allSizes);
            const colorOptions = Array.from(allColors);
            const fabricTypeOptions = Array.from(allFabricTypes);
            const motifAndDesignsOptions = Array.from(allMotifAndDesigns);
            const weavingTechniquesOptions = Array.from(allWeavingTechniques);
            const badgeOptions = Array.from(allBadges);

            // Format response to match FilterWrapper.jsx structure
            const filters = [
                {
                    title: "Fabric",
                    operator: "$contains",
                    options: fabricTypeOptions,
                },
                {
                    title: "Motif & Design",
                    operator: "$contains",
                    options: motifAndDesignsOptions,
                },
                {
                    title: "Weaving Technique",
                    operator: "$contains",
                    options: weavingTechniquesOptions,
                },
                {
                    title: "Colour",
                    operator: "$contains",
                    options: colorOptions,
                },
                {
                    title: "Size",
                    operator: "$contains",
                    options: sizeOptions,
                },

                {
                    title: "Availability",
                    operator: "$contains",
                    options: badgeOptions,
                },
            ];

            return ctx.send({
                data: filters,
            });
        } catch (error) {
            console.error("Error fetching product filters:", error);
            return ctx.internalServerError("An error occurred while fetching product filters");
        }
    },

    async getHomePageData(ctx) {
        try {
            const homePageData = await strapi.documents("api::home-page.home-page").findMany({
                populate: {
                    Hero_Section: {
                        populate: {
                            Media: true,
                        },
                    },
                    Top_Nav: {
                        populate: {
                            Link: {
                                populate: {
                                    Media: true,
                                    SubLinks: true,
                                },
                            },
                            Categories: true,
                            Collections: true,
                            Curation_And_Revivals: true,
                            Fabric_Types: true,
                            Motif_And_Designs: true,
                            Weaving_Techniques: true,
                        },
                    },
                    Shop_Section: {
                        populate: {
                            Products: {
                                populate: {
                                    Thumbnail: true,
                                },
                            },
                            Media: true,
                        },
                    },
                    Advertisement_Section: {
                        populate: {
                            Media: true,
                            Button: true,
                        },
                    },
                    Shop_By_Category: true,
                    Shop_By_Collection: true,
                    Ready_To_Ship: {
                        populate: {
                            Button: true,
                            Media: true,
                        },
                    },
                    Connect_Us: {
                        populate: {
                            Connect_Us_Items: {
                                populate: {
                                    Address: true,
                                },
                            },
                        },
                    },
                    Book_An_Appointment: {
                        populate: {
                            Address: true,
                            Button: true,
                            Media: true,
                        },
                    },
                    Instagram_Section: {
                        populate: {
                            Instagram_Cards: {
                                populate: {
                                    Thumbnail: true,
                                },
                            },
                        },
                    },
                },
            });

            return ctx.send({ data: homePageData?.[0] ?? {} });
        } catch (error) {
            console.error("Error fetching home page data:", error);
            return ctx.internalServerError("An error occurred while fetching home page data.");
        }
    },

    async getProducts(ctx) {
        try {
            let search = ctx.query.search;
            let filters = {};
            if (search) {
                filters = {
                    Name: { $contains: search },
                };
            }
            // Get top 50 products with their price information
            const products = await strapi.documents("api::product.product").findMany({
                filters: filters,
                status: "published",
            });

            // Process products to include price information
            const processedProducts = products.map((product) => {
                return {
                    documentId: product.documentId,
                    name: product.Name,
                };
            });

            return ctx.send({
                message: "Top 50 products retrieved successfully",
                products: processedProducts,
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            return ctx.internalServerError("An error occurred while fetching products");
        }
    },

    async updateAllProductPriceFilters() {
        try {
            const BATCH_SIZE = 50; // Process 50 products at a time
            const products = await strapi.documents("api::product.product").findMany({
                sort: {
                    Name: "asc",
                },
            });

            // Process products in batches
            for (let i = 0; i < products.length; i += BATCH_SIZE) {
                const batch = products.slice(i, i + BATCH_SIZE);
                const batchOperations = batch.map((product) => ({
                    documentId: product.documentId,
                    status: "published",
                }));

                // Execute batch operations
                await Promise.all(
                    batchOperations.map((op) =>
                        strapi.documents("api::product.product").update({
                            documentId: op.documentId,
                            status: "published",
                        })
                    )
                );

                console.log(`Processed batch ${i / BATCH_SIZE + 1} of ${Math.ceil(products.length / BATCH_SIZE)}`);
            }

            console.log("Product publish process completed!");
            return {
                message: "Product publish process completed",
            };
        } catch (error) {
            console.error("Error publishing products:", error);
            throw error;
        }
    },
};
