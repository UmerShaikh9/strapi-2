import { factories } from "@strapi/strapi";
import axios from "axios";
import { processCartItems } from "../../cart/controllers/helpers";
import crypto from "crypto";
import { convertCurrency, formatPrice, ITemplateOrderDetails } from "./orderUtils";
import { generateOrderConfirmationEmail } from "./emailTemplates";
const qs = require("querystring");

const CCAVENUE_MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;
const CCAVENUE_WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
const CCAVENUE_ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
const CCAVENUE_REDIRECT_URL = process.env.CCAVENUE_REDIRECT_URL;
const CCAVENUE_API_URL = process.env.CCAVENUE_API_URL;
const BACKEND_URL = process.env.BACKEND_URL;

export default factories.createCoreController("api::order.order", ({ strapi }) => ({
    async createCCAvenueOrder(ctx) {
        try {
            console.log("createCCAvenueOrder called with body:", ctx.request.body);

            // Get the authenticated user ID if available
            const id = ctx.state.user?.id;
            // Get guest session ID from request
            const guestSessionId = ctx.request.body?.guestSessionId;

            const {
                Full_Name,
                Address,
                City,
                Country,
                Email,
                Phone,
                State,
                Pincode,
                amount,
                currency,
                couponId,
                cartIds,
                Shipping_Full_Name,
                Shipping_Country,
                Shipping_State,
                Shipping_Phone,
                Shipping_Address,
                Shipping_Email,
                Shipping_City,
                Shipping_Pincode,
            } = ctx.request.body;

            // Validate required fields
            if (!Full_Name || !Address || !City || !Country || !Email || !Phone || !State || !Pincode) {
                return ctx.badRequest("Missing required fields");
            }

            if (!cartIds || cartIds?.length === 0) {
                return ctx.badRequest("Please select at least one product");
            }

            let userId = id;
            let isGuestUser = false;

            // If user is not logged in, check if user with this email exists
            if (!userId) {
                if (!Email || !Full_Name || !Phone) {
                    return ctx.badRequest("Email, Full Name, and Phone are required for guest checkout");
                }

                // Check if user with this email already exists
                const existingUser = await strapi.plugins["users-permissions"].services.user.fetchAll({
                    filters: { email: Email },
                    limit: 1,
                });
                console.log("existing user ", existingUser);

                if (!existingUser || existingUser.length == 0) {
                    // Generate a random password
                    const randomPassword = Math.random().toString(36).slice(-8);

                    // Create a new user account
                    // const newUser = await strapi.plugins["users-permissions"].services.user.add({
                    //     username: Email,
                    //     email: Email,
                    //     password: randomPassword,
                    //     provider: "local",
                    //     confirmed: true,
                    //     blocked: false,
                    //     fullName: Full_Name,
                    //     phone: Phone,
                    //     address: Address,
                    //     city: City,
                    //     country: Country,
                    //     state: State,
                    //     pincode: Pincode,
                    // });

                    userId = null;
                    isGuestUser = true;

                    // Send email with login credentials
                    try {
                        // await strapi.plugins["email"].services.email.send({
                        //     to: Email,
                        //     subject: "Your Banarasi Baithak Account",
                        //     text: `Thank you for your order! We've created an account for you.\n\nYour login credentials:\nEmail: ${Email}\nPassword: ${randomPassword}\n\nYou can change your password after logging in.`,
                        //     html: `
                        //         <h1>Welcome to Banarasi Baithak!</h1>
                        //         <p>Thank you for your order! We've created an account for you.</p>
                        //         <p><strong>Your login credentials:</strong></p>
                        //         <p>Email: ${Email}</p>
                        //         <p>Password: ${randomPassword}</p>
                        //         <p>You can change your password after logging in.</p>
                        //     `,
                        // });
                    } catch (emailError) {
                        console.error("Error sending email:", emailError);
                        // Continue with the order process even if email fails
                    }
                } else {
                    userId = existingUser[0].id;
                }

                console.log("user id ", userId);
                // If this was a guest user, update the cart items to associate them with the new user
                // if (guestSessionId) {
                //     // Find all cart items with the guest session ID
                //     const guestCartItems = await strapi.documents("api::cart.cart").findMany({
                //         filters: { GuestSessionId: guestSessionId },
                //         status: "published",
                //     });

                //     console.log("guestSession data ", guestCartItems);

                //     if (guestCartItems && guestCartItems.length > 0) {
                //         // Process all cart items in parallel using Promise.all
                //         await Promise.all(
                //             guestCartItems.map((cartItem) =>
                //                 strapi.documents("api::cart.cart").update({
                //                     documentId: cartItem.documentId,
                //                     data: {
                //                         User: { id: userId },
                //                     },
                //                     status: "published",
                //                 })
                //             )
                //         );

                //         console.log(`Transferred ${guestCartItems.length} cart items from guest session to user account`);
                //     }
                // }
            }

            // Fetch user's cart items based on whether user is authenticated or guest
            let cartFilter = {};
            if (userId) {
                cartFilter = { User: { id: userId } };
            } else if (guestSessionId) {
                cartFilter = { GuestSessionId: guestSessionId };
            } else {
                return ctx.badRequest("Either user authentication or guest session ID is required.");
            }

            let carts = await strapi.documents("api::cart.cart").findMany({
                filters: cartFilter,
                populate: {
                    Product: { populate: { Product: true } },
                    User: true,
                },
                status: "published",
            });

            if (!carts || carts.length === 0) {
                return ctx.badRequest("Cart is empty");
            }

            // Check soft hold dates before proceeding
            const softHoldValid = await checkSoftHoldDates(carts);
            if (softHoldValid) {
                return ctx.badRequest("some products is in soft hold");
            }

            // Process cart items and calculate total price
            let cartsData = carts?.map((cart) => ({
                ...cart,
                Product: {
                    ...cart?.Product,
                    Product: cart?.Product?.Product?.documentId,
                },
            }));

            // Process cart items (handling price and image things)
            await processCartItems(cartsData, userId);

            // Fetch updated cart items after processing, filtered by cartIds
            let updatedCarts = await strapi.documents("api::cart.cart").findMany({
                filters: { ...cartFilter, documentId: { $in: cartIds } },
                populate: {
                    Product: { populate: { Product: true } },
                    User: true,
                },
                status: "published",
            });

            console.log("updatedCarts", updatedCarts);

            // Validate required fields
            if (updatedCarts?.length === 0) {
                return ctx.badRequest("no product selected for order");
            }

            let totalPriceINR = 0;
            const products = [];

            for (let cart of updatedCarts) {
                totalPriceINR += cart.Total_Price;
                // Create a new product object with the correct structure
                const productData = {
                    ...cart.Product,
                    Product: cart.Product?.Product?.documentId,
                };
                products.push(productData);
            }

            // Handle coupon if provided
            let finalAmount = totalPriceINR;
            let couponPayload = {};
            if (couponId) {
                console.log("coupon code present ", couponId);
                const couponDetails = await strapi.documents("api::coupon.coupon").findOne({ documentId: couponId });
                if (!couponDetails) {
                    return ctx.badRequest("Invalid Coupon Code");
                }
                console.log("coupon details ", couponDetails);
                finalAmount = totalPriceINR - couponDetails?.Price;
                couponPayload = {
                    Coupon: couponId,
                };
            }

            // Calculate shipping charges
            let shippingCharges = 0;
            if (Shipping_Country !== "India") {
                console.log("Shipping Country ", Shipping_Country);
                if (finalAmount <= 50000) {
                    shippingCharges = 3000; // Flat 3000 INR for international orders under 50000
                }
            }
            finalAmount += shippingCharges;

            // Convert currency if needed
            const TotalPrice = convertCurrency({ totalPriceINR: finalAmount, currency });

            // Generate a unique order ID
            const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

            // Create order in database
            const orderDetails = await strapi.documents("api::order.order").create({
                data: {
                    Products: products,
                    User: userId || null, // Allow null for guest users
                    Total_Price: TotalPrice,
                    Payment_Details: {
                        Amount: TotalPrice,
                        Payment_Status: "INITIATED",
                        Order_Uid: orderId,
                        Payment_Method: "CCAVENUE",
                    },
                    Order_Status: "PENDING",
                    Currency: currency || "INR",
                    Full_Name,
                    Address,
                    City,
                    Country,
                    State,
                    Pincode,
                    Email,
                    Phone,
                    GuestSessionId: guestSessionId || null, // Store guest session ID
                    ...couponPayload,
                    Shipping_Charges: shippingCharges,
                    Shipping_Details: {
                        Shipping_Full_Name,
                        Shipping_Country,
                        Shipping_State,
                        Shipping_Phone,
                        Shipping_Address,
                        Shipping_Email,
                        Shipping_City,
                        Shipping_Pincode,
                    },
                },
                status: "published",
            });

            // Format amount to 2 decimal places and convert to string
            const formattedAmount = TotalPrice;

            // Prepare data for CCAvenue
            const orderData = {
                merchant_id: CCAVENUE_MERCHANT_ID,
                order_id: orderId,
                currency: currency || "INR",
                amount: formattedAmount,
                redirect_url: `${BACKEND_URL}/api/order/ccavenue/callback`,
                cancel_url: `${BACKEND_URL}/api/order/error-callback`,
                language: "EN",
                billing_name: Full_Name,
                billing_address: Address,
                billing_city: City,
                billing_state: State,
                billing_zip: Pincode,
                billing_country: Country,
                billing_tel: Phone,
                billing_email: Email,
                delivery_name: Full_Name,
                delivery_address: Address,
                delivery_city: City,
                delivery_state: State,
                delivery_zip: Pincode,
                delivery_country: Country,
                delivery_tel: Phone,
                merchant_param1: orderDetails.documentId, // Store order document ID for reference
                integration_type: "REDIRECT",
                guestSessionId: guestSessionId || "",
            };

            // Convert order data to string format
            const postData = qs.stringify(orderData);

            // Encrypt the data
            const encRequest = encrypt(postData, CCAVENUE_WORKING_KEY);
            console.log("encRequest", encRequest);
            const decRequest = decrypt(encRequest, CCAVENUE_WORKING_KEY);
            console.log("decRequest", decRequest);

            // Create HTML form for redirection
            const htmlForm = `
                <form id="nonseamless" method="post" name="redirect" action="${CCAVENUE_API_URL}">
                    <input type="hidden" name="command" value="initiateTransaction" />
                    <input type="hidden" name="encRequest" value="${encRequest}" />
                    <input type="hidden" name="access_code" value="${CCAVENUE_ACCESS_CODE}" />
                </form>
                <script type="text/javascript">document.redirect.submit();</script>
            `;

            return ctx.send({
                success: true,
                message: "Order created successfully",
                orderId: orderId,
                order: orderDetails,
                paymentForm: htmlForm,
                redirectUrl: CCAVENUE_API_URL,
                isGuestUser,
            });
        } catch (error) {
            console.error("Error creating CCAvenue order:", error);
            return ctx.throw(500, {
                success: false,
                message: error.message || "Error creating CCAvenue order",
            });
        }
    },

    async handleCCAvenueCallback(ctx) {
        try {
            console.log("handleCCAvenueCallback called with body:", ctx.request.body);

            const { encResp, order_id, tracking_id, bank_ref_no, merchant_param1 } = ctx.request.body;
            console.log("handleCCAvenueCallback order id", order_id);

            if (!encResp) {
                console.error("No encrypted response received");
                return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?error=no_response`);
            }

            // Decrypt the response
            const decryptedData = decrypt(encResp, CCAVENUE_WORKING_KEY);
            console.log("Decrypted response:", decryptedData);

            // Parse the decrypted data
            const responseData = qs.parse(decryptedData);
            console.log("Parsed response data:", responseData);

            const order_status = responseData?.order_status;

            // Get the order document ID from merchant_param1
            const orderDocumentId = merchant_param1 || responseData.merchant_param1;

            if (!orderDocumentId) {
                console.error("No order document ID found in response");
                return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?error=invalid_order`);
            }

            // // Update order status in database
            const order = await strapi.documents("api::order.order").findOne({
                documentId: orderDocumentId,
                status: "published",
                populate: {
                    Products: {
                        populate: {
                            Product: { populate: { Thumbnail: true } },
                        },
                    },
                    Payment_Details: true,
                    User: true,
                    Shipping_Details: true,
                },
            });

            if (!order) return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?error=order_not_found`);

            console.log("order details ", order);

            // Update order with payment details
            await strapi.documents("api::order.order").update({
                documentId: orderDocumentId,
                data: {
                    Payment_Details: {
                        Amount: order?.Payment_Details?.Amount,
                        Payment_Status: order_status == "Success" ? "COMPLETED" : "FAILED",
                        Order_Uid: order?.Payment_Details?.Order_Uid,
                        Paypal_Response: responseData as any,
                    },
                    Order_Status: order_status == "Success" ? "CONFIRMED" : "PENDING",
                },
                status: "published",
            });

            // If payment is successful, update product quantities and clear cart

            if (order_status === "Success") {
                // Update product quantities
                console.log("transaction success");
                for (let product of order.Products) {
                    //Decrement product quantiy
                    await strapi.documents("api::product.product").update({
                        documentId: product.Product?.documentId,
                        data: {
                            Quantity: product?.Product?.Quantity - (product?.Quantity ?? 1),
                        },
                        status: "published",
                    });
                }

                // Clear only the ordered products from user's cart
                // Get cart items based on whether user is authenticated or guest
                let cartFilter = {};
                if (order?.User && order?.User?.id) {
                    cartFilter = { User: { documentId: order.User.documentId } };
                } else if (order?.GuestSessionId) {
                    cartFilter = { GuestSessionId: order.GuestSessionId };
                }

                if (Object.keys(cartFilter).length > 0) {
                    const carts = await strapi.documents("api::cart.cart").findMany({
                        filters: cartFilter,
                        populate: {
                            Product: { populate: { Product: true } },
                        },
                        status: "published",
                    });

                    // Create a map of product IDs from the order
                    const orderedProductIds = order.Products.map((product) => product.Product?.documentId);

                    // Only delete cart items that were included in the order
                    for (let cart of carts) {
                        if (orderedProductIds?.includes(cart.Product?.Product?.documentId)) {
                            await strapi.documents("api::cart.cart").delete({
                                documentId: cart.documentId,
                            });
                        }
                    }
                }

                let shippingCharges = 0;
                if (order.Shipping_Charges) {
                    shippingCharges = parseFloat(convertCurrency({ totalPriceINR: order.Shipping_Charges, currency: order.Currency }));
                }

                // Format order details for the email template
                const orderDetails: ITemplateOrderDetails = {
                    orderNumber: order.Payment_Details?.Order_Uid,
                    orderDate: new Date(order.createdAt).toLocaleDateString(),
                    totalAmount: formatPrice(order.Total_Price, order.Currency),
                    customerName: `${order.Shipping_Details.Shipping_Full_Name}! `,
                    shippingAddress: {
                        name: order.Shipping_Details.Shipping_Full_Name,
                        address: order.Shipping_Details.Shipping_Address,
                        city: order.Shipping_Details.Shipping_City,
                        state: order.Shipping_Details.Shipping_State,
                        pincode: order.Shipping_Details.Shipping_Pincode,
                        email: order.Shipping_Details.Shipping_Email,
                        phone: order.Shipping_Details.Shipping_Phone,
                        country: order.Shipping_Details.Shipping_Country,
                    },
                    billingAddress: {
                        name: order.Full_Name,
                        address: order.Address,
                        city: order.City,
                        state: order.State,
                        pincode: order.Pincode,
                        email: order.Email,
                        phone: order.Phone,
                        country: order.Country,
                    },
                    items: order.Products.map((item) => {
                        const price = parseFloat(convertCurrency({ totalPriceINR: item.Price, currency: order.Currency }));
                        let discountedPrice = 0;

                        if (item.Discount_Available) {
                            discountedPrice = parseFloat(
                                convertCurrency({ totalPriceINR: item.Discounted_Price, currency: order.Currency })
                            );
                        }

                        console.log(`price ${price} currency ${order.Currency}`);
                        console.log(`formatted price ${formatPrice(price, order.Currency)}`);

                        return {
                            name: item.Product.Name,
                            price: formatPrice(price, order.Currency),
                            image: item.Product.Thumbnail?.url,
                            quantity: item?.Quantity,
                            Discount_Available: item.Discount_Available,
                            Discounted_Price: formatPrice(discountedPrice, order.Currency),
                        };
                    }),
                    shippingCharges: formatPrice(shippingCharges, order.Currency),
                    subTotal: formatPrice(order.Total_Price - shippingCharges, order.Currency),
                };

                console.log("orderDetails", orderDetails);

                try {
                    // Generate the email HTML
                    const emailHtml = generateOrderConfirmationEmail(orderDetails);

                    // Send the email
                    await strapi.plugins["email"].services.email.send({
                        to: order.Email,
                        subject: `Order Confirmation - #${order.Payment_Details?.Order_Uid}`,
                        html: emailHtml,
                    });
                } catch (error) {
                    console.error("Error sending email:", error);
                }

                try {
                    const adminEmailHtml = generateOrderConfirmationEmail(orderDetails);

                    await strapi.plugins["email"].services.email.send({
                        to: "sales@banarasibaithak.com",
                        subject: `New Order - #${order.Payment_Details?.Order_Uid}`,
                        html: adminEmailHtml,
                    });
                } catch (error) {
                    console.error("Error sending email:", error);
                }

                return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/my-order?payment=success&order_id=${order_id}`);
            }

            return ctx.redirect(
                `${CCAVENUE_REDIRECT_URL}/payment-failed?tracking_id=${responseData?.tracking_id}&status=${responseData?.order_status}&order_id=${responseData?.order_id}&error=${responseData?.status_message}`
            );
        } catch (error) {
            console.error("Error handling CCAvenue callback:", error);
            return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?error=processing_error`);
        }
    },

    async handleCCAvenueErrorCallback(ctx) {
        try {
            console.log("handleCCAvenueErrorCallback called with body:", ctx.request.body);

            const { encResp, order_id, tracking_id, bank_ref_no, order_status, merchant_param1 } = ctx.request.body;

            // Log the error details
            console.error("CCAvenue payment failed:", {
                order_id,
                tracking_id,
                bank_ref_no,
                order_status,
                merchant_param1,
            });

            return ctx.redirect(
                `${CCAVENUE_REDIRECT_URL}/payment-failed?tracking_id=${tracking_id}&status=${order_status}&order_id=${order_id}`
            );
        } catch (error) {
            console.error("Error handling CCAvenue error callback:", error);
            return ctx.redirect(`${CCAVENUE_REDIRECT_URL}/payment-failed?error=processing_error`);
        }
    },
}));

