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

            // Convert sets to arrays
            const sizeOptions = Array.from(allSizes);
            const colorOptions = Array.from(allColors);
            const fabricTypeOptions = Array.from(allFabricTypes);
            const badgeOptions = Array.from(allBadges);

            // Format response to match FilterWrapper.jsx structure
            const filters = [
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
                    title: "Fabric",
                    operator: "$contains",
                    options: fabricTypeOptions,
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
