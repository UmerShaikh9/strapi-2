export const validateRequestBody = async (body, keys) => {
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

export async function processCartItems(carts, userId, isGuestUser = false) {
    try {
        console.log("[processCartItems] execution started");

        if (!carts?.length) {
            return;
        }

        // Extract all product IDs from carts
        const productIds = carts.map((cart) => cart.Product?.Product).filter(Boolean);

        // Batch fetch all products in a single query
        const products = await strapi.documents("api::product.product").findMany({
            filters: { documentId: { $in: productIds } },
            populate: { Price_Section: true },
        });

        // Create a map for quick product lookup
        const productMap = new Map(products.map((p) => [p.documentId, p]));

        // Prepare batch operations
        const updateOperations = [];
        const deleteOperations = [];

        // Process all cart items
        for (const cart of carts) {
            const { Product, Type, Total_Price } = cart;
            const productId = Product?.Product;

            if (!productId) {
                deleteOperations.push(cart.documentId);
                continue;
            }

            const productExists = productMap.get(productId);

            // Check if product exists and has quantity
            if (!productExists || productExists.Quantity === 0) {
                deleteOperations.push(cart.documentId);
                continue;
            }

            // Find matching price section
            const liveProduct = productExists.Price_Section?.find((item) => item.Option === Product?.Option);

            if (!liveProduct) {
                deleteOperations.push(cart.documentId);
                continue;
            }

            console.log("Product ", Product);

            // Prepare update payload
            const payload = {
                Type,
                Total_Price: liveProduct.Discount_Available ? liveProduct.Discounted_Price : liveProduct.Price,
                Product: {
                    Size: Product?.Size,
                    Color: Product?.Color,
                    Discount_Available: Product?.Discount_Available,
                    Option: Product?.Option,
                    Product: Product?.Product,
                    Quantity: Product?.Quantity,
                    Price: Product.Price,
                    Discounted_Price: liveProduct.Discounted_Price,
                },
                User: { id: userId },
            };

            updateOperations.push({
                documentId: cart.documentId,
                data: payload,
            });
        }

        // Execute batch operations in parallel
        await Promise.all([
            // Delete invalid items
            ...deleteOperations.map((documentId) =>
                strapi.documents("api::cart.cart").delete({
                    documentId,
                    status: "published",
                })
            ),

            // Update valid items
            ...updateOperations.map((op) =>
                strapi.documents("api::cart.cart").update({
                    documentId: op.documentId,
                    data: op.data,
                    status: "published",
                })
            ),
        ]);

        console.log("[processCartItems] execution completed");
    } catch (error) {
        console.error("Error processing cart items:", error.message);
        throw new Error("An error occurred while processing the cart items. Please try again later.");
    }
}
