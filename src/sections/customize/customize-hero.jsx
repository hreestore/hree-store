'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/lib/store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    Check,
    ChevronRight,
    ChevronLeft,
    RotateCw,
    Maximize2,
    ShoppingBag,
    Info,
    Loader2,
} from 'lucide-react';

import { paths } from '@/routes/paths';
import {
    useGetCategories,
    useGetProducts,
    buildProductFilterQuery,
    getProductDetails,
    addProductToCart,
    validateCartCustomization,
} from '@/api';
import { fCurrency } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart as addToCartAction } from '@/redux/actions';
import { toast } from '@/components/snackbar';
import { useGetDesignCombination, useGetDesigns } from '@/api/design';
import { CONFIG } from '@/global-config';
import TshirtCanvas from '@/components/tshirt-canvas';
import Step1Category from './step-1-category';
import Step2Design from './step-2-design';
import Step3Size from './step-3-size';
import Step4Review from './step-4-review';
import { useGetColors } from '@/api/colors';
import { Button, IconButton } from '@mui/material';
import { varAlpha } from '@/utils/styles';
import { Iconify } from '@/components/iconify';
// --------------------------------------------------------------

export default function CustomizeHero() {

    const router = useRouter();
    const dispatch = useAppDispatch();

    // Get auth state at component top level (not inside event handlers)
    const { userToken, isLogin } = useAppSelector((state) => state.auth);

    const {
        currentStep,
        nextStep,
        prevStep,
        selectedProduct,
        selectedColor,
        selectedSize,
        frontDesign,
        backDesign,
        setSelectedProduct,
        setSelectedColor,
        setSelectedSize,
        setFrontDesign,
        setBackDesign,
        resetCustomizer
    } = useStore();

    const [selectedCombinationId, setSelectedCombinationId] = useState(null);

    const [isZoomed, setIsZoomed] = useState(false);
    const [isSwapped, setIsSwapped] = useState(false);
    const canvasRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null); // Selected product from step 2
    const [productDetails, setProductDetails] = useState(null); // Full product details with variants
    const [selectedVariantValues, setSelectedVariantValues] = useState({}); // { "Color": {id, value, ...}, "Size": {id, value, ...} }
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    const { categories } = useGetCategories();
    // const design = categories?.find(cat => cat.category_id === 272);
    console.log('selected item', selectedItem);
    useEffect(() => {
        setSelectedSubCategoryId(null);
    }, [selectedProduct?.category_id]);

    const activeCategoryId = selectedSubCategoryId ?? selectedProduct?.category_id;

    // Strict backend-aligned filtering:
    // 1) category_id
    // 2) is_customizable=1
    const productQuery = activeCategoryId
        ? buildProductFilterQuery({ category_id: activeCategoryId, is_customizable: 1 })
        : '';
    const { products } = useGetProducts(productQuery);
    const { designCombination, designsLoading, designsError } = useGetDesignCombination();

    // Color Combination
    const { colors } = useGetColors();

    const getColorStyle = (variantValue, variantTypeId) => {
        const normalizedColor = variantValue.value?.toLowerCase().trim();

        // Flatten in case the API returns data as [[...]]
        const colorList = colors ? colors.flat() : [];

        const apiColor = colorList.find(c =>
            c.variant_value_id?.toString() === variantValue.id?.toString()
        );

        if (apiColor?.primary_color) {
            if (
                apiColor.secondary_color &&
                apiColor.secondary_color !== apiColor.primary_color &&
                apiColor.primary_percentage != null &&
                apiColor.primary_percentage < 100
            ) {
                return `linear-gradient(135deg, ${apiColor.primary_color} ${apiColor.primary_percentage}%, ${apiColor.secondary_color} ${100 - apiColor.primary_percentage}%)`;
            }
            return apiColor.primary_color;
        }

        // CSS name fallback
        return normalizedColor || '#0b191a';
    };
    // Reset selectedItem when selectedProduct (category) changes
    useEffect(() => {
        setSelectedItem(null);
    }, [selectedProduct]);

    // Auto-select first product when products load or change
    useEffect(() => {
        if (products && products.length > 0) {
            // Check if current selection is valid for current products
            const isSelectionValid = selectedItem &&
                products.some(p => p.product_id === selectedItem.product_id);

            if (!isSelectionValid) {
                setSelectedItem(products[0]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products]);

    // Keep a deterministic preview source: selected item first, then first available product.
    const previewProduct = selectedItem || products?.[0] || null;
    const isHoodieTemplate = previewProduct?.name?.toLowerCase().includes('hoodie') || selectedProduct?.name?.toLowerCase().includes('hoodie');
    const isToteTemplate = previewProduct?.name?.toLowerCase().includes('tote bag') || selectedProduct?.name?.toLowerCase().includes('tote bag');
    const isSweatshirtTemplate = previewProduct?.name?.toLowerCase().includes('sweatshirt') || selectedProduct?.name?.toLowerCase().includes('sweatshirt');
    const isTshirtTemplate = previewProduct?.name?.toLowerCase().includes('t-shirt') || previewProduct?.name?.toLowerCase().includes('tshirt') || selectedProduct?.name?.toLowerCase().includes('t-shirt') || selectedProduct?.name?.toLowerCase().includes('tshirt');

    // Fetch product details with variants when selectedItem changes
    useEffect(() => {
        async function fetchProductDetails() {
            if (selectedItem?.slug) {
                const details = await getProductDetails(selectedItem.slug);
                setProductDetails(details);
                // Reset variant selections when product changes
                setSelectedVariantValues({});
            } else {
                setProductDetails(null);
                setSelectedVariantValues({});
            }
        }
        fetchProductDetails();
    }, [selectedItem]);

    // Helper function: Extract unique variant types from variants
    const extractVariantTypes = useMemo(() => {
        if (!productDetails?.variants || productDetails.variants.length === 0) return [];

        const typesMap = new Map();
        productDetails.variants.forEach(variant => {
            variant.variant_values?.forEach(vv => {
                if (vv.variant_type && !typesMap.has(vv.variant_type.id)) {
                    typesMap.set(vv.variant_type.id, vv.variant_type);
                }
            });
        });

        return Array.from(typesMap.values());
    }, [productDetails]);

    // Helper function: Get all possible values for a variant type regardless of other selections
    const getAllValuesForType = useMemo(() => {
        return (variantTypeId) => {
            if (!productDetails?.variants || productDetails.variants.length === 0) return [];

            const valuesMap = new Map();
            productDetails.variants.forEach(variant => {
                const targetValue = variant.variant_values?.find(vv =>
                    vv.variant_type.id === variantTypeId
                );
                if (targetValue && !valuesMap.has(targetValue.value)) {
                    valuesMap.set(targetValue.value, targetValue);
                }
            });

            return Array.from(valuesMap.values());
        };
    }, [productDetails]);

    // Helper function: Get all available values for a specific variant type based on current selections
    const getAvailableValuesForType = useMemo(() => {
        return (variantTypeId) => {
            if (!productDetails?.variants || productDetails.variants.length === 0) return [];

            // Get other selected variant types (excluding the current one)
            const otherSelections = Object.entries(selectedVariantValues)
                .filter(([typeId]) => typeId !== variantTypeId.toString());

            // Filter variants that match all other selections
            const compatibleVariants = productDetails.variants.filter(variant => {
                return otherSelections.every(([typeId, selectedValue]) => {
                    return variant.variant_values?.some(vv =>
                        vv.variant_type.id.toString() === typeId &&
                        vv.value === selectedValue.value
                    );
                });
            });

            // Extract unique values for the target variant type
            const valuesMap = new Map();
            compatibleVariants.forEach(variant => {
                const targetValue = variant.variant_values?.find(vv =>
                    vv.variant_type.id === variantTypeId
                );
                if (targetValue && !valuesMap.has(targetValue.value)) {
                    valuesMap.set(targetValue.value, targetValue);
                }
            });

            return Array.from(valuesMap.values());
        };
    }, [productDetails, selectedVariantValues]);

    // Handle variant value selection
    const handleVariantSelection = (variantType, variantValue) => {
        if (!variantValue) {
            setSelectedVariantValues(prev => {
                const newState = { ...prev };
                delete newState[variantType.id];

                // If a variant like color is unselected, also unselect size
                if (variantType.name.toLowerCase() === 'color') {
                    const sizeType = extractVariantTypes.find(vt => vt.name.toLowerCase() === 'size');
                    if (sizeType) {
                        delete newState[sizeType.id];
                    }
                }

                return newState;
            });

            if (variantType.name.toLowerCase() === 'color') {
                setSelectedColor(null);
                setSelectedSize(null);
            } else if (variantType.name.toLowerCase() === 'size') {
                setSelectedSize(null);
            }
            return;
        }

        setSelectedVariantValues(prev => ({
            ...prev,
            [variantType.id]: {
                type: variantType,
                ...variantValue
            }
        }));

        // Update the global store based on variant type
        if (variantType.name.toLowerCase() === 'color') {
            const resolvedStyle = getColorStyle(variantValue, variantType.id);
            setSelectedColor({ name: variantValue.value, hex: resolvedStyle });
        } else if (variantType.name.toLowerCase() === 'size') {
            setSelectedSize(variantValue.value);
        }
    };

    // Helper function: Find the currently selected variant based on selected variant values
    const selectedVariant = useMemo(() => {
        if (!productDetails?.variants || productDetails.variants.length === 0) return null;
        if (Object.keys(selectedVariantValues).length === 0) return null;

        // Find variant that matches all selected variant values
        return productDetails.variants.find(variant => {
            // Check if this variant matches all selected values
            return Object.entries(selectedVariantValues).every(([typeId, selectedValue]) => {
                return variant.variant_values?.some(vv =>
                    vv.variant_type.id.toString() === typeId &&
                    vv.value === selectedValue.value
                );
            });
        });
    }, [productDetails, selectedVariantValues]);

    // Auto-select color if there's only one available color
    useEffect(() => {
        if (!productDetails?.variants || productDetails.variants.length === 0) return;

        // Find color variant type
        const colorVariantType = extractVariantTypes.find(vt => vt.name.toLowerCase() === 'color');
        if (!colorVariantType) return;

        // Get all unique colors
        const availableColors = getAvailableValuesForType(colorVariantType.id);

        // If only 1 color and it's not already selected, select it automatically
        if (availableColors.length === 1 && !selectedVariantValues[colorVariantType.id]) {
            handleVariantSelection(colorVariantType, availableColors[0]);
        }
    }, [productDetails, extractVariantTypes, getAvailableValuesForType, selectedVariantValues]);

    // Preview image priority: selectedVariant > selected/first product from step 2 > tshirtConcept > selectedProduct (category)
    const activePreviewImage = selectedVariant
        ? selectedVariant.image
        : previewProduct
            ? (previewProduct.featured_image || previewProduct.image) : '';

    const steps = [
        'Category',
        'Colors & Designs',
        'Size',
        'Final Review',
    ];

    const hasDesignSelection = Boolean(
        frontDesign?.id ||
        frontDesign?.image ||
        backDesign?.id ||
        backDesign?.image
    );

    const canGoNext = () => {
        if (currentStep === 1) return !!selectedProduct;
        if (currentStep === 2) return !!selectedItem && hasDesignSelection;
        if (currentStep === 3) {
            // Check that all variant types have been selected
            if (!productDetails?.variants || productDetails.variants.length === 0) {
                return !!selectedColor && !!selectedSize; // Fallback to old behavior
            }
            return extractVariantTypes.length > 0 &&
                extractVariantTypes.every(type => selectedVariantValues[type.id]);
        }
        if (currentStep === 4) return !!frontDesign;
        return true;
    };
    const handleFinalAction = async (isBuyNow) => {
        if (!selectedItem) {
            toast.error('Please select a product');
            return;
        }

        setIsAddingToCart(true);
        try {
            const shouldSyncToServer = Boolean(isLogin && userToken);
            const hasActiveVariants = Array.isArray(productDetails?.variants) && productDetails.variants.length > 0;
            if (hasActiveVariants && !selectedVariant?.variant_id) {
                throw new Error('Product has active variants, please select a variant.');
            }
            const explicitlyNotCustomizable =
                selectedVariant?.is_customizable === false ||
                selectedVariant?.is_customized === false ||
                selectedItem?.is_customizable === false ||
                selectedItem?.is_customized === false;
            const extractApiMessage = (error) => {
                const fieldErrors = error?.fieldErrors || error?.data;
                if (fieldErrors && typeof fieldErrors === 'object') {
                    const firstFieldMessage = Object.values(fieldErrors).flat().find((msg) => typeof msg === 'string');
                    if (firstFieldMessage) return firstFieldMessage;
                }
                return error?.message || 'Failed to add to cart. Please try again.';
            };
            const combinationList = Array.isArray(designCombination?.data)
                ? designCombination.data
                : Array.isArray(designCombination)
                    ? designCombination
                    : [];
            const selectedCombinationKey = selectedCombinationId || frontDesign?.id;
            const selectedCombination = combinationList.find(
                (dc) => String(dc?.id) === String(selectedCombinationKey)
            );

            const selectedCombinationItems = Array.isArray(selectedCombination?.items)
                ? selectedCombination.items
                : [];
            const designCombinationId = selectedCombination?.id || selectedCombinationId;
            const designIdsFromCombination = selectedCombinationItems
                .map((item) => item?.design?.id)
                .filter(Boolean);
            const selectedDesignIds = [frontDesign?.id, backDesign?.id].filter(Boolean);
            const designIds = selectedDesignIds.length
                ? selectedDesignIds.filter((id) => designIdsFromCombination.includes(id))
                : designIdsFromCombination;
            const backDesignIdFromCombination = selectedCombinationItems.find(
                (item) => item?.design?.placement?.code === 'back'
            )?.design?.id;

            if (!designCombinationId || !designIds.length) {
                toast.error('Please select a valid design combination');
                return;
            }

            const buildCustomizedPayload = (productType, productId, payloadDesignIds = designIds) => ({
                product_id: productId,
                quantity: 1,
                product_type: productType,
                is_customized: true,
                design_combination_id: designCombinationId,
                design_ids: payloadDesignIds,
                swapped_combination: (isHoodieTemplate || isToteTemplate) ? false : isSwapped,
                customization: {
                    design_combination_id: designCombinationId,
                    design_ids: payloadDesignIds,
                    swapped_combination: (isHoodieTemplate || isToteTemplate) ? false : isSwapped,
                },
            });
            const buildNonCustomizedPayload = (productType, productId) => ({
                product_id: productId,
                quantity: 1,
                product_type: productType,
                is_customized: false,
            });

            const primaryPayload =
                selectedVariant?.variant_id
                    ? buildCustomizedPayload('ProductVariant', selectedVariant.variant_id)
                    : buildCustomizedPayload('Product', selectedItem?.product_id);
            let cartPayloadItem = explicitlyNotCustomizable
                ? (selectedVariant?.variant_id
                    ? buildNonCustomizedPayload('ProductVariant', selectedVariant.variant_id)
                    : buildNonCustomizedPayload('Product', selectedItem?.product_id))
                : primaryPayload;

            let cartId = Date.now();

            if (shouldSyncToServer && !explicitlyNotCustomizable) {
                try {
                    await validateCartCustomization(primaryPayload);
                } catch (validationError) {
                    const customizationErrors = validationError?.fieldErrors?.customization || validationError?.data?.customization || [];
                    const placementBackDisabled = Array.isArray(customizationErrors)
                        && customizationErrors.some((msg) => String(msg).toLowerCase().includes('placement [back] is disabled'));
                    const hasCustomizationRejection = Array.isArray(customizationErrors)
                        && customizationErrors.some((msg) => String(msg).toLowerCase().includes('cannot be customized'));

                    if (placementBackDisabled && backDesignIdFromCombination) {
                        const designIdsWithoutBack = designIds.filter((id) => String(id) !== String(backDesignIdFromCombination));
                        if (designIdsWithoutBack.length > 0) {
                            const noBackPayload = buildCustomizedPayload(
                                primaryPayload.product_type,
                                primaryPayload.product_id,
                                designIdsWithoutBack
                            );
                            await validateCartCustomization(noBackPayload);
                            cartPayloadItem = noBackPayload;
                        } else {
                            cartPayloadItem = selectedVariant?.variant_id
                                ? buildNonCustomizedPayload('ProductVariant', selectedVariant.variant_id)
                                : buildNonCustomizedPayload('Product', selectedItem?.product_id);
                        }
                    } else if (!hasCustomizationRejection) {
                        throw new Error(extractApiMessage(validationError));
                    } else {
                        try {
                            if (hasActiveVariants) {
                                throw validationError;
                            }

                            const fallbackPayload = buildCustomizedPayload('Product', selectedItem?.product_id);
                            await validateCartCustomization(fallbackPayload);
                            cartPayloadItem = fallbackPayload;
                        } catch (fallbackValidationError) {
                            const fallbackErrors =
                                fallbackValidationError?.fieldErrors?.customization ||
                                fallbackValidationError?.data?.customization ||
                                [];
                            const fallbackRejected = Array.isArray(fallbackErrors)
                                && fallbackErrors.some((msg) => String(msg).toLowerCase().includes('cannot be customized'));

                            if (!fallbackRejected) {
                                throw new Error(extractApiMessage(fallbackValidationError));
                            }

                            cartPayloadItem = selectedVariant?.variant_id
                                ? buildNonCustomizedPayload('ProductVariant', selectedVariant.variant_id)
                                : buildNonCustomizedPayload('Product', selectedItem?.product_id);
                            toast.warning('Selected item does not support customization. Added as non-customized.');
                        }
                    }
                }
            } else if (shouldSyncToServer && explicitlyNotCustomizable) {
                toast.warning('Selected item does not support customization. Added as non-customized.');
            }

            if (shouldSyncToServer) {

                const response = await addProductToCart([cartPayloadItem], userToken);
                let responseItem = response;
                if (Array.isArray(response)) {
                    responseItem = response[0];
                } else if (response?.items && Array.isArray(response.items)) {
                    responseItem = response.items[0];
                } else if (response?.data && Array.isArray(response.data)) {
                    responseItem = response.data[0];
                }
                cartId = responseItem?.cart_id || responseItem?.id || Date.now();
            }
            const cartItem = {
                cart_id: cartId,
                product_id: selectedVariant?.variant_id || selectedItem.product_id,
                itemable_id: selectedItem.product_id,
                product_type: cartPayloadItem?.product_type || (selectedVariant ? "ProductVariant" : "Product"),
                product_name: selectedItem.name,
                item_name: selectedItem.name,
                slug: selectedItem.slug,
                featured_image: selectedItem.featured_image || selectedItem.image,
                item_image: selectedItem.featured_image || selectedItem.image,
                price: selectedVariant?.price || selectedItem?.selling_price?.flashSalePrice || selectedItem?.selling_price?.regularPrice || selectedItem?.price,
                regular_price: selectedVariant?.price || selectedItem?.selling_price?.regularPrice || selectedItem?.price,
                quantity: 1,
                variant_id: selectedVariant?.variant_id,
                tshirtFrontImage: activePreviewImage,
                frontDesign: frontDesign ? { ...frontDesign, frontImage: frontDesign.image } : null,
                backDesign: backDesign ? { ...backDesign, frontImage: backDesign.image } : null,
                color: selectedColor,
                // Customization fields
                is_customized: Boolean(cartPayloadItem?.is_customized),
                ...(cartPayloadItem?.is_customized
                    ? {
                        design_combination_id: cartPayloadItem?.design_combination_id || designCombinationId,
                        design_ids: cartPayloadItem?.design_ids || designIds,
                        swapped_combination: cartPayloadItem?.swapped_combination ?? isSwapped,
                        customization: {
                            design_combination_id: cartPayloadItem?.design_combination_id || designCombinationId,
                            design_ids: cartPayloadItem?.design_ids || designIds,
                            swapped_combination: cartPayloadItem?.swapped_combination ?? isSwapped,
                        },
                    }
                    : {}),
            };


            dispatch(addToCartAction(cartItem));

            toast.success('Product added to cart!');
            resetCustomizer();

            if (isBuyNow) {
                router.push('/checkout');
            } else {
                router.push(paths.cart);
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            const fieldErrors = error?.fieldErrors || error?.data;
            const firstFieldError = fieldErrors && typeof fieldErrors === 'object'
                ? Object.values(fieldErrors).flat().find((msg) => typeof msg === 'string')
                : null;
            toast.error(firstFieldError || error?.message || 'Failed to add to cart. Please try again.');
        } finally {
            setIsAddingToCart(false);
        }
    };
    const handleAddToCart = async () => {
        let newProduct = {
            product_id,
            quantity: 1,
        };

        if (!!variants?.length) {
            newProduct.variant_id = variants[0].variant_id;
        }

        try {
            if (isLogin) {
                // Add to cart via API
                const cartResponse = await addProductToCart([newProduct]);
                dispatch(getCartDataRequest());
            } else {
                newProduct = {
                    ...newProduct,
                    cart_id: items.length + 1,
                    product_name: name,
                    featured_image,
                    slug,
                    price: flashSalePrice || regularPrice,
                };

                dispatch(addToCart(newProduct));
            }

            toast.success("Product added to cart!");
        } catch (error) {
            // console.error("[ADD TO CART] Error:", error);
            toast.error("Couldn't add product to cart! Try again");
        }
    };

    const handleBuyNow = async () => {
        if (!isLogin) {
            router.push(`${paths.checkout}?buyNow=true&productSlug=${slug}&quantity=1`);
            return;
        }

        // Logged in: Add to cart first, then go to cart page
        let newProduct = {
            product_id,
            quantity: 1,
        };

        if (!!variants?.length) {
            newProduct.variant_id = variants[0].variant_id;
        }

        try {
            // Add to cart via API
            const cartResponse = await addProductToCart([newProduct]);

            // After successful API call, refresh cart from server
            dispatch(getCartDataRequest());

            toast.success("Product added to cart!");

            // Navigate to cart page
            router.push(paths.cart);
        } catch (error) {
            toast.error("Couldn't add product to cart! Try again");
        }
    };

    const renderRegularPrice = (price) => (
        <Box
            component="span"
            sx={{ color: "text.disabled", textDecoration: "line-through" }}
        >
            {fCurrency(price)}
        </Box>
    );

    const renderSalePrice = (price) => (
        <Box component="span">{fCurrency(price)}</Box>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-20 py-16">
            {/* Progress Indicator */}
            <div className="mt-2 lg:mt-0 sticky top-0 z-40 backdrop-blur-md py-3 mb-2 lg:mb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 ">
                {/* Mobile Progress */}
                <div className="md:hidden flex items-center justify-between mb-0">
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Step {currentStep} of {steps.length}</span>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#711a20]">{steps[currentStep - 1]}</span>
                </div>

                {/* Desktop Progress */}
                <div className="hidden md:flex items-center justify-center gap-2">
                    {steps.map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                            <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 border ${currentStep > i + 1
                                    ? 'bg-white text-[#711a20]' :
                                    currentStep === i + 1
                                        ? 'bg-[#711a20] text-[#ffffff] shadow-sm transform scale-[1.02]' :
                                        'bg-gray-50 border-gray-100 text-gray-800'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep > i + 1 ? 'bg-[#711a20]/10' :
                                    currentStep === i + 1 ? 'bg-white/20' :
                                        'bg-gray-200 text-gray-500'
                                    }`}>
                                    {currentStep > i + 1 ? <Check className="w-3 h-3 stroke-[3]" /> : i + 1}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {step}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-6 h-[2px] rounded-full ${currentStep > i + 1 ? 'bg-[#711a20]/20' : 'bg-gray-100'}`} />
                            )}
                        </div>
                    ))}
                </div>
                {/* <div className="h-1.5 bg-[#081a1a] rounded-full text-[#ffffff] overflow-hidden">
                    <motion.div
                        className="h-full bg-[#711a20]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    />
                </div> */}
            </div>

            <div className={`flex flex-col lg:grid gap-2 lg:gap-20 lg:py-2 sticky top-10 lg:top-32 items-start ${currentStep > 1 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>

                {/* Left Side: Preview (Sticky on Mobile) */}
                {currentStep > 1 && (
                    <div className=" z-20  pb-4 lg:pb-0 w-full">
                        {selectedProduct?.subCategories?.filter(
                            (subCat) => subCat.status === true || subCat.status === 1
                        ).length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#711a20]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#711a20] [&::-webkit-scrollbar-thumb]:rounded-full">

                                    {selectedProduct.subCategories
                                        .filter(
                                            (subCat) =>
                                                subCat.status === true || subCat.status === 1
                                        )
                                        .map((subCat) => (
                                            <button
                                                key={subCat.category_id}
                                                onClick={() => setSelectedSubCategoryId(subCat.category_id)}
                                                className={`px-2 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSubCategoryId === subCat.category_id
                                                    ? 'bg-[#711a20] text-[#ffffff] shadow-xl'
                                                    : 'bg-[#ffffff] text-[#081a1a] hover:bg-[#711a20] hover:text-[#ffffff]'
                                                    }`}
                                            >
                                                {subCat.name}
                                            </button>
                                        ))}

                                </div>
                            )}
                        <div className="relative rounded-2xl lg:rounded-[2.5rem] overflow-hidden bg-gray-50 border border-[#081a1a]/5 shadow-xl lg:shadow-2xl group" style={{ aspectRatio: '16 / 11' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${previewProduct?.product_id || selectedProduct?.id}-${selectedVariant?.variant_id || 'no-variant'}-${selectedColor?.hex}`}
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.92 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute inset-0"
                                >
                                    {(previewProduct || selectedProduct) ? (
                                        <TshirtCanvas
                                            ref={canvasRef}
                                            mockUrl={activePreviewImage || ''}
                                            frontDesignUrl={frontDesign?.image || null}
                                            backDesignUrl={backDesign?.image || null}
                                            isSwapped={(isHoodieTemplate || isToteTemplate) ? false : isSwapped}
                                            isReverseMockup={isHoodieTemplate}
                                            className={`transition-transform duration-300 cursor-zoom-in ${isZoomed ? 'scale-120' : 'scale-100 hover:scale-105'}`}
                                            frontConfig={{
                                                scale: isHoodieTemplate ? 0.79 : isSweatshirtTemplate ? 0.80 : isToteTemplate ? 0.75 : isTshirtTemplate ? 0.85 : 1,
                                                shiftX: isToteTemplate ? 0.115 : isSweatshirtTemplate ? 0.070 : isTshirtTemplate ? 0.055 : -0.03,
                                                shiftY: isToteTemplate ? 0.19 : isSweatshirtTemplate ? 0.030 : isTshirtTemplate ? -0.02 : 0.125,
                                                rotation: 0
                                            }}
                                            backConfig={{
                                                scale: isHoodieTemplate ? 0.3 : isSweatshirtTemplate ? 0.40 : isToteTemplate ? 0.55 : isTshirtTemplate ? 0.30 : 1,
                                                shiftX: isToteTemplate ? -0.11 : isSweatshirtTemplate ? -0.055 : isTshirtTemplate ? -0.05 : 0.020,
                                                shiftY: isToteTemplate ? 0.19 : isSweatshirtTemplate ? -0.16 : isTshirtTemplate ? -0.23 : 0.04,
                                                rotation: 0
                                            }}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#ffffff] p-12 text-center">
                                            <div className="w-32 h-32 bg-[#081a1a] rounded-full text-[#ffffff] flex items-center justify-center mb-8 animate-pulse">
                                                <ShoppingBag className="w-12 h-12 opacity-20" />
                                            </div>
                                            <p className="text-2xl font-display font-black uppercase tracking-tighter text-[#081a1a]">Select a product to start</p>
                                            <p className="text-gray-400 mt-2 font-medium">Your creative journey begins here.</p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {selectedProduct && (frontDesign || backDesign) && !isHoodieTemplate && !isToteTemplate && (
                                <div className="absolute right-6 bottom-6 lg:right-6 lg:bottom-6 flex flex-col gap-2 z-[100]">
                                    <button
                                        onClick={() => setIsSwapped(!isSwapped)}
                                        className="flex items-center justify-center bg-[#081a1a]/90 text-[#ffffff] backdrop-blur-xl p-2 rounded-3xl shadow-2xl border border-white/10 hover:bg-[#711a20] transition-all"
                                        title="Swap Designs"
                                    >
                                        Swap <Iconify icon="mdi:swap-horizontal" width={24} />
                                    </button>
                                </div>
                            )}

                            {/* <button
                                onClick={() => setIsZoomed(!isZoomed)}
                                className="absolute top-6 right-6 lg:top-10 lg:right-10 p-3 lg:p-4 bg-[#ffffff]/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#081a1a]/5 hover:bg-[#081a1a] hover:text-[#ffffff] transition-all group"
                            >
                                <Maximize2 className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
                            </button> */}
                        </div>
                        {extractVariantTypes.filter(vt => vt.name.toLowerCase() === 'color').map((variantType) => {
                            const availableValues = getAvailableValuesForType(variantType.id);
                            const allValues = getAllValuesForType(variantType.id);
                            const displayValues = allValues.length > 0 ? allValues : availableValues;
                            const selectedValue = selectedVariantValues[variantType.id];

                            return (
                                <div key={variantType.id} className="space-y-6 lg:space-y-8 mt-5">
                                    {/* <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center mb-3">
                                        Available {variantType.name}
                                    </h3> */}
                                    <div className="flex flex-wrap gap-1 lg:gap-2 justify-center">
                                        {displayValues.map((variantValue) => {
                                            const isAvailable = availableValues.some(av => av.value === variantValue.value);
                                            const isSelected = selectedValue?.value === variantValue.value;

                                            return (
                                                <button
                                                    key={variantValue.id}
                                                    disabled={!isAvailable}
                                                    onClick={() => isAvailable && handleVariantSelection(variantType, isSelected ? null : variantValue)}
                                                    className={`group relative w-14 h-14 lg:w-13 lg:h-13 rounded-2xl lg:rounded-2xl border-2 lg:border-2 transition-all duration-500 flex items-center justify-center ${!isAvailable
                                                        ? 'border-gray-200 opacity-50 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'border-[#081a1a] scale-110 shadow-xl lg:shadow-2xl border-2'
                                                            : 'border-transparent hover:scale-105'
                                                        }`}
                                                >
                                                    <span
                                                        className="w-10 h-10 lg:w-10 lg:h-10 rounded-xl lg:rounded-1xl shadow-inner relative overflow-hidden"
                                                        style={{ background: getColorStyle(variantValue, variantType.id) }}
                                                    >
                                                        {!isAvailable && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-[150%] h-[2px] bg-red-500 rotate-[-45deg]"></div>
                                                            </div>
                                                        )}
                                                    </span>
                                                    {isSelected && (
                                                        <Check className={`w-6 h-6 lg:w-8 lg:h-8 absolute ${variantValue.value.toLowerCase() === 'white' ? 'text-[#081a1a]' : 'text-[#ffffff]'}`} />
                                                    )}
                                                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap bg-gray-900 text-[#ffffff] px-2.5 py-1 rounded-md shadow-lg pointer-events-none z-50">
                                                        {variantValue.value} {!isAvailable && '(Unavailable)'}
                                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Right Side: Controls */}

                <div className="space-y-2 lg:space-y-16 pb-0 lg:pb-0 w-full">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <Step1Category
                                categories={categories}
                                selectedProduct={selectedProduct}
                                setSelectedProduct={setSelectedProduct}
                                nextStep={nextStep}
                            />
                        )}

                        {currentStep === 2 && (
                            <Step2Design
                                setSelectedCombinationId={setSelectedCombinationId}
                                selectedCombinationId={selectedCombinationId}
                                designsLoading={designsLoading}
                                designsError={designsError}
                                designCombination={designCombination}
                                frontDesign={frontDesign}
                                backDesign={backDesign}
                                setFrontDesign={setFrontDesign}
                                setBackDesign={setBackDesign}
                                selectedItem={selectedItem}
                                selectedVariant={selectedVariant}
                                hasDesignSelection={hasDesignSelection}
                            />
                        )}

                        {currentStep === 3 && (
                            <Step3Size
                                extractVariantTypes={extractVariantTypes}
                                getAvailableValuesForType={getAvailableValuesForType}
                                selectedVariantValues={selectedVariantValues}
                                handleVariantSelection={handleVariantSelection}
                                selectedProduct={selectedProduct}
                                productDetails={productDetails}
                            />
                        )}

                        {currentStep === 4 && (
                            <Step4Review
                                selectedProduct={selectedProduct}
                                selectedColor={selectedColor}
                                selectedSize={selectedSize}
                                frontDesign={frontDesign}
                                backDesign={backDesign}
                                selectedVariant={selectedVariant}
                                selectedItem={selectedItem}
                            />
                        )}

                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className=" p-3 pb-4 sm:p-4  backdrop-blur-2xl border-t  border-[#081a1a]/10 lg:relative lg:bg-transparent lg:border-0 lg:p-0 flex items-center gap-3 z-50">
                        {currentStep > 1 && (
                            <button
                                onClick={prevStep}
                                className={`flex-[2] py-3 lg:py-4 rounded-xl   lg:rounded-3xl font-display font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 shadow-lg ${canGoNext() && !isAddingToCart
                                    ? ' hover:bg-[#711a20] hover:text-[#ffffff] hover:scale-[1.02] border-2 active:scale-95 '
                                    : ' cursor-not-allowed border-2 border-[#081a1a]/10 hover:text-white'
                                    }`}                            >
                                <ChevronLeft className="w-5 h-5 lg:w-5 lg:h-5" />
                                <span className="hidden sm:inline">Back</span>
                            </button>
                        )}
                        {currentStep === 4 ? (
                            <>
                                <button
                                    onClick={() => handleFinalAction(false)}
                                    disabled={!canGoNext() || isAddingToCart}
                                    className={`flex-[2] py-3 lg:py-4 rounded-xl   lg:rounded-3xl font-display font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 shadow-lg ${canGoNext() && !isAddingToCart
                                        ? ' hover:bg-[#711a20] hover:text-[#ffffff] hover:scale-[1.02] border-2 active:scale-95 '
                                        : ' cursor-not-allowed border-2 border-[#081a1a]/10 hover:text-white'
                                        }`}
                                >
                                    {isAddingToCart ? (
                                        <>
                                            <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5" />
                                            <span className="hidden sm:inline">Add to Cart</span>
                                            <span className="inline sm:hidden">Cart</span>
                                        </>
                                    )}
                                </button>

                                {!isLogin && (
                                    <button
                                        onClick={() => handleFinalAction(true)}
                                        disabled={!canGoNext() || isAddingToCart}
                                        className={`flex-[2] py-3 lg:py-4 rounded-xl   lg:rounded-3xl font-display font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 shadow-lg ${canGoNext() && !isAddingToCart
                                            ? ' hover:bg-[#711a20] hover:text-[#ffffff] hover:scale-[1.02] border-2 active:scale-95 '
                                            : ' cursor-not-allowed border-2 border-[#081a1a]/10 hover:text-white'
                                            }`}
                                    >
                                        {isAddingToCart ? (
                                            <>
                                                <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Buy Now
                                                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={nextStep}
                                disabled={!canGoNext() || isAddingToCart}
                                className={`flex-[2] py-3 lg:py-4 rounded-xl   lg:rounded-3xl font-display font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 shadow-lg ${canGoNext() && !isAddingToCart
                                    ? ' hover:bg-[#711a20] hover:text-[#ffffff] hover:scale-[1.02] border-2 active:scale-95 '
                                    : ' cursor-not-allowed border-2 border-[#081a1a]/10 '
                                    }`}
                            >
                                <>
                                    Next Step
                                    <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                                </>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

