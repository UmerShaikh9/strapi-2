/**
 * cart custom router
 */

export default {
    routes: [
        {
            method: "GET",
            path: "/carts/user",
            handler: "cart.myCart",
            config: {
                auth: {
                    enabled: true, // Ensure the user is authenticated
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
                    enabled: true, // Ensure the user is authenticated
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
                    enabled: true, // Ensure the user is authenticated
                },
                policies: [],
                middlewares: [],
            },
        },
    ],
};
