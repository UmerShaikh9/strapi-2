/**
 * cart custom router
 */

export default {
    routes: [
        {
            method: "GET",
            path: "/wishlist/user",
            handler: "wishlist.myWishlist",
            config: {
                auth: {
                    enabled: true, // Ensure the user is authenticated
                },
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            path: "/wishlist/user",
            handler: "wishlist.addToWishlist",
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
            path: "/wishlist/user",
            handler: "wishlist.removeFromWishlist",
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
