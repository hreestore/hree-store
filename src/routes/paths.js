const ROOTS = {
    AUTH: "/auth",
};

// ----------------------------------------------------------------------

export const paths = {
    // Main pages
    home: '/home',
    comingSoon: '/coming-soon',
    about: '/about',
    contact: '/contact',
    catalog: '/catalog',
    cart: '/cart',
    checkout: '/',

    // Product
    product: {
        root: '/catalog',
        details: (slug) => `/catalog/${slug}`,
    },

    // Customize/Studio
    customize: {
        root: '/customize',
        detail: (designId) => `/customize/${designId}`,
    },

    // Categories(anchor links)
    categories: {
        root: '/home#categories',
        tshirts: '/home#categories',
        hoodies: '/home#categories',
        toteBags: '/home#categories',
    },

    // Auth
    auth: {
        signIn: `${ROOTS.AUTH}/sign-in`,
        signUp: `${ROOTS.AUTH}/sign-up`,
        verifyEmail: `${ROOTS.AUTH}/verify-email`,
        verifyEmailChange: `${ROOTS.AUTH}/verify-email-change`,
        googleCallback: `${ROOTS.AUTH}/google/callback`,
    },


    profile: {
        root: "/profile",
        // edit: "/profile/edit",
    },

    cart: "/cart",

    checkout: "/checkout",

    wishlist: "/wishlist",

    // Support pages
    support: {
        shipping: '/support/shipping',
        returns: '/support/returns',
        contact: '/contact',
        faq: '/support/faq',
    },

    // Legal pages
    legal: {
        privacy: '/legal/privacy',
        terms: '/legal/terms',
    },

    // Social media (external links)
    social: {
        instagram: 'https://www.instagram.com/hree_store/',
        facebook: 'https://www.facebook.com/hreecreate/',
        location: "https://maps.app.goo.gl/qh3ReDGcXYT6tecH9?g_st=ic",
        location2: "https://maps.app.goo.gl/4Ls2AvAp1dQmLEeM8?g_st=ic",
        twitter: 'https://twitter.com/hreecrate',
    },

    order: {
        root: "/order",
        details: (id) => `/order/${id}`,
    },

    blog: {
        root: "/blog",
        details: (slug) => `/blog/${slug}`,
    },

    service: {
        root: "/service",
        details: (slug) => `/service/${slug}`,
    },

    payment: {
        success: "/payment/success",
        failure: "/payment/failure",
    },

    // Ready Made Products (Shop)
    shop: {
        root: '/shop',
        details: (slug) => `/shop/${slug}`,
    },
};
