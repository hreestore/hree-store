'use client';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        if (!url) return resolve(null);

        const img = new Image();

        // Load image normally without requesting CORS to avoid 'Access-Control-Allow-Origin' browser console blocks
        img.onload = () => resolve(img);
        img.onerror = () => {
            // Fallback: If image fails (not CORS, maybe network), try with a cache buster
            const fallbackImg = new Image();
            fallbackImg.onload = () => resolve(fallbackImg);
            fallbackImg.onerror = () => reject(new Error(`Failed to load image at: ${url}`));
            fallbackImg.src = url + (url.includes('?') ? '&' : '?') + 'timestamp=' + new Date().getTime();
        };

        img.src = url;
    });
};

const drawDesign = (ctx, img, area, scaleFactor = 1, rotation = 0) => {
    // Scale proportionally to fit inside the print area
    const scale = Math.min(area.width / img.width, area.height / img.height) * scaleFactor;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    // Center inside the print area
    const x = area.x + (area.width - drawWidth) / 2;
    const y = area.y + (area.height - drawHeight) / 2;

    ctx.save();
    // Move to center of drawing area for rotation
    ctx.translate(x + drawWidth / 2, y + drawHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
};

const TshirtCanvas = forwardRef(({
    mockUrl,
    frontDesignUrl,
    backDesignUrl,
    isSwapped = false,
    isReverseMockup = false,
    frontConfig = { scale: 1, rotation: 0 },
    backConfig = { scale: 1, rotation: 0 },
    className = "",
}, ref) => {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!mockUrl) return;

        let isMounted = true;

        const renderCanvas = async () => {
            setLoading(true);
            try {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                // Load images in parallel (including overlay image)
                const [mockImg, frontImg, backImg, overlayImg] = await Promise.all([
                    loadImage(mockUrl),
                    frontDesignUrl ? loadImage(frontDesignUrl) : Promise.resolve(null),
                    backDesignUrl ? loadImage(backDesignUrl) : Promise.resolve(null),
                    loadImage('/img/overlay/overlay.png').catch(() => null),
                ]);

                if (!isMounted) return;

                // Set canvas size to match the mock image perfectly
                canvas.width = mockImg.width;
                canvas.height = mockImg.height;

                // Clear previous draws
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw background mock
                ctx.drawImage(mockImg, 0, 0, canvas.width, canvas.height);

                // Determine areas for front and back designs.
                // Assuming left half = front, right half = back of the single mock image.
                const halfWidth = canvas.width / 2;

                // Configurable print area boundaries inside each half
                // For example, 40% of the half width, and 50% of the height, offset from top
                const printWidth = halfWidth * 0.6;
                const printHeight = canvas.height * 0.6;
                const yOffset = canvas.height * 0.15; // Decreased from 0.2 to 0.15 to move the print area UP

                // --- ADJUST HORIZONTAL & VERTICAL PLACEMENT HERE ---
                // Fractions are relative to the entire canvas width/height.
                // Positive X = move right | Negative X = move left
                // Positive Y = move down  | Negative Y = move up

                const shiftFrontX = canvas.width * (frontConfig?.shiftX ?? 0.078);
                const shiftFrontY = canvas.height * (frontConfig?.shiftY ?? 0);

                const shiftBackX = canvas.width * (backConfig?.shiftX ?? -0.078);
                const shiftBackY = canvas.height * (backConfig?.shiftY ?? -0.03);

                const leftBaseX = (halfWidth - printWidth) / 2;
                const rightBaseX = halfWidth + ((halfWidth - printWidth) / 2);

                // The physical X coordinates for the left and right sides of the canvas
                const leftSideX = leftBaseX + shiftFrontX;
                const rightSideX = rightBaseX + shiftBackX;

                // For reverse mockups (like hoodies), the right side is the front, and left side is the back
                const defaultFrontX = isReverseMockup ? rightSideX : leftSideX;
                const defaultBackX = isReverseMockup ? leftSideX : rightSideX;

                // Determine final X positions based on whether the view is swapped
                const currentFrontX = isSwapped ? defaultBackX : defaultFrontX;
                const currentBackX = isSwapped ? defaultFrontX : defaultBackX;

                // The physical front collar of the t-shirt/hoodie is slightly lower than the back collar.
                // When the small back design moves to the front, it appears "a bit up" because of this.
                // We add a small Y offset (e.g., 2.5%) to push it down just enough to sit below the front collar.
                const collarCompensationY = canvas.height * 0.070;

                // For the front design: move to its current X, keeping its Y shift
                let frontArea = {
                    x: currentFrontX,
                    y: yOffset + shiftFrontY,
                    width: printWidth,
                    height: printHeight
                };

                // For the back design: move to its current X. If it is on the physical front (isSwapped = true),
                // apply collar compensation to push it down.
                let backArea = {
                    x: currentBackX,
                    y: yOffset + shiftBackY + (isSwapped ? collarCompensationY : 0),
                    width: printWidth,
                    height: printHeight
                };

                if (frontImg) {
                    drawDesign(ctx, frontImg, frontArea, frontConfig.scale, frontConfig.rotation);
                }

                if (backImg) {
                    drawDesign(ctx, backImg, backArea, backConfig.scale, backConfig.rotation);
                }

                // Draw overlay image directly on top of canvas with 0.25 opacity
                if (overlayImg) {
                    ctx.save();
                    ctx.globalAlpha = 0.25;
                    ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
                    ctx.restore();
                }

            } catch (err) {
                console.error("Error rendering canvas:", err.message || err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        renderCanvas();

        return () => {
            isMounted = false;
        };
    }, [mockUrl, frontDesignUrl, backDesignUrl, isSwapped, isReverseMockup, frontConfig, backConfig]);

    return (
        <div
            className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden ${className}`}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
        >
            <canvas
                ref={canvasRef}
                className="max-w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 ease-out w-full select-none"
                onContextMenu={(e) => e.preventDefault()}
            />
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm z-10 transition-all duration-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-[#711a20]/20 border-t-[#711a20] rounded-full animate-spin mb-3"></div>
                    {/* <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#081a1a] animate-pulse">Rendering</span> */}
                </div>
            )}
        </div>
    );
});

TshirtCanvas.displayName = 'TshirtCanvas';

export default TshirtCanvas;