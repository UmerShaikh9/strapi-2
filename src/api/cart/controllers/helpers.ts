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
