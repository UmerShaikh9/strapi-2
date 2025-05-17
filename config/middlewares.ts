// ~/strapi-aws-s3/backend/config/middlewares.js

module.exports = [
    "strapi::errors",
    /* Replace 'strapi::security', with this snippet */
    /* Beginning of snippet */
    {
        name: "strapi::security",
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    "connect-src": ["'self'", "https:"],
                    "img-src": [
                        "'self'",
                        "data:",
                        "blob:",
                        "dl.airtable.com",
                        "banarasi-baithak-media.s3.ap-south-1.amazonaws.com",
                        "https://d7debfom36s1q.cloudfront.net",
                    ],
                    "media-src": [
                        "'self'",
                        "data:",
                        "blob:",
                        "dl.airtable.com",
                        "banarasi-baithak-media.s3.ap-south-1.amazonaws.com",
                        "https://d7debfom36s1q.cloudfront.net",
                    ],
                    upgradeInsecureRequests: null,
                },
            },
        },
    },
    /* End of snippet */
    "strapi::cors",
    "strapi::poweredBy",
    "strapi::logger",
    "strapi::query",
    "strapi::body",
    "strapi::session",
    "strapi::favicon",
    "strapi::public",
];