const encrypt = (plainText, workingKey) => {
    try {
        // Generate key using MD5 hash of workingKey
        const key = crypto.createHash("md5").update(workingKey).digest();

        // Fixed IV used by CCAvenue
        const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);

        const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
        let encrypted = cipher.update(plainText, "utf8", "hex");
        encrypted += cipher.final("hex");

        return encrypted;
    } catch (err) {
        console.error("Encryption error:", err);
        throw err;
    }
};

const decrypt = (encryptedText, workingKey) => {
    try {
        console.log("Decrypting data with key:", workingKey);
        console.log("Data to decrypt:", encryptedText);

        // Create MD5 hash of the working key
        const key = crypto.createHash("md5").update(workingKey).digest();

        // Fixed IV used by CCAvenue
        const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);

        // Create decipher
        const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

        // Decrypt the data
        let decrypted = decipher.update(encryptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");

        console.log("Decryption successful");
        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error);
        throw error;
    }
};

const checkSoftHoldDates = async (carts) => {
    try {
        const currentDate = new Date();

        console.log("I am in checkSoftHoldDates");

        // Get all product IDs from the carts
        const productIds = carts.map((cart) => cart.Product?.Product?.documentId).filter(Boolean);

        if (productIds.length === 0) {
            return true; // No products to check
        }

        // Fetch all products with their soft hold dates
        const products = await strapi.documents("api::product.product").findMany({
            filters: { documentId: { $in: productIds } },
            populate: {},
            status: "published",
        });

        // Check if any product has a soft hold date less than current date
        for (const product of products) {
            if ((product.Soft_Hold && new Date(product.Soft_Hold) > currentDate) || product.Quantity <= 0) {
                return true;
            }
        }

        // Add 10 minutes to current date
        const softHoldDate = new Date(currentDate.getTime() + 10 * 60000); // 10 minutes in milliseconds

        console.log("updating soft hold for all products");

        // Update soft hold for all products with individual error handling
        // Use a more targeted update to avoid triggering relationship updates
        const updateResults = await Promise.allSettled(
            productIds.map(async (id) => {
                try {
                    // Use direct database update to avoid Strapi's relationship handling
                    await strapi.db.query("api::product.product").update({
                        where: { documentId: id },
                        data: {
                            Soft_Hold: softHoldDate,
                        },
                    });
                    console.log(`✅ Successfully updated soft hold for product ${id}`);
                    return { success: true, productId: id };
                } catch (updateError) {
                    console.error(`❌ Error updating product ${id}:`, updateError);

                    // If direct update fails, try the Strapi document update as fallback
                    try {
                        await strapi.documents("api::product.product").update({
                            documentId: id,
                            data: {
                                Soft_Hold: softHoldDate,
                            },
                            status: "published",
                        });
                        console.log(`✅ Fallback update successful for product ${id}`);
                        return { success: true, productId: id };
                    } catch (fallbackError) {
                        console.error(`❌ Fallback update also failed for product ${id}:`, fallbackError);
                        return { success: false, productId: id, error: fallbackError };
                    }
                }
            })
        );

        // Check if any updates failed
        const failedUpdates = updateResults.filter(
            (result) => result.status === "rejected" || (result.status === "fulfilled" && !result.value.success)
        );

        if (failedUpdates.length > 0) {
            console.error(`⚠️ ${failedUpdates.length} product updates failed:`, failedUpdates);
            // Continue with the order process even if some updates fail
            // This prevents the entire order from failing due to soft hold update issues
        }

        const successfulUpdates = updateResults.filter((result) => result.status === "fulfilled" && result.value.success);

        console.log(`✅ Successfully updated soft hold for ${successfulUpdates.length}/${productIds.length} products`);

        return false; // All products have valid soft hold dates
    } catch (error) {
        console.error("Error checking soft hold dates:", error);

        // Log additional error details for debugging
        if (error.code === "ER_DUP_ENTRY") {
            console.error("Duplicate entry error detected - this might be related to wishlist relationships");
            console.error("Error details:", {
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
            });
        }

        return false; // Return false on error to be safe
    }
};
