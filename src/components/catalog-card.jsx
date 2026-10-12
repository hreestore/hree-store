import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ----------------------------------------------------------------------------------

export default function CatalogCard({ design }) {
    const [hovered, setHovered] = useState(false);
    const canvasRef = useRef(null);
    const router = useRouter();
    const designName = design?.name || "Design Name";
    const designCode = design?.code || "Design Code";
    // const nameParts = designName.split('-');
    // const headerName = nameParts[0]?.trim();
    // const footerName = nameParts.length > 1 ? nameParts.slice(1).join('-').trim() : headerName;

    useEffect(() => {
        if (!design?.web_image || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };

        img.src = design.web_image;
    }, [design?.web_image]);

    return (
        <>
            <div
                onClick={() => router.push(`/category/${design?.category_id}`)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="bg-[#f7e6dc]"
                style={{
                    // width: 280,
                    borderRadius: 30,
                    overflow: "hidden",
                    border: "3px solid #8B1A1A",
                    boxShadow: hovered
                        ? "0 20px 40px -12px rgba(139, 26, 26, 0.25), 0 4px 12px rgba(0, 0, 0, 0.08)"
                        : "0 10px 25px -15px rgba(0, 0, 0, 0.15), 0 2px 5px rgba(0, 0, 0, 0.05)",
                    transform: hovered ? "translateY(-1px) scale(1.01)" : "translateY(0) scale(1)",
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    cursor: "pointer",
                    position: "relative",
                }}
            >
                {/* Header band */}
                <div style={{
                    // background: "linear-gradient(135deg, #6B1111 0%, #8B1A1A 50%, #6B1111 100%)",
                    padding: "2px 2px",
                    textAlign: "center",
                    borderBottom: "2.5px solid #8B1A1A",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    {/* Header texture lines */}
                    <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 9px)",
                    }} />
                    <span className="font-montserrat " style={{
                        fontSize: 11,
                        fontWeight: 900,
                        // letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        position: "relative",
                    }}>
                        {designName.split(' ').length > 1 ? (
                            designName.split(' ').map((word, idx) => (
                                <span key={idx} style={{ color: idx % 2 === 0 ? '#081A1A' : '#8B1A1A' }}>
                                    {word}{idx !== designName.split(' ').length - 1 ? ' ' : ''}
                                </span>
                            ))
                        ) : (
                            <span style={{ color: '#081A1A' }}>{designName}</span>
                        )}
                    </span>
                </div>

                {/* Illustration area */}
                <div style={{
                    height: 150,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // background: "#ffffff",
                }}>
                    {design?.web_image ? (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                position: "relative",
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <canvas
                                ref={canvasRef}
                                aria-label={design.name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    transition: "transform 0.5s ease",
                                    transform: hovered ? "scale(1.05)" : "scale(1)",
                                    userSelect: "none",
                                    WebkitUserDrag: "none",
                                    pointerEvents: "none", // Prevents right click and drag on the canvas itself
                                }}
                            />
                        </div>
                    ) : (
                        <div style={{ color: "#8B1A1A", fontWeight: "bold" }}>No Image</div>
                    )}
                    {/* Watermark brand */}
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        opacity: 0.65,
                        pointerEvents: "none", // Ensure it doesn't block clicks
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "80%",
                    }}>
                        <img
                            src="/img/logo/dark/Brand Kit-11.png"
                            alt="Logo"
                            className="w-36 object-contain scale-[1.2]"
                            style={{
                                filter: "brightness(0) invert(1)",
                            }}
                        />
                    </div>
                </div>

                {/* Footer number band */}
                <div style={{
                    // background: "linear-gradient(135deg, #6B1111 0%, #8B1A1A 50%, #6B1111 100%)",
                    padding: "2px 1px",
                    textAlign: "center",
                    borderTop: "3px solid #8B1A1A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                }}>
                    <div style={{ height: 1, flex: 1, background: "rgba(237,217,176,0.25)" }} />
                    <span className="font-montserrat" style={{
                        // color: "#EDD9B0",
                        color: "#081A1A",
                        fontSize: 16,
                        fontWeight: 900,
                    }}>
                        {designCode}
                    </span>
                    <div style={{ height: 1, flex: 1, background: "rgba(237,217,176,0.25)" }} />
                </div>
            </div>
        </>

    );
}