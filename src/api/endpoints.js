import { CONFIG } from "@/global-config";

export const endpoints = {
  app: {
    getPages: "pages",
    getPageDetails: (slug) => `page/${slug}`,
  },

  auth: {
    signIn: "user/login",
    signUp: "user/register",
    signOut: "user/logout",
    verifyEmail: (token) => `user/verify-email/${token}`,
    verifyEmailChange: (token) => `user/verify-email-change/${token}`,
    resendVerification: "user/resend-verification",
    googleRedirect: (vendorId) =>
      `${CONFIG.serverUrl}user/vendor/${vendorId}/google/redirect`,
    googleExchange: "user/google/exchange",
    requestOtp: "user/otp/request",
    verifyOtp: "user/otp/verify",
    resendOtp: "user/otp/resend",
  },

  home: {
    slider: "sliders",
    categoryProducts: "home-categories",
    recentProducts: "recent-products",
    flashSale: "flash-sale",
    clients: "clients",
    testimonials: "testimonials",
    youtubeShorts: "youtube-shorts",
    commitments: "commitments",
    concerns: "concerns",
    faqs: "faqs",
  },

  about: "abouts",

  category: "categories",

  brand: "brands",

  serviceInquiry: "inquiry-submit",

  contactSubmission: "contact-submit",

  product: {
    list: "products",
    details: (slug) => `product-details/${slug}`,
    relatedProducts: (slug) => `related-products/${slug}`,
    getReviews: (id) => `reviews/${id}`,
    addReview: (id) => `user/review/store/${id}`,
  },

  cart: {
    addProduct: "user/cart/store",
    getProducts: "user/cart",
    updateProduct: (id) => `user/cart/update/${id}`,
    removeProduct: (id) => `user/cart/delete/${id}`,
    clearProducts: "user/cart/clear",
    validate: "user/cart/validate",
    checkDiscount: "user/cart/check-discount",
    calculate: "user/cart/calculate",
  },

  order: {
    create: "user/cart/order/store",
    update: (id) => `user/cart/order/update/${id}`,
    // updateAddress: (id) => `user/profile/order/update/${id}`,
    list: "user/profile/orders",
    details: (id) => `user/profile/order/${id}`,
  },

  quickOrder: {
    store: "quick-order/store",
    verifyAndCreate: "quick-order/verify-and-create",
  },

  logistic: {
    getCharge: (id) => `logistic-charge/${id}`,
    upayaLocations: "upaya-locations",
    upayaDeliveryRate: "upaya-delivery-rate",
  },

  wishlist: {
    addProduct: "user/wishlist/store",
    getProducts: "user/wishlist",
    removeProduct: (id) => `user/wishlist/delete/${id}`,
    clearProducts: "user/wishlist/clear",
  },

  profile: {
    get: "user/profile",
    update: "user/profile/update",
    updatePassword: "user/change-password",
    addAddress: "user/profile/address/store",
    removeAddress: (addressId) => `user/profile/address/delete/${addressId}`,
  },

  address: {
    getStates: "locations",
  },

  vendor: "vendor-details",

  blog: {
    list: "blogs",
    details: (slug) => `blog/${slug}`,
    relatedBlogs: (slug) => `related-blogs/${slug}`,
  },

  service: {
    list: "services",
    details: (slug) => `services/${slug}`,
    relatedBlogs: (slug) => `related-services/${slug}`,
  },

  chat: {
    get: "user/chat",
    createChat: (productId) => `user/message/start/${productId}`,
    sendMessage: "user/message/send",
  },

  payment: {
    esewa: (orderId) => `user/esewa/initiate/${orderId}`,
    esewaSuccess: `user/esewa/success`,
    esewaFailure: `user/esewa/failure`,
    fonepay: (orderId) => `user/fonepay/initiate/${orderId}`,
    fonepayStatus: (prn) => `user/fonepay/status/${prn}`,
  },

  designCombination: {
    list: "design-combinations",
    details: (id) => `design-combinations/${id}`,
  },

  // Size Catalogue based on Category
  // sizeCatalogue: (categoryId) => `size-catalogue/${categoryId}`,
  sizeCatalogue: (categoryId) =>
    categoryId ? `size-catalogue/${categoryId}` : null,

  colors: "colors",

  socialMedia: "social-media-links",

  popupNotification: "popup-notifications",

  storeLocation: "store-locations",
};
