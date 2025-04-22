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
};
