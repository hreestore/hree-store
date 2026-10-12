const GUEST_WISHLIST_KEY = "guestWishlist";

const isBrowser = () => typeof window !== "undefined";

const readJson = (key, fallback) => {
    if (!isBrowser()) return fallback;

    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
        return fallback;
    }
};

const writeJson = (key, value) => {
    if (!isBrowser()) return;

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Ignore storage write failures
    }
};

export const getGuestWishlist = () => readJson(GUEST_WISHLIST_KEY, []);

export const clearGuestWishlist = () => {
    if (!isBrowser()) return;

    try {
        window.localStorage.removeItem(GUEST_WISHLIST_KEY);
    } catch (error) {
        // Ignore storage remove failures
    }
};

const normalizeGuestWishlistItem = (product) => {
    const productId = product?.product_id || product?.itemable_id;
    if (!productId) return null;

    const variantId = product?.variant_id || null;
    const itemId = `guest-${productId}-${variantId || "base"}`;

    return {
        wishlist_id: itemId,
        product_id: productId,
        variant_id: variantId,
        product_name: product?.product_name || product?.item_name || product?.name || "Product",
        slug: product?.slug || "",
        product_image: product?.product_image || product?.featured_image || product?.item_image || "",
        price: Number(product?.price || product?.basePrice || product?.regular_price || 0),
    };
};

export const addGuestWishlistItem = (product) => {
    const normalized = normalizeGuestWishlistItem(product);
    if (!normalized) {
        return { item: null, added: false };
    }

    const current = getGuestWishlist();
    const exists = current.some(
        (item) =>
            String(item.product_id) === String(normalized.product_id) &&
            String(item.variant_id || "") === String(normalized.variant_id || "")
    );

    if (exists) {
        return { item: normalized, added: false };
    }

    const next = [...current, normalized];
    writeJson(GUEST_WISHLIST_KEY, next);

    return { item: normalized, added: true };
};

export const removeGuestWishlistItem = (wishlistId) => {
    const current = getGuestWishlist();
    const next = current.filter((item) => String(item.wishlist_id) !== String(wishlistId));
    writeJson(GUEST_WISHLIST_KEY, next);
};
