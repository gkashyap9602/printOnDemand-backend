module.exports = {
    ACCESS_EXPIRY: '1d',
    REFRESH_EXPIRY: "30d",
    API_V1: "/api/v1/",
    FRONTEND_URL: "https://dev.mwwondemand.com",
    BASE_URL: "http://localhost:3000/api/v1",
    BITBUCKET_URL_DEV: "https://d35sh5431xvp8v.cloudfront.net",

    ADMIN_EMAIL: "modportal@manualww.com",

    PAYTRACE_URL: "https://api.sandbox.paytrace.com",
    PAYTRACE_USERNAME: "mwwfingent",
    PAYTRACE_PASSWORD: "yfC#q9@k4A",
    PAYTRACE_IntegratorID: "9Y2303E37E8U",

    SHOPIFY_ROUTES: {
        SHOPIFY_CREATE_PRODUCT: (VERSION) => `admin/api/${VERSION}/products.json`,
        CREATE_PRODUCT_VARIENT: (VERSION, PRODUCT_ID) => `admin/api/${VERSION}/products/${Number(PRODUCT_ID)}/variants.json`,

    },
    REDIS_CREDENTIAL: {
        URI: "127.0.0.1",
        PORT: 6379
    },


    ZENDESK_AUTH: "YWRtaW5pc3RyYXRvckBtd3dvbmRlbWFuZC5jb206YmZOQWhFYUM0cEVtM1ljIQ==",
    ZENDESK_BASE_URL: "https://mwwondemand.zendesk.com/api/v2",

    ROLE: {
        ADMIN_ROLE: 1,
        USER_ROLE: 3,
        SUB_ADMIN: 2
    }
    // resetPassword"
}