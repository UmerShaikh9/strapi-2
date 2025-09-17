// This file is intentionally left empty as we're reverting to the previous implementation
// where utility functions were defined directly in the controller files

import path from "path";
import { factories } from "@strapi/strapi";
import { generateOrderConfirmationEmail } from "./emailTemplates";

export interface IAddress {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    email: string;
    phone: string;
    country: string;
}

export interface ITemplateOrderDetails {
    orderNumber: string;
    orderDate: string;
    totalAmount: string;
    customerName: string;
    shippingAddress: IAddress;
    billingAddress: IAddress;
    items: Array<{
        name: string;
        price: string;
        image: string;
    }>;
    shippingCharges: Number;
    subTotal: string;
    // subtotal: string;
    // discount: string;
    // deliveryFee: string;
}

export const sendOrderConfirmationEmail = async (ctx) => {
    try {
        // Get the authenticated user ID
        // const id = ctx.state.user?.id;
        // console.log("user id", id);

        // if (!id) {
        //     return ctx.unauthorized("You must be logged in to view the orders.");
        // }

        const orders = await strapi.documents("api::order.order").findMany({
            filters: {
                Order_Status: "CONFIRMED",
                Full_Name: "Neelambari W",
                Total_Price: 9000,
            },
            sort: {
                createdAt: "desc",
            },
            populate: {
                Products: { populate: { Product: { populate: { Thumbnail: true } } } },
                User: true,
                Payment_Details: true,
                Shipping_Details: true,
            },
            status: "published",
        });

        let order = orders[0];
        if (!order) {
            throw new Error("No confirmed orders found for this user");
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
                    discountedPrice = parseFloat(convertCurrency({ totalPriceINR: item.Discounted_Price, currency: order.Currency }));
                }

                console.log(`price ${price} currency ${order.Currency}`);
                console.log(`formatted price ${formatPrice(price, order.Currency)}`);

                return {
                    name: item.Product.Name,
                    price: formatPrice(price, order.Currency),
                    image: item.Product.Thumbnail?.url,
                    Discount_Available: item.Discount_Available,
                    Discounted_Price: formatPrice(discountedPrice, order.Currency),
                    quantity: item.Quantity,
                };
            }),
            shippingCharges: formatPrice(shippingCharges, order.Currency),
            subTotal: formatPrice(order.Total_Price - shippingCharges, order.Currency),
        };

        console.log("order details ", orderDetails);

        // Generate the email HTML
        const emailHtml = generateOrderConfirmationEmail(orderDetails);

        // console.log("emailHtml", emailHtml);

        // Send the email
        await strapi.plugins["email"].services.email.send({
            to: "umer.shaikh@blackcheriemedia.com",
            subject: `Order Confirmation - #${order.Payment_Details?.Order_Uid}`,
            html: emailHtml,
        });

        return { success: true, message: "Order confirmation email sent successfully" };
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
        throw new Error("Failed to send order confirmation email");
    }
};

export default factories.createCoreController("api::order.order", ({ strapi }) => ({
    sendOrderConfirmationEmail,
}));

const exchangeRates = {
    USD: 0.012,
    EUR: 0.011,
    INR: 1,
    CAD: 0.016,
    GBP: 0.0095,
    AUD: 0.018,
    JPY: 1.78,
    SGD: 0.016,
};

export const convertCurrency = ({ totalPriceINR, currency }) => {
    const exchangeRate = exchangeRates[currency] || 1; // Default to 1 if currency not found
    return (totalPriceINR * exchangeRate).toFixed(2);
};

export const formatPrice = (price, currency) => {
    return price.toLocaleString("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};
