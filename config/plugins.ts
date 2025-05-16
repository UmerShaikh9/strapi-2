module.exports = ({ env }) => ({
    upload: {
        config: {
            provider: "@strapi/provider-upload-aws-s3",
            providerOptions: {
                accessKeyId: env("AWS_ACCESS_KEY_ID"),
                secretAccessKey: env("AWS_SECRET_ACCESS_KEY"),
                region: env("AWS_REGION"),
                params: {
                    Bucket: env("AWS_BUCKET"),
                    CacheControl: "public, max-age=31536000",
                },
                baseUrl: env("AWS_CDN_BASE_URL"),
            },
            actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
            },
        },
    },
    "multi-select": {
        enabled: true,
    },
    email: {
        config: {
            provider: "nodemailer",
            providerOptions: {
                host: env("SMTP_HOST", "smtp.gmail.com"),
                port: env("SMTP_PORT", 587),
                auth: {
                    user: env("SMTP_USERNAME"),
                    pass: env("SMTP_PASSWORD"),
                },
            },
            settings: {
                defaultFrom: "hello@example.com",
                defaultReplyTo: "hello@example.com",
            },
        },
    },
});
