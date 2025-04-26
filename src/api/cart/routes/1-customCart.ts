/**
 * cart custom router
 */

export default {
    routes: [
        {
            method: "GET",
            path: "/products/filters",
            handler: "cart.getProductsFilters",
            config: {
                policies: [],
                middlewares: [],
            },
        },
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
            method: "POST",
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
        {
            method: "POST",
            path: "/rasa-page/blogs",
            handler: "cart.allBlogs",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            path: "/press-and-media/blogs",
            handler: "cart.pressAndMediaBlogs",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/home-page",
            handler: "cart.getHomePageData",
            config: {
                policies: [],
            },
        },
        {
            method: "GET",
            path: "/products/sort",
            handler: "cart.getProducts",
        },
        {
            method: "GET",
            path: "/update-price-filters",
            handler: "cart.updateAllProductPriceFilters",
        },
    ],
};
