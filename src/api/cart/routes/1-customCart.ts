/**
 * cart custom router
 */

export default {
    routes: [
        {
            method: "POST",
            path: "/suggetions",
            handler: "cart.suggestions",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/carts/user",
            handler: "cart.myCart",
            config: {
                auth: {
                    enabled: true,
                },
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            path: "/carts/user",
            handler: "cart.addToCart",
            config: {
                auth: {
                    enabled: true,
                },
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            path: "/carts/user/all",
            handler: "cart.addMultipleToCart",
            config: {
                auth: {
                    enabled: true,
                },
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "DELETE",
            path: "/carts/user",
            handler: "cart.removeFromCart",
            config: {
                auth: {
                    enabled: true,
                },
                policies: [],
                middlewares: [],
            },
        },
    ],
};
