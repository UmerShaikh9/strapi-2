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

        console.log(`[processCartItems] process product ids ${productIds}`);

        // Batch fetch all products in a single query
        const products = await strapi.documents("api::product.product").findMany({
            filters: { documentId: { $in: productIds } },
            populate: { Price_Section: true },
        });

        console.log(`[processCartItems] process fetched products ${products?.length}`);

        // Create a map for quick product lookup
        const productMap = new Map(products.map((p) => [p.documentId, p]));

        // Prepare batch operations
        const updateOperations = [];
        const deleteOperations = [];

        // Process all cart items
        for (const cart of carts) {
            const { Product, Type } = cart;
            const productId = Product?.Product;

            console.log(`process product from cart productId ${productId} `);

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

            console.log(`[processCartItems] vaidate product is live or not`);
            // Find matching price section
            const liveProduct = productExists.Price_Section?.find((item) => item.Option === Product?.Option);

            if (!liveProduct) {
                console.log(`this product is not live  ${liveProduct}`);
                deleteOperations.push(cart.documentId);
                continue;
            }

            const Total_Price = (liveProduct.Discount_Available ? liveProduct.Discounted_Price : liveProduct.Price) * Product?.Quantity;

            // Prepare new payload
            const newPayload = {
                Type,
                Total_Price: Total_Price,
                Product: {
                    Size: Product?.Size,
                    Color: Product?.Color,
                    Discount_Available: liveProduct?.Discount_Available,
                    Option: Product?.Option,
                    Product: Product?.Product,
                    Quantity: Product?.Quantity,
                    Price: liveProduct.Price,
                    Discounted_Price: liveProduct.Discounted_Price,
                },
            };

            // Check if any values have actually changed
            const hasChanges =
                cart.Type !== newPayload.Type ||
                cart.Total_Price !== newPayload.Total_Price ||
                cart.Product.Size !== newPayload.Product.Size ||
                cart.Product.Color !== newPayload.Product.Color ||
                cart.Product.Discount_Available !== newPayload.Product.Discount_Available ||
                cart.Product.Option !== newPayload.Product.Option ||
                cart.Product.Quantity !== newPayload.Product.Quantity ||
                cart.Product.Price !== newPayload.Product.Price ||
                cart.Product.Discounted_Price !== newPayload.Product.Discounted_Price;

            // Only add to update operations if there are actual changes

            console.log(`[processCartItems] check file is change do the operation hasChanges=${hasChanges} `);
            if (hasChanges) {
                console.log(`[processCartItems] file is change do the operation `);
                updateOperations.push({
                    documentId: cart.documentId,
                    data: newPayload,
                });
            }
        }

        console.log("updateOperations", updateOperations);
        console.log("deleteOperations", deleteOperations);

        // Execute batch operations in parallel
        await Promise.all([
            // Delete invalid items
            ...deleteOperations.map((documentId) =>
                strapi.documents("api::cart.cart").delete({
                    documentId,
                    status: "published",
                })
            ),

            // Update valid items that have changes
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
