export default {
    async afterCreate(event) {
        const { result } = event;

        // Check if Price_Section exists and has items
        if (!result.Price_Section || !Array.isArray(result.Price_Section) || result.Price_Section.length === 0) {
            return;
        }

        // Get the highest price from Price_Section
        const highestPrice = Math.max(...result.Price_Section.map((ps) => ps.Price || 0));

        console.log("result", result);
        console.log("highestPrice", highestPrice);

        // Prepare update data
        const updateData: any = {};

        // Add price filter update if different
        if (result.Price_Filter !== highestPrice) {
            updateData.Price_Filter = highestPrice;
        }

        // Add badge update if needed
        if (result.Quantity === 0 && !result.Badges.includes("Sold Out")) {
            updateData.Badges = ["Sold Out"];
        }

        // Only make update call if there are changes
        if (Object.keys(updateData).length > 0) {
            await strapi.documents("api::product.product").update({
                documentId: result.documentId,
                data: updateData,
                status: "published",
            });
        }
    },

    async afterUpdate(event) {
        const { result } = event;

        // Check if Price_Section exists and has items
        if (!result.Price_Section || !Array.isArray(result.Price_Section) || result.Price_Section.length === 0) {
            return;
        }

        // Get the highest price from Price_Section
        const highestPrice = Math.max(...result.Price_Section.map((ps) => ps.Price || 0));

        console.log("result", result);
        console.log("highestPrice", highestPrice);

        // Prepare update data
        const updateData: any = {};

        // Add price filter update if different
        if (result.Price_Filter !== highestPrice) {
            updateData.Price_Filter = highestPrice;
        }

        // Add badge update if needed
        if (result.Quantity <= 0 && !result.Badges.includes("Sold Out")) {
            updateData.Badges = ["Sold Out"];
        }

        // Only make update call if there are changes
        if (Object.keys(updateData).length > 0) {
            await strapi.documents("api::product.product").update({
                documentId: result.documentId,
                data: updateData,
                status: "published",
            });
        }
    },
};
