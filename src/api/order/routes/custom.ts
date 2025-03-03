/**
 * order custom router
 */

export default {
    routes: [
        {
            method: "GET",
            path: "/order/user",
            handler: "order.myOrder",
            config: {
                auth: {
                    enabled: true,
                },
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            path: "/order/create",
            handler: "order.createOrder",
            config: { policies: [] },
        },
        {
            method: "POST",
            path: "/order/capture",
            handler: "order.captureOrder",
            config: { policies: [] },
        },
    ],
};
