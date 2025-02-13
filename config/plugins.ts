module.exports = ({ env }) => ({
    upload: {
        config: {
            provider: "@strapi/provider-upload-aws-s3",
            providerOptions: {
                accessKeyId: env("AWS_ACCESS_KEY_ID"),
                secretAccessKey: env(
                    "AWS_SECRET_ACCESS_KEY"
                ),
                region: env("AWS_REGION"),
                params: {
                    Bucket: env("AWS_BUCKET"),
                },
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
});
