/**
 * order custom router
 */

export default {
    routes: [
        {
            method: "POST",
            path: "/order/payments-verification",
            handler: "order.paymentVerification",
            config: {
                auth: {
                    enabled: true, // Ensure the user is authenticated
                },
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/order/checkout",
            handler: "order.checkout",
            config: {
                auth: {
                    enabled: true, // Ensure the user is authenticated
                },
                policies: [],
                middlewares: [],
            },
        },
    ],
};
