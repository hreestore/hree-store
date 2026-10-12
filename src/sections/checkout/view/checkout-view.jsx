"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useRouter } from "@/routes/hooks";
import { paths } from "@/routes/paths";

import { useAppSelector } from "@/redux/hooks";

import { BuyNowProductDisplay } from "../buy-now-product-display";
import { CartItemsDisplay } from "../cart-items-display";
import { QuickOrderForm } from "../quick-order-form";
import { useTheme } from "next-themes";

// ----------------------------------------------------------------------

export function CheckoutView() {
    const { resolvedTheme } = useTheme();

    const router = useRouter();
    const searchParams = useSearchParams();

    const [checkoutMode, setCheckoutMode] = useState(null); // 'buyNow' | 'cart'
    const [buyNowProduct, setBuyNowProduct] = useState(null);
    const [buyNowQuantity, setBuyNowQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [logisticCharge, setLogisticCharge] = useState(0);

    // Only access cart from Redux when in cart mode
    const { items: cartItems } = useAppSelector((state) => state.cart);

    useEffect(() => {
        const isBuyNow = searchParams.get("buyNow") === "true";
        const productSlug = searchParams.get("productSlug");
        const quantity = searchParams.get("quantity");

        if (isBuyNow && productSlug) {
            // Buy Now mode - don't need cart
            setCheckoutMode("buyNow");
            setBuyNowQuantity(parseInt(quantity) || 1);

            // Fetch product details
            fetchProductForBuyNow(productSlug);
        } else {
            // Cart checkout mode
            setCheckoutMode("cart");

            if (!cartItems || cartItems.length === 0) {
                setError("Your cart is empty");
                setTimeout(() => {
                    router.push(paths.cart);
                }, 2000);
            } else {
                setIsLoading(false);
            }
        }
    }, [searchParams, cartItems, router]);



    const fetchProductForBuyNow = async (productSlug) => {
        try {
            setIsLoading(true);
            setError("");

            // Import product API function
            const { getProductDetails } = await import("@/api");

            const product = await getProductDetails(productSlug);
            // console.log(product, "hahaha")
            if (product) {
                setBuyNowProduct(product);
            } else {
                setError("Product not found");
                setTimeout(() => {
                    router.push(paths.home);
                }, 2000);
            }
        } catch (err) {
            console.error("Error fetching product:", err);
            setError("Failed to load product. Redirecting...");
            setTimeout(() => {
                router.push(paths.home);
            }, 2000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = (newQuantity) => {
        setBuyNowQuantity(newQuantity);
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center pt-20">
                <div className="w-16 h-16 border-4 border-[#081a1a] border-t-transparent rounded-full animate-spin mb-4" />
                <span className="font-display font-black uppercase tracking-tighter text-[#081a1a] text-xl">
                    Loading checkout...
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8 mt-10">
                <div className="p-6 rounded-2xl border-[3px] border-red-500 font-bold bg-red-50 text-red-700 shadow-[4px_4px_0_0_rgba(239,68,68,1)] text-lg">
                    {error}
                </div>
            </div>
        );
    }


    return (
        <section className="max-w-7xl mx-auto lg:py-20 py-20  mb-10 z-1">
            {resolvedTheme === 'light' && (
                <h1 className="font-display font-black uppercase tracking-tighter text-[#081a1a] lg:mb-12 mb-5 text-center lg:text-left text-3xl md:text-5xl lg:text-6xl">
                    Check<span className="text-[#711a20]">out</span>
                </h1>
            )}
            {resolvedTheme === 'dark' && (
                <h1 className="font-display font-black uppercase tracking-tighter text-[#ffffff] mb-12 text-center lg:text-left text-5xl md:text-5xl lg:text-6xl">
                    Check<span className="text-[#f7e6dc]">out</span>
                </h1>
            )}
            <div className="lg:px-4 px-6">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 items-start">
                    <div className="lg:col-span-5 order-1 lg:order-1">
                        {checkoutMode === "buyNow" && buyNowProduct && (
                            <div className="lg:mb-8 mb-4 relative z-10 w-full">
                                <span className="font-display font-black text-xl md:text-2xl uppercase tracking-tighter  mb-6 inline-block px-4 py-2 border-2 border-[#f7e6dc] shadow-[4px_4px_0_0_rgba(8,26,26,1)] transform -rotate-2">
                                    Your Selected Item
                                </span>
                                <div className=" rounded-3xl border-[3px] border-[#f7e6dc] shadow-[6px_6px_0_0_rgba(8,26,26,1)] overflow-hidden w-full">
                                    <BuyNowProductDisplay
                                        product={buyNowProduct}
                                        quantity={buyNowQuantity}
                                        onQuantityChange={handleQuantityChange}
                                        deliveryCharge={logisticCharge}
                                    />
                                </div>
                            </div>
                        )}

                        {checkoutMode === "cart" && cartItems && cartItems.length > 0 && (
                            <div className="lg:mb-8 mb-5 relative z-10 w-full">
                                <span className="font-display font-black text-xl md:text-2xl uppercase tracking-tighter mb-6 inline-block  px-4 py-2 border-2 border-[#f7e6dc] shadow-[4px_4px_0_0_rgba(8,26,26,1)] transform -rotate-1">
                                    Your Cart Items ({cartItems.length})
                                </span>
                                <div className=" rounded-3xl border-[3px] border-[#f7e6dc] shadow-[6px_6px_0_0_rgba(8,26,26,1)] overflow-hidden w-full relative z-0">
                                    <CartItemsDisplay items={cartItems} deliveryCharge={logisticCharge} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-7 order-2 lg:order-1 w-full relative z-10">
                        <QuickOrderForm
                            mode={checkoutMode}
                            buyNowProduct={buyNowProduct}
                            buyNowQuantity={buyNowQuantity}
                            cartItems={cartItems}
                            onLogisticChargeChange={setLogisticCharge}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
