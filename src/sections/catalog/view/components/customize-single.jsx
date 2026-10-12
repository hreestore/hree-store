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
    Ruler,
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
import { getVendorDetails, useGetVendor } from '@/api/vendor';
import { useGetDesignCombination, useGetDesignCombinationShow, useGetDesigns } from '@/api/design';
import { CONFIG } from '@/global-config';
import TshirtCanvas from '@/components/tshirt-canvas';
import { useGetColors } from '@/api/colors';
import { Iconify } from '@/components/iconify';
import { useGetSizeCatalogue } from '@/api/size-catalogue';
import { Markdown } from '@/components/markdown';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

// --------------------------------------------------------------
// Step 1: Category Selection
// --------------------------------------------------------------

function Step1Category({ categories, selectedProduct, setSelectedProduct, urlCategoryName, urlCategoryDescription }) {
    return (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-5 mb-4 lg:mt-0"
        >

            {(urlCategoryName || urlCategoryDescription) && (
                <div className="mb-4">
                    {urlCategoryName && (
                        <h2 className="text-3xl lg:text-3xl font-display font-black uppercase  mb-2 lg:mb-2 leading-none">
                            {urlCategoryName.split(' ').map((word, index) => (
                                <span
                                    key={index}>
                                    {word}{' '}
                                </span>
                            ))}
                        </h2>
                    )}
                    {urlCategoryDescription && (
                        <Markdown className="text-gray-500 text-base lg:text-md mb-4" children={urlCategoryDescription} />
                    )}
                </div>
            )}
            <h2 className="text-md lg:text-md font-semibold font-montserrat mb-2 lg:mb-2 leading-none">
                Select Category
            </h2>
            <div className="flex overflow-x-auto gap-3 p-1">
                {categories?.filter(type => type.show_in_home === true).map((type, index) => {
                    const isActive = selectedProduct?.category_id === type.category_id || (!selectedProduct && index === 0);
                    return (
                        <button
                            key={type.category_id}
                            onClick={() => { setSelectedProduct(type); }}
                            className={`group relative flex-shrink-0 whitespace-nowrap px-3 py-1.5 cursor-pointer rounded-2xl lg:rounded-[3rem] overflow-hidden border-1 lg:border-2 transition-all duration-500 ${isActive
                                ? 'bg-[#711a20] text-[#ffffff] border-[#711a20] scale-[1.02] shadow-xl lg:shadow-2xl'
                                : 'bg-transparent border-transparent hover:border-[#f7e6dc]'
                                }`}
                        >
                            <h3 className="text-sm lg:text-md font-montserrat tracking-tighter whitespace-nowrap">{type.name}</h3>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}

// --------------------------------------------------------------
// Step 2: Design Selection (with canvas-based image protection)
// --------------------------------------------------------------

const CanvasImage = ({ src, alt }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!src || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new window.Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        img.src = src;
    }, [src]);

    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                className="w-full h-full object-cover pointer-events-auto"
                onContextMenu={(e) => e.preventDefault()}
                style={{
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    WebkitTouchCallout: 'none',
                }}
            />
            {/* Overlay to block direct inspection of canvas pixel data */}
            <div
                className="absolute inset-0 z-10"
                onContextMenu={(e) => e.preventDefault()}
                style={{ cursor: 'pointer' }}
            />
        </div>
    );
};

function Step2Design({
    setSelectedCombinationId,
    selectedCombinationId,
    designsLoading,
    designsError,
    designCombination,
    frontDesign,
    backDesign,
    setFrontDesign,
    setBackDesign,
    selectedItem,
    selectedVariant,
    hasDesignSelection
}) {
    const isHoodieTemplate = selectedItem?.name?.toLowerCase().includes('hoodie');
    return (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-1 mb-3 py-3"
        >
            <div className='mb-2'>
                <h2 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tighter mb-2 lg:mb-2 leading-none">Select Color & Design </h2>
            </div>

            {!hasDesignSelection && !designsLoading && !designsError && (
                <p className="text-sm font-bold text-[#711a20]">
                    Please choose a design to continue to the next step.
                </p>
            )}

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-0 lg:gap-1 max-h-[30vh] lg:max-h-[30vh] overflow-y-auto pr-2 lg:pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#711a20]/50 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/80 [&::-webkit-scrollbar-thumb]:rounded-full">
                {designsLoading && (
                    <div className="col-span-full flex items-center justify-center py-10">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                )}

                {designsError && (
                    <div className="col-span-full flex items-center justify-center py-10">
                        <p className="text-gray-400">Failed to load designs. Please try again later.</p>
                    </div>
                )}

                {Array.isArray(designCombination?.data) && designCombination.data.map((combination) => {
                    const frontItem = combination.items.find(item => item.design.placement.code === 'front');
                    const backItem = combination.items.find(item => item.design.placement.code === 'back');
                    if (!frontItem) return null;

                    const frontPayload = {
                        id: frontItem.design.id,
                        name: frontItem.design.name,
                        image: CONFIG.assetsDir + frontItem.design.featured_image,
                    };
                    const backPayload = backItem ? {
                        id: backItem.design.id,
                        name: backItem.design.name,
                        image: CONFIG.assetsDir + backItem.design.featured_image,
                    } : null;

                    const isSelected = String(selectedCombinationId) === String(combination.id);
                    const primaryItem = combination.items.find(item => item.is_primary);

                    return (
                        <button
                            key={combination.id}
                            onClick={() => {
                                setSelectedCombinationId(combination.id);
                                setFrontDesign(frontPayload);
                                setBackDesign(backPayload);
                            }}
                            className={`group relative rounded-2xl lg:rounded-2xl overflow-hidden border-2 lg:border-4 transition-all duration-500 ${isSelected
                                ? 'border-[#711a20] scale-75 shadow-inner'
                                : 'border-transparent hover:border-[#081a1a]/10'
                                }`}
                        >
                            <div className="p-2 lg:p-2.5">
                                <div className="relative aspect-square rounded-xl lg:rounded-xl overflow-hidden border border-[#ffffff]/40 mb-0 pb-0">
                                    <CanvasImage
                                        src={CONFIG.assetsDir + primaryItem.design.featured_image}
                                        alt={primaryItem.design.name}
                                    />
                                </div>
                            </div>
                            {isSelected && (
                                <div className="absolute top-4 right-4 lg:top-4 lg:right-4 bg-[#711a20] text-[#ffffff] p-2 lg:p-3 rounded-xl lg:rounded-2xl shadow-2xl rotate-12">
                                    <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedItem && (
                <div className="flex justify-center">
                    <div className="px-4 py-3 mt-4 border-white rounded-xl border flex items-center justify-between gap-4 shadow-sm w-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                            <div className="flex flex-col">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Selected Product</p>
                                <p className="font-display font-black uppercase tracking-tight text-sm lg:text-base leading-none truncate max-w-[200px] lg:max-w-xs">{selectedItem.name}</p>
                            </div>
                            <div className="hidden lg:block w-1 h-1 rounded-full bg-gray-300" />
                        </div>
                        <div className='flex gap-2 items-center'>
                            <p className="text-sm font-bold mt-1 lg:mt-0">
                                {fCurrency(
                                    selectedVariant?.price ||
                                    selectedItem?.selling_price?.flashSalePrice ||
                                    selectedItem?.selling_price?.regularPrice ||
                                    selectedItem?.price || 0
                                )}
                            </p>
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full border border-[#081a1a]/5">
                                <Check className="w-4 h-4 text-[#711a20]" strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// --------------------------------------------------------------
// Step 3: Size Selection
// --------------------------------------------------------------

function Step3Size({
    extractVariantTypes,
    getAvailableValuesForType,
    selectedVariantValues,
    handleVariantSelection,
    selectedProduct,
    productDetails,
}) {
    const categoryId = selectedProduct?.category_id || selectedProduct?.id;
    const { sizeCatalogue } = useGetSizeCatalogue(categoryId);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    const getAllValuesForType = (variantTypeId) => {
        if (!productDetails?.variants || productDetails.variants.length === 0) return [];

        const valuesMap = new Map();
        productDetails.variants.forEach((variant) => {
            const targetValue = variant.variant_values?.find(
                (vv) => vv.variant_type.id === variantTypeId,
            );
            if (targetValue && !valuesMap.has(targetValue.value)) {
                valuesMap.set(targetValue.value, targetValue);
            }
        });

        return Array.from(valuesMap.values());
    };

    return (
        <motion.div
            key="step3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="mb-4 w-full"
        >
            <div className="mb-1 flex justify-between w-full items-center">
                <h2 className="text-md lg:text-md font-semibold font-montserrat mb-2 lg:mb-2 leading-none">
                    Select Size
                </h2>
                <div className="flex justify-start mb-2">
                    <button
                        type="button"
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="text-[11px] font-black uppercase tracking-widest flex items-center justify-end gap-2 hover:text-[#711a20] transition-colors cursor-pointer"
                    >
                        <Ruler className="w-4 h-4" /> Size Guide
                    </button>
                </div>
            </div>

            {extractVariantTypes
                .filter((vt) => vt.name.toLowerCase() !== 'color')
                .map((variantType) => {
                    const availableValues = getAvailableValuesForType(variantType.id);
                    const allValues = getAllValuesForType(variantType.id);
                    const displayValues = allValues.length > 0 ? allValues : availableValues;
                    const selectedValue = selectedVariantValues[variantType.id];

                    return (
                        <div key={variantType.id} className="space-y-6 lg:space-y-8">
                            {variantType.name.toLowerCase() === 'size' && (
                                <>
                                    <AnimatePresence>
                                        {isSizeGuideOpen && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                                                onClick={() => setIsSizeGuideOpen(false)}
                                            >
                                                <motion.div
                                                    initial={{ scale: 0.95, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.95, opacity: 0 }}
                                                    className="bg-[#f7e6dc] rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex justify-between items-center mb-2  ">
                                                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                                            <Ruler className="w-5 h-5" /> Size Guide
                                                        </h3>
                                                        <button onClick={() => setIsSizeGuideOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                                            <Iconify icon="eva:close-fill" width={24} />
                                                        </button>
                                                    </div>

                                                    {(() => {
                                                        const rawCatalogueData = sizeCatalogue?.data || (Array.isArray(sizeCatalogue) ? sizeCatalogue : []);
                                                        const catalogueData = Array.isArray(rawCatalogueData) ? rawCatalogueData.flat() : rawCatalogueData;
                                                        const hasCatalogueData = catalogueData.length > 0;

                                                        return (
                                                            <div className="w-full">
                                                                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                                                    <table className="w-full text-left text-sm">
                                                                        <thead className="text-xs uppercase font-black tracking-wider ">
                                                                            <tr>
                                                                                <th className="px-4 py-3">Size</th>
                                                                                <th className="px-4 py-3">Chest</th>
                                                                                <th className="px-4 py-3">Length</th>
                                                                                <th className="px-4 py-3">Sleeve</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                                            {hasCatalogueData ? (
                                                                                catalogueData.map((row) => (
                                                                                    <tr
                                                                                        key={row.id}
                                                                                        className="hover:bg-[#711a20] hover:text-[#f7e6dc] transition-colors"
                                                                                    >
                                                                                        <td className="px-4 py-3 font-bold">{row.size}</td>
                                                                                        <td className="px-4 py-3">{row.chest}</td>
                                                                                        <td className="px-4 py-3">{row.length}</td>
                                                                                        <td className="px-4 py-3">{row.sleeve}</td>
                                                                                    </tr>
                                                                                ))
                                                                            ) : (
                                                                                <tr>
                                                                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500 font-medium">
                                                                                        Size chart data not available.
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-wrap gap-3 lg:gap-3">
                                    {displayValues.map((variantValue) => {
                                        const isAvailable = availableValues.some(
                                            (av) => av.value === variantValue.value,
                                        );
                                        const isSelected = selectedValue?.value === variantValue.value;

                                        return (
                                            <button
                                                key={variantValue.id}
                                                disabled={!isAvailable}
                                                onClick={() =>
                                                    isAvailable &&
                                                    handleVariantSelection(variantType, isSelected ? null : variantValue)
                                                }
                                                className={`relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl lg:rounded-xl font-display font-black text-md lg:text-md transition-all duration-500 border-2 lg:border-4 ${!isAvailable
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : isSelected
                                                        ? 'bg-[#081a1a] text-[#ffffff] border-[#081a1a] scale-110 shadow-xl lg:shadow-2xl'
                                                        : 'bg-[#ffffff] text-[#081a1a] border-[#081a1a]/5 hover:border-[#081a1a]/20'
                                                    }`}
                                            >
                                                <span className={!isAvailable ? 'opacity-50' : ''}>
                                                    {variantValue.value}
                                                </span>
                                                {!isAvailable && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
                                                        <div className="w-[150%] h-[2px] bg-red-400 rotate-[-45deg] origin-center -translate-y-0.5"></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center justify-end gap-2">
                                    <Ruler /> Size Guide
                                </h3> */}
                            </div>
                        </div>
                    );
                })}
        </motion.div>
    );
}

// --------------------------------------------------------------
// Step 4: Final Review
// --------------------------------------------------------------

function Step4Review({
    selectedProduct,
    selectedColor,
    selectedSize,
    frontDesign,
    backDesign,
    selectedVariant,
    selectedItem
}) {
    return (
        <motion.div
            key="step4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-1 mb-3"
        >
            {/* <div className='mb-3'>
                <h2 className="text-md lg:text-md font-semibold font-montserrat  mb-2 lg:mb-2 leading-none">
                    Final <span className="text-[#711a20]">Review</span></h2>
            </div> */}

            <div className="space-y-3 lg:space-y-3">
                <div className="flex justify-between items-center p-3 lg:p-3 rounded-3xl lg:rounded-[1.5rem] border border-[#ffffff]/90 dark:border-[#081a1a]/90">
                    <span className="text-[12px] font-black uppercase tracking-widest">Product</span>
                    <span className="font-display font-black uppercase tracking-tight text-base lg:text-md">{selectedProduct?.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 lg:p-3 rounded-3xl lg:rounded-[1.5rem] border border-[#ffffff]/90 dark:border-[#081a1a]/90">
                    <span className="text-[12px] font-black uppercase tracking-widest">Color</span>
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="w-4 h-4 lg:w-5 lg:h-5 rounded " style={{ background: selectedColor?.hex, boxShadow: '0 0 20px #cacaca' }} />
                        <span className="font-display font-black uppercase tracking-tight text-base lg:text-md">{selectedColor?.name}</span>
                    </div>
                </div>
                {!!selectedSize && (
                    <div className="flex justify-between items-center p-3 lg:p-3 rounded-3xl lg:rounded-[1.5rem] border border-[#ffffff]/90 dark:border-[#081a1a]/90">
                        <span className="text-[12px] font-black uppercase tracking-widest">Size</span>
                        <span className="font-display font-black uppercase tracking-tight text-base lg:text-md">{selectedSize}</span>
                    </div>
                )}

                <div className="flex justify-between items-center p-3 lg:p-3 bg-[#711a20] text-[#ffffff] rounded-3xl lg:rounded-[2rem] mt-3 lg:mt-3 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#711a20] opacity-20 blur-3xl" />
                    <span className="text-xl font-display font-black uppercase ">Total Price</span>
                    <span className="text-xl lg:text-xl font-display font-black ">{fCurrency(
                        selectedVariant?.price ||
                        selectedItem?.selling_price?.flashSalePrice ||
                        selectedItem?.selling_price?.regularPrice ||
                        selectedItem?.price || 0
                    )}</span>
                </div>
            </div>
        </motion.div>
    );
}

// --------------------------------------------------------------
// Main Component
// --------------------------------------------------------------

export default function CustomizeSingle({ id }) {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { userToken, isLogin } = useAppSelector((state) => state.auth);
    const { vendor } = getVendorDetails();

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

    // Extract category name and description
    const categoryName = selectedProduct?.name || '';
    const categoryDescription = selectedProduct?.description || '';
    // console.log('Extracted Category Info:', { categoryName, categoryDescription });

    const [selectedCombinationId, setSelectedCombinationId] = useState(null);
    const [isInitialMock, setIsInitialMock] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isSwapped, setIsSwapped] = useState(false);
    const canvasRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [productDetails, setProductDetails] = useState(null);
    const [selectedVariantValues, setSelectedVariantValues] = useState({});
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    const { categories } = useGetCategories();

    useEffect(() => {
        if (!selectedProduct && categories?.length > 0) {
            const homeCategories = categories.filter(type => type.show_in_home === true);
            if (homeCategories.length > 0) {
                setSelectedProduct(homeCategories[0]);
            }
        }
    }, [categories, selectedProduct, setSelectedProduct]);

    // Extract category info based on URL id
    const urlCategory = useMemo(() => {
        if (!categories) return null;
        for (const cat of categories) {
            if (cat.category_id?.toString() === id?.toString() || cat.id?.toString() === id?.toString()) return cat;
            if (cat.subCategories && Array.isArray(cat.subCategories)) {
                const sub = cat.subCategories.find(s => s.category_id?.toString() === id?.toString() || s.id?.toString() === id?.toString());
                if (sub) return sub;
            }
        }
        return null;
    }, [categories, id]);

    const { designCombination, designsLoading, designsError } = useGetDesignCombination();
    const { designCombinationShow, designCombinationShowLoading, designCombinationShowError } = useGetDesignCombinationShow();

    const activeCombination = useMemo(() => {
        if (id && designCombination?.data) {
            const combinationList = Array.isArray(designCombination.data) ? designCombination.data : [];
            return combinationList.find(c => String(c.id) === String(id));
        }
        return null;
    }, [id, designCombination]);

    const urlCategoryName = activeCombination?.name || urlCategory?.name || '';
    const urlCategoryDescription = activeCombination?.description || urlCategory?.description || '';
    const urlAdditionalDescription = activeCombination?.additional_description || urlCategory?.additional_description || '';
    const urlCategoryGallery = activeCombination?.design_combination_images || urlCategory?.design_combination_images || '';
    // console.log('selected item', selectedItem);
    console.log('urlAdditionalDescription', urlAdditionalDescription)
    useEffect(() => {
        const subCats = selectedProduct?.subCategories?.filter(s => s.status === true || s.status === 1);
        if (subCats && subCats.length > 0) {
            setSelectedSubCategoryId(subCats[0].category_id);
        } else {
            setSelectedSubCategoryId(null);
        }
    }, [selectedProduct]);

    const activeCategoryId = selectedSubCategoryId ?? selectedProduct?.category_id;

    const productQuery = activeCategoryId
        ? buildProductFilterQuery({ category_id: activeCategoryId, is_customizable: 1 })
        : '';
    const { products } = useGetProducts(productQuery);

    const { colors } = useGetColors();

    const getColorStyle = (variantValue, variantTypeId) => {
        const normalizedColor = variantValue.value?.toLowerCase().trim();
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

        return normalizedColor || '#0a1a1a';
    };

    useEffect(() => {
        setSelectedItem(null);
    }, [selectedProduct]);

    useEffect(() => {
        if (products && products.length > 0) {
            const isSelectionValid = selectedItem &&
                products.some(p => p.product_id === selectedItem.product_id);

            if (!isSelectionValid) {
                setSelectedItem(products[0]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products]);

    // Auto-select design combination based on id
    useEffect(() => {
        if (id && designCombination?.data) {
            const combinationList = Array.isArray(designCombination.data) ? designCombination.data : [];
            const combination = combinationList.find(c => String(c.id) === String(id));
            if (combination && String(selectedCombinationId) !== String(id)) {
                setSelectedCombinationId(combination.id);
                const frontItem = combination.items.find(item => item.design.placement.code === 'front');
                const backItem = combination.items.find(item => item.design.placement.code === 'back');

                const frontPayload = frontItem ? {
                    id: frontItem.design.id,
                    name: frontItem.design.name,
                    image: CONFIG.assetsDir + frontItem.design.featured_image,
                } : null;
                const backPayload = backItem ? {
                    id: backItem.design.id,
                    name: backItem.design.name,
                    image: CONFIG.assetsDir + backItem.design.featured_image,
                } : null;

                const isHoodieTemp = selectedItem?.name?.toLowerCase().includes('hoodie') || selectedProduct?.name?.toLowerCase().includes('hoodie');

                if (isHoodieTemp) {
                    setFrontDesign(backPayload);
                    setBackDesign(frontPayload);
                } else {
                    setFrontDesign(frontPayload);
                    setBackDesign(backPayload);
                }
            }
        }
    }, [id, designCombination, selectedCombinationId, selectedItem, selectedProduct, setFrontDesign, setBackDesign]);

    const previewProduct = selectedItem || products?.[0] || null;
    const isHoodieTemplate = previewProduct?.name?.toLowerCase().includes('hoodie') || selectedProduct?.name?.toLowerCase().includes('hoodie');
    const isToteTemplate = previewProduct?.name?.toLowerCase().includes('tote bag') || selectedProduct?.name?.toLowerCase().includes('tote bag');
    const isSweatshirtTemplate = previewProduct?.name?.toLowerCase().includes('sweatshirt') || selectedProduct?.name?.toLowerCase().includes('sweatshirt');
    const isTshirtTemplate = previewProduct?.name?.toLowerCase().includes('t-shirt') || previewProduct?.name?.toLowerCase().includes('tshirt') || selectedProduct?.name?.toLowerCase().includes('t-shirt') || selectedProduct?.name?.toLowerCase().includes('tshirt');

    useEffect(() => {
        async function fetchProductDetails() {
            if (selectedItem?.slug) {
                const details = await getProductDetails(selectedItem.slug);
                setProductDetails(details);
                setSelectedVariantValues({});
            } else {
                setProductDetails(null);
                setSelectedVariantValues({});
            }
        }
        fetchProductDetails();
    }, [selectedItem]);

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

    const getAvailableValuesForType = useMemo(() => {
        return (variantTypeId) => {
            if (!productDetails?.variants || productDetails.variants.length === 0) return [];

            const otherSelections = Object.entries(selectedVariantValues)
                .filter(([typeId]) => typeId !== variantTypeId.toString());

            const compatibleVariants = productDetails.variants.filter(variant => {
                return otherSelections.every(([typeId, selectedValue]) => {
                    return variant.variant_values?.some(vv =>
                        vv.variant_type.id.toString() === typeId &&
                        vv.value === selectedValue.value
                    );
                });
            });

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

    const handleVariantSelection = (variantType, variantValue) => {
        if (!variantValue) {
            setSelectedVariantValues(prev => {
                const newState = { ...prev };
                delete newState[variantType.id];

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

        if (variantType.name.toLowerCase() === 'color') {
            const resolvedStyle = getColorStyle(variantValue, variantType.id);
            setSelectedColor({ name: variantValue.value, hex: resolvedStyle });
        } else if (variantType.name.toLowerCase() === 'size') {
            setSelectedSize(variantValue.value);
        }
    };

    const selectedVariant = useMemo(() => {
        if (!productDetails?.variants || productDetails.variants.length === 0) return null;
        if (Object.keys(selectedVariantValues).length === 0) return null;

        return productDetails.variants.find(variant => {
            return Object.entries(selectedVariantValues).every(([typeId, selectedValue]) => {
                return variant.variant_values?.some(vv =>
                    vv.variant_type.id.toString() === typeId &&
                    vv.value === selectedValue.value
                );
            });
        });
    }, [productDetails, selectedVariantValues]);

    useEffect(() => {
        if (!productDetails?.variants || productDetails.variants.length === 0) return;

        const colorVariantType = extractVariantTypes.find(vt => vt.name.toLowerCase() === 'color');
        if (!colorVariantType) return;

        const availableColors = getAvailableValuesForType(colorVariantType.id);

        if (availableColors.length === 1 && !selectedVariantValues[colorVariantType.id]) {
            handleVariantSelection(colorVariantType, availableColors[0]);
        }
    }, [productDetails, extractVariantTypes, getAvailableValuesForType, selectedVariantValues]);

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return CONFIG.assetsDir + path;
    };

    const activePreviewImage = selectedVariant
        ? getImageUrl(selectedVariant.image)
        : previewProduct
            ? getImageUrl(previewProduct.featured_image || previewProduct.image) : '';

    const steps = [
        'Customize',
    ];

    const canGoNext = () => {
        const hasVariantSelections = (!productDetails?.variants || productDetails.variants.length === 0)
            ? (!!selectedColor && !!selectedSize)
            : (extractVariantTypes.length > 0 && extractVariantTypes.every(type => selectedVariantValues[type.id]));
        return !!selectedProduct && !!selectedItem && hasVariantSelections;
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
                vendor?.allow_product_customization === false ||
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

    return (
        <div className="max-w-7xl mx-auto lg:py-4 py-4">

            <div className={`flex flex-col lg:grid gap-2 lg:gap-20 lg:py-2 items-center  ${currentStep > 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>

                {/* Left Side: Preview (Sticky on Mobile) */}
                {currentStep > 0 && (
                    <div className="z-20 pb-4 lg:pb-0 w-full">
                        {selectedProduct?.subCategories?.filter(
                            (subCat) => subCat.status === true || subCat.status === 1
                        ).length > -1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#711a20]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#711a20] [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {selectedProduct.subCategories
                                        .filter((subCat) => subCat.status === true || subCat.status === 1)
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
                                                scale: isHoodieTemplate ? 0.7 : isSweatshirtTemplate ? 0.80 : isToteTemplate ? 0.75 : isTshirtTemplate ? 0.80 : 1,
                                                shiftX: isToteTemplate ? 0.115 : isSweatshirtTemplate ? 0.070 : isTshirtTemplate ? 0.052 : -0.03,
                                                shiftY: isToteTemplate ? 0.19 : isSweatshirtTemplate ? 0.030 : isTshirtTemplate ? -0.02 : 0.12,
                                                rotation: 0
                                            }}
                                            backConfig={{
                                                scale: isHoodieTemplate ? 0.35 : isSweatshirtTemplate ? 0.40 : isToteTemplate ? 0.55 : isTshirtTemplate ? 0.35 : 1,
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
                        </div>

                        {/* Color Swatches */}
                        {extractVariantTypes.filter(vt => vt.name.toLowerCase() === 'color').map((variantType) => {
                            const availableValues = getAvailableValuesForType(variantType.id);
                            const allValues = getAllValuesForType(variantType.id);
                            const displayValues = allValues.length > 0 ? allValues : availableValues;
                            const selectedValue = selectedVariantValues[variantType.id];

                            return (
                                <div key={variantType.id} className="space-y-6 lg:space-y-8 mt-5">
                                    <div className="flex flex-nowrap overflow-x-auto gap-1 lg:gap-2 overflow-y-hidden">
                                        {displayValues.map((variantValue) => {
                                            const isAvailable = availableValues.some(av => av.value === variantValue.value);
                                            const isSelected = selectedValue?.value === variantValue.value;

                                            return (
                                                <button
                                                    key={variantValue.id}
                                                    disabled={!isAvailable}
                                                    onClick={() => isAvailable && handleVariantSelection(variantType, isSelected ? null : variantValue)}
                                                    className={`group relative w-14 h-14 lg:w-13 lg:h-13 rounded-2xl lg:rounded-2xl border-2 lg:border-2 transition-all duration-500 flex items-center justify-center ${!isAvailable
                                                        ? 'border-[#f7e6dc] opacity-50 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'border-[#f7e6dc] scale-102 shadow-xl lg:shadow-2xl border-2'
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
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Right Side: Step Controls */}
                <div className="space-y-2 lg:space-y-16 pb-0 lg:pb-0 w-full">
                    <AnimatePresence mode="wait">
                        <div className="space-y-12 mb-4">
                            <Step1Category
                                categories={categories}
                                selectedProduct={selectedProduct}
                                setSelectedProduct={(type) => {
                                    setSelectedProduct(type);
                                    setIsInitialMock(false);
                                }}
                                urlCategoryName={urlCategoryName}
                                urlCategoryDescription={urlCategoryDescription}
                            />

                            {selectedProduct && (
                                <>
                                    <Step3Size
                                        extractVariantTypes={extractVariantTypes}
                                        getAvailableValuesForType={getAvailableValuesForType}
                                        selectedVariantValues={selectedVariantValues}
                                        handleVariantSelection={handleVariantSelection}
                                        selectedProduct={selectedProduct}
                                        productDetails={productDetails}
                                    />

                                    <Step4Review
                                        selectedProduct={selectedProduct}
                                        selectedColor={selectedColor}
                                        selectedSize={selectedSize}
                                        frontDesign={frontDesign}
                                        backDesign={backDesign}
                                        selectedVariant={selectedVariant}
                                        selectedItem={selectedItem}
                                    />
                                </>
                            )}
                        </div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="pb-2 backdrop-blur-2xl border-t border-[#081a1a]/10 lg:relative lg:bg-transparent lg:border-0 lg:p-0 flex items-center gap-3 z-50 mb-8">
                        <button
                            onClick={() => handleFinalAction(false)}
                            disabled={!canGoNext() || isAddingToCart}
                            className={`flex-[2] py-3 lg:py-4 rounded-3xl lg:rounded-3xl font-display font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 shadow-lg ${canGoNext() && !isAddingToCart
                                ? 'hover:bg-[#711a20] hover:text-[#ffffff] hover:scale-[1.02] border-2 active:scale-95'
                                : 'cursor-not-allowed border-2 border-[#081a1a]/10 '
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
                                className={`flex-[2] py-3 lg:py-4 rounded-3xl lg:rounded-3xl font-display font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 shadow-lg ${canGoNext() && !isAddingToCart
                                    ? 'hover:bg-[#711a20] hover:text-[#ffffff] hover:scale-[1.02] border-2 active:scale-95'
                                    : 'cursor-not-allowed border-2 border-[#081a1a]/10 '
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
                    </div>
                    {urlAdditionalDescription &&
                        (

                            <div className='flex flex-col gap-2 items-start'>
                                <div className="flex gap-2 tracking-tighter font-black uppercase items-center">

                                    <Iconify icon="solar:info-circle-bold" width={20} /> Description
                                </div>
                                <div className="pl-7">

                                    <Markdown children={urlAdditionalDescription} />
                                </div>
                            </div>

                        )

                    }
                </div>
            </div>
            <div className="container lg:my-20 mt-10 mb-10">
                <span className="uppercase tracking-[0.4em] text-primary text-sm font-semibold">
                    PHOTO GALLERY
                </span>

                <h2 className="text-5xl uppercase font-black mt-4 tracking-tighter">
                    Through Our Lens
                </h2>

                <p className=" mb-5 mt-1 text-gray-500">
                    Discover the stories, experiences, and memorable moments captured through our collection of imagery.
                </p>
                {urlCategoryGallery && urlCategoryGallery.length > 0 && (
                    <div className="w-full relative mt-8">
                        <Swiper
                            modules={[Autoplay]}
                            spaceBetween={20}
                            slidesPerView={1}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 4 }
                            }}
                            autoplay={{ delay: 2500, disableOnInteraction: false }}
                            loop={true}
                            className="w-full"
                        >
                            {urlCategoryGallery.map((gallery, index) => (
                                <SwiperSlide key={index}>
                                    <div
                                        className="
                                group relative overflow-hidden rounded-3xl
                                shadow-lg hover:shadow-2xl
                                transition-all duration-500
                                h-[300px]
                            "
                                    >
                                        <Image
                                            src={getImageUrl(gallery.image)}
                                            alt={`${urlCategoryName} ${index + 1}`}
                                            title={`${urlCategoryName} ${index + 1}`}
                                            fill
                                            className="
                                    object-cover
                                    transition-transform duration-700
                                    group-hover:scale-110
                                "
                                        />

                                        {/* Gradient Overlay */}
                                        <div
                                            className="
                                    absolute inset-0
                                    bg-gradient-to-t
                                    from-black/70
                                    via-black/10
                                    to-transparent
                                    opacity-0
                                    group-hover:opacity-100
                                    transition-opacity duration-500
                                "
                                        />

                                        {/* Gallery Number */}
                                        <div
                                            className="
                                    absolute top-4 left-4
                                    bg-white/20 backdrop-blur-md
                                    text-white text-sm font-semibold
                                    px-3 py-1 rounded-full
                                    border border-white/20
                                    opacity-0 group-hover:opacity-100
                                    transition-all duration-500
                                "
                                        >
                                            #{String(index + 1).padStart(2, "0")}
                                        </div>

                                        {/* Bottom Text */}
                                        <div
                                            className="
                                    absolute bottom-0 left-0 right-0
                                    p-5 text-white
                                    translate-y-6
                                    opacity-0
                                    group-hover:translate-y-0
                                    group-hover:opacity-100
                                    transition-all duration-500
                                "
                                        >
                                            <h3 className="font-semibold text-lg">
                                                {urlCategoryName}
                                            </h3>
                                            <p className="text-sm text-white/80">
                                                Explore Gallery
                                            </p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}

            </div>
        </div>
    );
}