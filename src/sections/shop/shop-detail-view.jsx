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
import { submitQuickOrder } from "@/api/quick-order";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { selectAuthState } from "@/redux/selectors";
import { Loader2, ShoppingBag, Zap, X, ArrowRight, Minus, Plus, Phone, Mail, User, MapPin } from "lucide-react";

// --------------------------------------------------------------------------------------------

export default function ShopDetailView({ slug }) {
    const { product, isLoading } = useGetProductDetails(slug);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(null);
    const [selectedVariantValues, setSelectedVariantValues] = useState({});
    const [showQuickOrder, setShowQuickOrder] = useState(false);
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
        if (product.gallery_images?.length > 0) {
            images.push(...product.gallery_images.map(img => img?.image || img?.url || img));
        }
        return Array.from(new Set(images.filter(Boolean)));
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
                }));
            }
            toast.success("Added to cart!");
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

    const price = selectedVariant
        ? selectedVariant.price
        : (product?.selling_price?.flashSalePrice || product?.price);

    const regularPrice = product?.selling_price?.regularPrice || product?.price;
    const hasDiscount = product?.selling_price?.discountPercentage > 0;
    const isOutOfStock = product?.product_type === 'variable' && !selectedVariant;

    // --- Loading ---
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="animate-pulse bg-gray-100 rounded-3xl w-full aspect-square" />
                    <div className="space-y-6">
                        <div className="h-6 animate-pulse bg-gray-100 rounded-full w-24" />
                        <div className="h-12 animate-pulse bg-gray-100 rounded w-3/4" />
                        <div className="h-8 animate-pulse bg-gray-100 rounded w-1/3" />
                        <div className="h-px bg-gray-200" />
                        <div className="h-[120px] animate-pulse bg-gray-100 rounded-2xl w-full" />
                        <div className="flex gap-4">
                            <div className="h-14 animate-pulse bg-gray-100 rounded-full flex-1" />
                            <div className="h-14 animate-pulse bg-gray-100 rounded-full flex-1" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Not Found ---
    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center mt-10">
                <Iconify icon="solar:bag-cross-bold-duotone" className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                <h2 className="text-4xl font-display font-black uppercase text-[#081a1a] mb-6">Product not found</h2>
                <button
                    onClick={() => router.push(paths.shop.root)}
                    className="inline-block border-2 border-[#081a1a] text-[#081a1a] px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-[#081a1a] hover:text-[#ffffff] transition-colors"
                >
                    Back to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="lg:py-20 ">
            <div className="max-w-7xl mx-auto px-4">

                {/* Breadcrumbs */}
                <div className="inline-flex items-center space-x-3 text-xs md:text-sm font-bold mb-8 px-5 py-2.5 rounded-full uppercase tracking-widest border border-gray-100 shadow-sm overflow-hidden whitespace-nowrap">
                    <Link href={paths.home} className="flex items-center hover:text-[#711a20] transition-colors group">
                        <Iconify icon="solar:home-smile-bold-duotone" className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                        Home
                    </Link>
                    <span>
                        <Iconify icon="solar:alt-arrow-right-linear" className="w-4 h-4" />
                    </span>
                    <Link href={paths.shop.root} className="hover:text-[#711a20] transition-colors">
                        Shop
                    </Link>
                    <span>
                        <Iconify icon="solar:alt-arrow-right-linear" className="w-4 h-4" />
                    </span>
                    <span className="truncate max-w-[120px] sm:max-w-xs md:max-w-sm">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">

                    {/* Left: Images */}
                    <div className="flex flex-col gap-4">
                        {/* Main Image */}
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
                                        <img src="/img/overlay/overlay.png" alt="" className="absolute left-0 top-0 z-999 w-full h-full opacity-20 object-cover" />

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
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-gray-200 text-gray-800 hover:text-[#711a20] hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Iconify icon="solar:alt-arrow-left-linear" className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-gray-200 text-gray-800 hover:text-[#711a20] hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Iconify icon="solar:alt-arrow-right-linear" className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            {/* Discount Badge */}
                            {hasDiscount && (
                                <div className="absolute top-4 left-4 bg-[#711a20] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                                    {product.selling_price.discountPercentage}% OFF
                                </div>
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

                    {/* Right: Product Info */}
                    <div className="flex flex-col">
                        {/* Category Badge */}
                        <span className="text-[#711a20] font-black uppercase tracking-widest text-sm mb-2">
                            {product.brand?.brand_name || product.categories?.find(c => c.category_id !== 289)?.category_name || product.categories?.[0]?.category_name}
                        </span>

                        {/* Product Name */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-tighter leading-none mb-4">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-8">
                            <span className="text-3xl font-black text-[#711a20]">{fCurrency(price)}</span>
                            {hasDiscount && (
                                <span className="text-lg text-gray-400 line-through font-bold">{fCurrency(regularPrice)}</span>
                            )}
                        </div>

                        <hr className="border-gray-200 mb-8" />

                        {/* Description */}
                        {product.description && (
                            <>
                                <div
                                    className="prose prose-sm md:prose-base font-medium mb-8 max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                                <hr className="border-gray-200 mb-8" />
                            </>
                        )}

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
                            <div className="flex items-center border-2 border-gray-300 rounded-full w-max overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2.5 hover:bg-gray-100 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-16 text-center font-bold text-lg bg-transparent outline-none appearance-none"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 py-2.5 hover:bg-gray-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4 mt-auto">
                            {/* Add to Cart + Buy Now */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    disabled={isOutOfStock}
                                    onClick={handleAddToCart}
                                    className="flex-1 flex items-center justify-center gap-2 border-2 border-[#081a1a] text-[#081a1a] py-4 px-8 rounded-full font-black uppercase tracking-widest hover:bg-[#081a1a] hover:text-[#ffffff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
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

                            {/* Quick Order Button */}
                            <button
                                disabled={isOutOfStock}
                                onClick={() => setShowQuickOrder(true)}
                                className="w-full flex items-center justify-center gap-2 bg-[#081a1a] text-[#ffffff] py-4 px-8 rounded-full font-black uppercase tracking-widest hover:bg-[#711a20] transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
                            >
                                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Quick Order
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Quick Order Modal */}
            <AnimatePresence>
                {showQuickOrder && (
                    <QuickOrderModal
                        product={product}
                        quantity={quantity}
                        selectedVariant={selectedVariant}
                        price={price}
                        onClose={() => setShowQuickOrder(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// --------------------------------------------------------------------------------------------
// Quick Order Modal
// --------------------------------------------------------------------------------------------

function QuickOrderModal({ product, quantity, selectedVariant, price, onClose }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_contact_info: '',
        address: '',
        remarks: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.customer_name.trim()) newErrors.customer_name = 'Name is required';
        if (!formData.customer_email.trim()) newErrors.customer_email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) newErrors.customer_email = 'Invalid email';
        if (!formData.customer_contact_info.trim()) newErrors.customer_contact_info = 'Phone is required';
        else if (!/^\d{10}$/.test(formData.customer_contact_info)) newErrors.customer_contact_info = 'Must be 10 digits';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const itemPayload = {
                product_id: product.product_id,
                quantity: quantity,
                price: price,
                product_type: selectedVariant ? "ProductVariant" : "Product",
            };
            if (selectedVariant) {
                itemPayload.variant_id = selectedVariant.variant_id;
            }

            const orderData = {
                ...formData,
                payment_method: 'fonepay',
                items: [itemPayload],
            };

            const response = await submitQuickOrder(orderData);

            if (response.success) {
                toast.success('Order placed successfully!');
                onClose();
                if (response.data?.order?.id) {
                    router.push(paths.payment.success + `?orderId=${response.data.order.id}`);
                }
            }
        } catch (error) {
            const message = error?.message || error?.data?.message || 'Failed to place order. Please try again.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalAmount = parseFloat(price) * quantity;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-[5%] md:top-[10%] md:max-w-lg w-auto bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Modal Header */}
                <div className="bg-[#081a1a] text-white px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-display font-black uppercase tracking-tighter">Quick Order</h2>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Fast checkout</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-6">
                    {/* Order Summary Mini */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center gap-4">
                        {product.featured_image && (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                <Image src={selectedVariant?.image || product.featured_image} alt={product.name} fill unoptimized className="object-cover" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-display font-black uppercase tracking-tighter text-sm truncate">{product.name}</h4>
                            <p className="text-xs text-gray-500 font-bold">Qty: {quantity}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="font-black text-[#711a20] text-lg">{fCurrency(totalAmount)}</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <QuickOrderInput
                            icon={<User className="w-4 h-4" />}
                            label="Full Name"
                            placeholder="Your full name"
                            value={formData.customer_name}
                            onChange={(v) => handleChange('customer_name', v)}
                            error={errors.customer_name}
                        />
                        <QuickOrderInput
                            icon={<Mail className="w-4 h-4" />}
                            label="Email"
                            type="email"
                            placeholder="email@example.com"
                            value={formData.customer_email}
                            onChange={(v) => handleChange('customer_email', v)}
                            error={errors.customer_email}
                        />
                        <QuickOrderInput
                            icon={<Phone className="w-4 h-4" />}
                            label="Phone"
                            type="tel"
                            placeholder="98XXXXXXXX"
                            value={formData.customer_contact_info}
                            onChange={(v) => handleChange('customer_contact_info', v)}
                            error={errors.customer_contact_info}
                        />
                        <QuickOrderInput
                            icon={<MapPin className="w-4 h-4" />}
                            label="Delivery Address"
                            placeholder="Your delivery address"
                            value={formData.address}
                            onChange={(v) => handleChange('address', v)}
                            error={errors.address}
                        />

                        {/* Remarks */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">
                                Remarks (Optional)
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Any special instructions..."
                                value={formData.remarks}
                                onChange={(e) => handleChange('remarks', e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#711a20] focus:ring-0 outline-none transition-colors resize-none"
                            />
                        </div>

                        {/* Total */}
                        <div className="bg-[#711a20]/5 rounded-2xl p-4 flex items-center justify-between">
                            <span className="font-bold uppercase tracking-widest text-sm">Total</span>
                            <span className="text-2xl font-black text-[#711a20]">{fCurrency(totalAmount)}</span>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#711a20] text-white py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-[#a00000] hover:shadow-[0_0_30px_rgba(139,0,0,0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Place Order
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </>
    );
}

// --------------------------------------------------------------------------------------------
// Reusable Input
// --------------------------------------------------------------------------------------------

function QuickOrderInput({ icon, label, type = 'text', placeholder, value, onChange, error }) {
    return (
        <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 flex items-center gap-1.5">
                {icon}
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors ${error
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-[#711a20]'
                    } focus:ring-0`}
            />
            {error && (
                <p className="text-red-500 text-xs font-bold mt-1">{error}</p>
            )}
        </div>
    );
}
