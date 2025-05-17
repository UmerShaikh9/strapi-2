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
                    "img-src": ["'self'", "data:", "blob:", "dl.airtable.com", process.env.AWS_BUCKET, process.env.AWS_CDN_BASE_URL],
                    "media-src": ["'self'", "data:", "blob:", "dl.airtable.com", process.env.AWS_BUCKET, process.env.AWS_CDN_BASE_URL],
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
