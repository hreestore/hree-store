import { CONFIG } from "@/global-config";

const FRONT_OVERLAY_RECT = {
    left: 0.178,
    top: 0.13,
    width: 0.3,
    height: 0.6,
};

const BACK_OVERLAY_RECT = {
    left: 0.522,
    top: 0.12,
    width: 0.3,
    height: 0.6,
};

const toAbsoluteUrl = (url) => {
    if (!url || typeof url !== "string") return null;

    const trimmed = url.trim();
    if (!trimmed) return null;

    if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("data:") ||
        trimmed.startsWith("blob:")
    ) {
        return trimmed;
    }

    if (trimmed.startsWith("//")) {
        return `https:${trimmed}`;
    }

    // Keep local public assets as-is (e.g. /img/tshirts/1.jpeg)
    if (trimmed.startsWith("/img/") || trimmed.startsWith("/public/")) {
        return trimmed;
    }

    const cleanUrl = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
    const cleanAssetsDir = CONFIG.assetsDir.endsWith("/")
        ? CONFIG.assetsDir.slice(0, -1)
        : CONFIG.assetsDir;

    return `${cleanAssetsDir}/${cleanUrl}`;
};

const loadImage = (url) =>
    new Promise((resolve, reject) => {
        if (!url) {
            resolve(null);
            return;
        }

        const img = new window.Image();
        img.crossOrigin = "anonymous";

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));

        img.src = url;
    });

const drawOverlay = (ctx, image, rect) => {
    if (!image) return;

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    ctx.drawImage(
        image,
        canvasWidth * rect.left,
        canvasHeight * rect.top,
        canvasWidth * rect.width,
        canvasHeight * rect.height
    );
};

export const generateMergedThumbnail = async ({
    itemImage,
    tshirtFrontImage,
    frontDesign,
    backDesign,
    baseImage,
    frontImage,
    backImage,
    fallbackImage = null,
} = {}) => {
    const originalImage = itemImage || fallbackImage || baseImage || tshirtFrontImage || null;

    const resolvedBaseImage = tshirtFrontImage || baseImage || itemImage || fallbackImage || null;
    const resolvedFrontImage = frontImage || frontDesign || null;
    const resolvedBackImage = backImage || backDesign || null;

    const baseImageUrl = toAbsoluteUrl(resolvedBaseImage);
    const frontImageUrl = toAbsoluteUrl(resolvedFrontImage);
    const backImageUrl = toAbsoluteUrl(resolvedBackImage);
    const originalImageUrl = toAbsoluteUrl(originalImage) || originalImage;
    const fallbackImageUrl = toAbsoluteUrl(fallbackImage) || fallbackImage || originalImageUrl;

    const hasCustomization = Boolean(frontImageUrl || backImageUrl);

    // Non-custom products should keep the original image and skip canvas work.
    if (!hasCustomization) {
        return originalImageUrl || null;
    }

    if (!baseImageUrl) {
        return originalImageUrl || fallbackImageUrl || null;
    }

    try {
        // Yield once to keep the UI responsive before CPU-bound drawing.
        await new Promise((resolve) => {
            if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
                window.requestAnimationFrame(() => resolve());
            } else {
                resolve();
            }
        });

        const [base, front, back] = await Promise.all([
            loadImage(baseImageUrl),
            loadImage(frontImageUrl).catch(() => null),
            loadImage(backImageUrl).catch(() => null),
        ]);

        if (!base) {
            return originalImageUrl || fallbackImageUrl || baseImageUrl;
        }

        const canvas = document.createElement("canvas");
        canvas.width = base.naturalWidth || base.width || 800;
        canvas.height = base.naturalHeight || base.height || 800;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return fallbackImageUrl || baseImageUrl;
        }

        ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
        drawOverlay(ctx, front, FRONT_OVERLAY_RECT);
        drawOverlay(ctx, back, BACK_OVERLAY_RECT);

        return canvas.toDataURL("image/png");
    } catch (error) {
        return originalImageUrl || fallbackImageUrl || baseImageUrl;
    }
};

export const generateMergedImage = generateMergedThumbnail;
