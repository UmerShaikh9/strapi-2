import { factories } from "@strapi/strapi";
import axios from "axios";
import { processCartItems } from "../../cart/controllers/helpers";
import crypto from "crypto";
import { convertCurrency } from "./orderUtils";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_API = process.env.PAYPAL_API;

export default factories.createCoreController("api::order.order", ({ strapi }) => ({
    async createOrder(ctx) {
        try {
            // Get the authenticated user ID if available
            const id = ctx.state.user?.id;
            // Get guest session ID from request
            const guestSessionId = ctx.request.body?.guestSessionId;

            // Remove authentication requirement
            // if (!id) {
            //     return ctx.unauthorized("You must be logged in to create an order.");
            // }

            const { Full_Name, Address, City, Country, Email, Phone, State, Pincode, amount, currency, couponId, cartIds } =
                ctx.request.body;

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
                    const newUser = await strapi.plugins["users-permissions"].services.user.add({
                        username: Email,
                        email: Email,
                        password: randomPassword,
                        provider: "local",
                        confirmed: true,
                        blocked: false,
                        fullName: Full_Name,
                        phone: Phone,
                        address: Address,
                        city: City,
                        country: Country,
                        state: State,
                        pincode: Pincode,
                    });

                    userId = newUser.id;
                    isGuestUser = true;

                    // Send email with login credentials
                    try {
                        await strapi.plugins["email"].services.email.send({
                            to: Email,
                            subject: "Your Banarasi Baithak Account",
                            text: `Thank you for your order! We've created an account for you.\n\nYour login credentials:\nEmail: ${Email}\nPassword: ${randomPassword}\n\nYou can change your password after logging in.`,
                            html: `
                                <h1>Welcome to Banarasi Baithak!</h1>
                                <p>Thank you for your order! We've created an account for you.</p>
                                <p><strong>Your login credentials:</strong></p>
                                <p>Email: ${Email}</p>
                                <p>Password: ${randomPassword}</p>
                                <p>You can change your password after logging in.</p>
                            `,
                        });
                    } catch (emailError) {
                        console.error("Error sending email:", emailError);
                        // Continue with the order process even if email fails
                    }
                } else {
                    userId = existingUser[0].id;
                }

                console.log("user id ", userId);
                // If this was a guest user, update the cart items to associate them with the new user
                if (guestSessionId) {
                    // Find all cart items with the guest session ID
                    const guestCartItems = await strapi.documents("api::cart.cart").findMany({
                        filters: { GuestSessionId: guestSessionId },
                        status: "published",
                    });

                    console.log("guestSession data ", guestCartItems);

                    if (guestCartItems && guestCartItems.length > 0) {
                        // Process all cart items in parallel using Promise.all
                        await Promise.all(
                            guestCartItems.map((cartItem) =>
                                strapi.documents("api::cart.cart").update({
                                    documentId: cartItem.documentId,
                                    data: {
                                        User: { id: userId },
                                    },
                                    status: "published",
                                })
                            )
                        );

                        console.log(`Transferred ${guestCartItems.length} cart items from guest session to user account`);
                    }
                }
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

            // Process cart items and calculate total price
            let cartsData = carts?.map((cart) => ({
                ...cart,
                Product: {
                    ...cart?.Product,
                    Product: cart?.Product?.Product?.documentId,
                },
            }));

            // Process cart items (handling price and image things)
            if (userId) {
                await processCartItems(cartsData, userId);
            }

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
                return ctx.badRequest("No products selected for order");
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
            if (Country !== "India") {
                if (finalAmount <= 30000) {
                    shippingCharges = 2500; // Flat 2500 INR for international orders under 30000
                }
            }
            finalAmount += shippingCharges;

            // Convert currency if needed
            const TotalPrice = convertCurrency({ totalPriceINR: finalAmount, currency });

            // Create PayPal order
            const response = await axios.post(
                `${PAYPAL_API}/v2/checkout/orders`,
                {
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: currency,
                                value: TotalPrice,
                            },
                        },
                    ],
                },
                {
                    auth: { username: PAYPAL_CLIENT_ID, password: PAYPAL_SECRET },
                    headers: { "Content-Type": "application/json" },
                }
            );

            // Create order in database
            const orderDetails = await strapi.documents("api::order.order").create({
                data: {
                    Products: products,
                    User: userId || null, // Allow null for guest users
                    Total_Price: TotalPrice,
                    Payment_Details: {
                        Amount: TotalPrice,
                        Payment_Status: "INITIATED",
                        Order_Uid: response?.data?.id,
                        Payment_Method: "PAYPAL",
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
                },
                status: "published",
            });

            return ctx.send({
                success: true,
                message: "Order created successfully",
                orderId: response?.data?.id,
                order: orderDetails,
                isGuestUser,
            });
        } catch (error) {
            console.error("Error creating PayPal order:", error);
            return ctx.throw(500, {
                success: false,
                message: error.message || "Error creating PayPal order",
            });
        }
    },

    async captureOrder(ctx) {
        try {
            // Get the authenticated user ID if available
            const id = ctx.state.user?.id;
            // Get guest session ID from request
            const guestSessionId = ctx.request.body?.guestSessionId;
            console.log("capture order called");

            const { orderID } = ctx.request.body;
            console.log("body", ctx.request.body);

            //find order based on razorpay order id
            const orders = await strapi.documents("api::order.order").findMany({
                filters: {
                    Payment_Details: {
                        Order_Uid: orderID,
                    },
                },
                populate: {
                    Payment_Details: true,
                    Products: {
                        populate: { Product: true },
                    },
                },
                status: "published",
            });

            if (!orders || orders.length === 0) {
                return ctx.notFound("Payment record not found");
            }

            // Capture PayPal Payment
            const response = await axios.post(
                `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
                {},
                {
                    auth: { username: PAYPAL_CLIENT_ID, password: PAYPAL_SECRET },
                    headers: { "Content-Type": "application/json" },
                }
            );

            const order = orders[0];

            await strapi.documents("api::order.order").update({
                documentId: order.documentId,
                data: {
                    Payment_Details: {
                        Amount: order?.Payment_Details?.Amount,
                        Payment_Status: response?.data.status,
                        Order_Uid: orderID,
                        Paypal_Response: response?.data as any,
                    },
                },
                status: "published",
            });

            if (response?.data?.status === "COMPLETED") {
                // Update product quantities
                for (let product of order.Products) {
                    //Decrement product quantiy
                    await strapi.documents("api::product.product").update({
                        documentId: product.Product?.documentId,
                        data: {
                            Quantity: product?.Product?.Quantity - 1,
                        },
                        status: "published",
                    });
                }

                // Clear only the ordered products from user's cart
                // Get cart items based on whether user is authenticated or guest
                let cartFilter = {};
                const orderWithUser = order as any; // Type assertion to avoid linter errors
                if (orderWithUser.User && orderWithUser.User.id) {
                    cartFilter = { User: { documentId: orderWithUser.User.documentId } };
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
                        if (orderedProductIds.includes(cart.Product?.Product?.documentId)) {
                            await strapi.documents("api::cart.cart").delete({
                                documentId: cart.documentId,
                            });
                        }
                    }
                }
            }

            return ctx.send({ success: true, message: "Payment success", data: response?.data });
        } catch (error) {
            ctx.throw(500, error.response?.data || "Error capturing payment");
        }
    },
}));
