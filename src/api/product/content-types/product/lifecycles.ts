export default {
    async afterUpdate(event) {
        const { result } = event;

        console.log("result", result);

        // Check if quantity is 0
        if (result.Quantity === 0 && !result.Badges.includes("Sold Out")) {
            // Update the product to set Badges as "sold out" using query API
            await strapi.documents("api::product.product").update({
                documentId: result.documentId,
                data: {
                    Badges: ["Sold Out"],
                },
            });
        }
    },
};
