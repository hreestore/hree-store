'use client';

import { useGetProductDetails } from "@/api/product";
import { paths } from "@/routes/paths";
import { Iconify } from "@/components/iconify";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fCurrency } from "@/utils/format-number";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/actions/cart-actions";
import { getCartDataRequest } from "@/redux/actions";
import { addProductToCart } from "@/api/cart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { selectAuthState } from "@/redux/selectors";

export function ProductDetailsView({ slug }) {
    const { product, isLoading } = useGetProductDetails(slug);
    console.log('product in ProductDetailsView.jsx', product);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(null);
    const [selectedVariantValues, setSelectedVariantValues] = useState({});
    const dispatch = useDispatch();
    const router = useRouter();
    const { isLogin } = useSelector(selectAuthState);

    // Extract unique variant types and their available values from product.variants
    const { variantTypes, allAvailableValues } = useMemo(() => {
        if (!product?.variants?.length) return { variantTypes: [], allAvailableValues: {} };

        const types = new Map();
        const valueIdToData = new Map();

        product.variants.forEach(variant => {
            if (variant.is_active) {
                variant.variant_values.forEach(vv => {
                    const typeId = vv.variant_type.id;
                    if (!types.has(typeId)) {
                        types.set(typeId, vv.variant_type);
                    }
                    if (!valueIdToData.has(vv.id)) {
                        valueIdToData.set(vv.id, vv);
                    }
                });
            }
        });

        const typesList = Array.from(types.values());

        const availableValuesByType = {};
        typesList.forEach(t => {
            availableValuesByType[t.id] = [];
        });

        Array.from(valueIdToData.values()).forEach(vv => {
            if (availableValuesByType[vv.variant_type.id]) {
                availableValuesByType[vv.variant_type.id].push(vv);
            }
        });

        return { variantTypes: typesList, allAvailableValues: availableValuesByType };
    }, [product]);

    // Find the exact matching variant based on selected values
    const selectedVariant = useMemo(() => {
        if (!product?.variants?.length || Object.keys(selectedVariantValues).length === 0) return null;

        return product.variants.find(variant => {
            const variantValueIds = variant.variant_values.map(vv => vv.id);
            // Check if all selected values are present in this variant
            return Object.values(selectedVariantValues).every(selectedId =>
                variantValueIds.includes(selectedId)
            );
        });
    }, [product, selectedVariantValues]);

    // Auto-select first available variant
    useEffect(() => {
        if (product?.variants?.length > 0 && Object.keys(selectedVariantValues).length === 0) {
            const firstActive = product.variants.find(v => v.is_active);
            if (firstActive) {
                const initialSelection = {};
                firstActive.variant_values.forEach(vv => {
                    initialSelection[vv.variant_type.id] = vv.id;
                });
                setSelectedVariantValues(initialSelection);
            }
        }
    }, [product]);

    // Update active image if variant has image
    useEffect(() => {
        if (selectedVariant?.image) {
            setActiveImage(selectedVariant.image);
        }
    }, [selectedVariant]);

    const allImages = useMemo(() => {
        if (!product) return [];
        const images = [];
        if (product.featured_image) images.push(product.featured_image);
        if (product.product_type === 'variable' && product.variants?.length > 0) {
            const variantImages = Array.from(new Set(product.variants.map(v => v.image).filter(Boolean)));
            images.push(...variantImages);
        }
        if (product.product_galleries?.length > 0) {
            images.push(...product.product_galleries.map(img => img?.image || img?.url || img));
        }
        // Handle in case the API sometimes returns gallery_images instead
        if (product.gallery_images?.length > 0) {
            images.push(...product.gallery_images.map(img => img?.image || img?.url || img));
        }
        return Array.from(new Set(images.filter(Boolean))); // remove duplicates and nulls
    }, [product]);

    const displayImage = activeImage || selectedVariant?.image || product?.featured_image || product?.product_galleries?.[0]?.image || product?.gallery_images?.[0];
    const currentIndex = allImages.indexOf(displayImage) !== -1 ? allImages.indexOf(displayImage) : 0;

    const handlePrevImage = () => {
        if (allImages.length === 0) return;
        const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        setActiveImage(allImages[newIndex]);
    };

    const handleNextImage = () => {
        if (allImages.length === 0) return;
        const newIndex = (currentIndex + 1) % allImages.length;
        setActiveImage(allImages[newIndex]);
    };

    const handleAddToCart = async () => {
        if (!product) return false;

        if (product.product_type === 'variable' && !selectedVariant) {
            toast.error('Please select all variant options');
            return false;
        }

        const isFlashSale = Boolean(product.flash_sale_products?.length);
        const price = selectedVariant ? selectedVariant.price : (product.selling_price?.flashSalePrice || product.price);
        const resolvedProductType = selectedVariant ? "ProductVariant" : "Product";

        const apiPayload = {
            product_id: product.product_id,
            quantity: quantity,
            price: price,
            product_type: resolvedProductType
        };

        if (selectedVariant) {
            apiPayload.variant_id = selectedVariant.variant_id;
        }

        try {
            if (isLogin) {
                await addProductToCart([apiPayload]);
                dispatch(getCartDataRequest());
            } else {
                dispatch(addToCart({
                    ...apiPayload,
                    product_id: selectedVariant?.variant_id || product.product_id,
                    cart_id: Date.now(),
                    itemable_id: product.product_id,
                    product_name: product.name,
                    item_name: product.name,
                    featured_image: selectedVariant?.image || product.featured_image,
                    item_image: selectedVariant?.image || product.featured_image,
                    slug: product.slug,
                    price: price,
                    regular_price: selectedVariant ? selectedVariant.price : (product.selling_price?.regularPrice || product.price),
                    is_flash_sale: isFlashSale,
                }));
            }
            toast.success("Added to cart");
            return true;
        } catch (error) {
            toast.error(error?.message || "Failed to add to cart");
            return false;
        }
    };

    const handleBuyNow = async () => {
        const added = await handleAddToCart();
        if (added) {
            router.push(paths.checkout + `?buyNow=true&productSlug=${product.slug}&quantity=${quantity}`);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 mt-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className=" animate-pulse rounded-2xl w-full h-[500px]"></div>
                    <div>
                        <div className="h-12  animate-pulse rounded w-3/4 mb-4"></div>
                        <div className="h-6  animate-pulse rounded w-1/2 mb-8"></div>
                        <div className="h-[200px]  animate-pulse rounded-2xl w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center mt-20">
                <h2 className="text-4xl font-display font-black uppercase text-[#081a1a] mb-6">Product not found</h2>
                <button
                    onClick={() => router.push(paths.catalog)}
                    className="inline-block border-2 border-[#081a1a] text-[#081a1a] px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-[#081a1a] hover:text-[#ffffff] transition-colors"
                >
                    Back to Catalog
                </button>
            </div>
        );
    }

    const price = selectedVariant
        ? selectedVariant.price
        : (product.selling_price?.flashSalePrice || product.price);

    const isOutOfStock = product.product_type === 'variable' && !selectedVariant;


    return (
        <div className=" pb-16  pt-10 ">
            <div className="max-w-7xl mx-auto px-4">

                {/* Breadcrumbs */}
                <div className="inline-flex items-center space-x-3 text-xs md:text-sm font-bold  mb-8  px-5 py-2.5 rounded-full uppercase tracking-widest border border-gray-100 shadow-sm overflow-hidden whitespace-nowrap">
                    <Link href={paths.home} className="flex items-center hover:text-[#711a20] transition-colors group">
                        <Iconify icon="solar:home-smile-bold-duotone" className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                        Home
                    </Link>
                    <span className="">
                        <Iconify icon="solar:alt-arrow-right-linear" className="w-4 h-4 " />
                    </span>
                    <Link href={paths.catalog} className="hover:text-[#711a20] transition-colors">
                        Catalog
                    </Link>
                    <span className="">
                        <Iconify icon="solar:alt-arrow-right-linear" className="w-4 h-4 " />
                    </span>
                    <span className=" truncate max-w-[120px] sm:max-w-xs md:max-w-sm">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">

                    {/* Left: Images */}
                    <div className="flex flex-col gap-4">
                        {/* Main Image Carousel */}
                        <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-[#fafafa] shadow-xl group border border-gray-100">
                            <AnimatePresence mode="wait">
                                {displayImage && (
                                    <motion.div
                                        key={displayImage}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full relative flex items-center justify-center p-8"
                                    >
                                        <Image
                                            src={displayImage}
                                            alt={product.name || "Product Image"}
                                            fill
                                            unoptimized
                                            className="object-cover aspect-[4/4] drop-shadow-xl transition-transform duration-700 hover:scale-105"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Carousel Controls */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-gray-200 text-gray-800 hover:text-[#711a20] hover:bg-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    >
                                        <Iconify icon="solar:alt-arrow-left-linear" className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-gray-200 text-gray-800 hover:text-[#711a20] hover:bg-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    >
                                        <Iconify icon="solar:alt-arrow-right-linear" className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 pt-2 px-1 [&::-webkit-scrollbar]:hidden">
                                {allImages.map((imgUrl, i) => (
                                    <button
                                        key={`thumb-${i}`}
                                        onClick={() => setActiveImage(imgUrl)}
                                        className={`flex-shrink-0 relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${displayImage === imgUrl ? 'border-[#711a20] ring-4 ring-[#711a20]/20 scale-105 shadow-md z-10' : 'border-transparent bg-gray-50 opacity-60 hover:opacity-100 hover:scale-105'}`}
                                    >
                                        <Image src={imgUrl} alt={`Thumbnail ${i}`} fill unoptimized className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col">
                        <span className="text-[#711a20] font-black uppercase tracking-widest text-sm mb-2">
                            {product.brand?.brand_name || product.categories?.[0]?.category_name}
                        </span>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-tighter leading-none mb-4">
                            {product.name}
                        </h1>

                        <div className="text-3xl font-black text-[#711a20] mb-8">
                            {fCurrency(price)}
                        </div>

                        <hr className="border-gray-300 mb-8" />

                        {/* Description */}
                        <div
                            className="prose prose-sm md:prose-base font-medium  mb-8 max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />

                        <hr className="border-gray-300 mb-8" />

                        {/* Variants */}
                        {product.product_type === 'variable' && product.variants?.length > 0 && (
                            <div className="mb-8 flex flex-col gap-6">
                                {variantTypes.map(type => (
                                    <div key={type.id}>
                                        <h3 className="font-bold uppercase tracking-widest text-sm mb-3">{type.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {allAvailableValues[type.id]?.map(vv => {
                                                const isSelected = selectedVariantValues[type.id] === vv.id;
                                                return (
                                                    <button
                                                        key={vv.id}
                                                        onClick={() => setSelectedVariantValues(prev => ({
                                                            ...prev,
                                                            [type.id]: vv.id
                                                        }))}
                                                        className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider border-2 transition-all ${isSelected ? 'border-[#081a1a] bg-[#081a1a] text-[#ffffff]' : 'border-gray-300 text-gray-600 hover:border-[#081a1a] hover:text-[#081a1a]'}`}
                                                    >
                                                        {vv.value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mb-8">
                            <h3 className="font-bold uppercase tracking-widest text-sm mb-3">Quantity</h3>
                            <div className="flex items-center border-2 border-gray-300 rounded-full w-max overflow-hidden ">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 hover:bg-gray-100 transition-colors text-xl font-bold"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-16 text-center font-bold text-lg bg-transparent outline-none appearance-none"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 py-2 hover:bg-gray-100 transition-colors text-xl font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                            <button
                                disabled={isOutOfStock}
                                onClick={handleAddToCart}
                                className="flex-1 flex items-center justify-center gap-2 border-2 border-[#081a1a] text-[#081a1a] py-4 px-8 rounded-full font-black uppercase tracking-widest hover:bg-[#081a1a] hover:text-[#ffffff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Iconify icon="solar:cart-plus-bold" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Add to Cart
                            </button>
                            <button
                                disabled={isOutOfStock}
                                onClick={handleBuyNow}
                                className="flex-1 bg-[#711a20] text-[#ffffff] py-4 px-8 rounded-full font-black uppercase tracking-widest hover:bg-[#a00000] hover:shadow-[0_0_30px_rgba(139,0,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isOutOfStock ? 'Select Variant' : 'Buy Now'}
                            </button>
                        </div>

                        {canCustomize && (
                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                <button
                                    onClick={() => router.push(`/category/${product?.categories?.[0]?.category_id || product?.category_id || product?.product_id}`)}
                                    className="flex-1 bg-[#081a1a] text-[#ffffff] py-4 px-8 rounded-full font-black uppercase tracking-widest hover:bg-[#711a20] transition-colors group flex items-center justify-center gap-2 shadow-lg"
                                >
                                    Customize
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}