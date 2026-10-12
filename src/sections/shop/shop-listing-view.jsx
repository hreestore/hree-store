'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ArrowRight } from 'lucide-react';
import { paths } from '@/routes/paths';
import { Iconify } from '@/components/iconify';
import { useGetCategories, useGetProducts, buildProductFilterQuery } from '@/api';
import { fCurrency } from '@/utils/format-number';

// --------------------------------------------------------------------------------------------

const READY_MADE_CATEGORY_ID = 289;

export default function ShopListingView() {
    const searchParams = useSearchParams();
    const subCategoryParam = searchParams.get('sub');

    const { categories, isLoading: categoriesLoading } = useGetCategories();

    // Get the "Ready Made Products" category and its subcategories
    const readyMadeCategory = useMemo(() => {
        return categories?.find((cat) => cat.category_id === READY_MADE_CATEGORY_ID);
    }, [categories]);

    const subCategories = useMemo(() => {
        return readyMadeCategory?.subCategories?.filter((sub) => sub.status && sub.show_in_home) || [];
    }, [readyMadeCategory]);

    // Active subcategory filter
    const [activeSubCategory, setActiveSubCategory] = useState(null);

    // Use URL param on first render, then state
    const effectiveSubCategory = activeSubCategory !== null
        ? activeSubCategory
        : (subCategoryParam ? Number(subCategoryParam) : null);

    // Build query - if a subcategory is selected, filter by that; otherwise show all from 289
    const filterCategoryId = effectiveSubCategory || READY_MADE_CATEGORY_ID;
    const productQuery = buildProductFilterQuery({ category_id: filterCategoryId });
    const { products, isLoading: productsLoading } = useGetProducts(productQuery);

    const handleSubCategoryClick = (categoryId) => {
        if (categoryId === effectiveSubCategory) {
            setActiveSubCategory('all');
        } else {
            setActiveSubCategory(categoryId);
        }
    };

    const isAllActive = effectiveSubCategory === null || effectiveSubCategory === 'all';

    return (
        <main className="lg:py-20 py-16 ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumbs */}
                <div className="inline-flex items-center space-x-3 text-xs md:text-sm font-bold mb-8 px-5 py-2.5 rounded-full uppercase tracking-widest border border-gray-100 shadow-sm overflow-hidden whitespace-nowrap">
                    <Link href={paths.home} className="flex items-center hover:text-[#711a20] transition-colors group">
                        <Iconify icon="solar:home-smile-bold-duotone" className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                        Home
                    </Link>
                    <span>
                        <Iconify icon="solar:alt-arrow-right-linear" className="w-4 h-4" />
                    </span>
                    <span className="text-[#711a20]">Shop</span>
                </div>

                {/* Header */}
                <div className="lg:mb-8 mb-6">
                    <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none mb-2">
                        Hree's <span className="text-[#711a20]">Accessories</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl font-medium">
                        Explore our curated collection of accessories — crafted with care, delivered to your doorstep.
                    </p>
                </div>

                {/* Subcategory Filter Chips */}
                {subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-10">
                        <button
                            onClick={() => setActiveSubCategory('all')}
                            className={`px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider border-2 transition-all duration-300 ${isAllActive
                                ? 'border-[#081a1a] bg-[#081a1a] text-[#ffffff] shadow-lg scale-105'
                                : 'border-gray-300 text-gray-600 hover:border-[#081a1a] hover:text-[#081a1a]'
                                }`}
                        >
                            All
                        </button>
                        {subCategories.map((sub) => {
                            const isActive = effectiveSubCategory === sub.category_id;
                            return (
                                <button
                                    key={sub.category_id}
                                    onClick={() => handleSubCategoryClick(sub.category_id)}
                                    className={`px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider border-2 transition-all duration-300 ${isActive
                                        ? 'border-[#711a20] bg-[#711a20] text-[#ffffff] shadow-lg scale-105'
                                        : 'border-gray-300 text-gray-600 hover:border-[#711a20] hover:text-[#711a20]'
                                        }`}
                                >
                                    {sub.name}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Products Grid */}
                {(productsLoading || categoriesLoading) ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-8 h-8 text-[#711a20] animate-spin" />
                    </div>
                ) : products?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                        <AnimatePresence mode="popLayout">
                            {products.map((product, idx) => (
                                <motion.div
                                    key={product.product_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.04, duration: 0.4 }}
                                >
                                    <ShopProductCard product={product} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <Iconify icon="solar:bag-cross-bold-duotone" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-xl text-gray-400 font-display font-black uppercase tracking-tighter">No products found</p>
                        <p className="text-gray-400 mt-2">Try selecting a different category.</p>
                    </div>
                )}

            </div>
        </main>
    );
}

// --------------------------------------------------------------------------------------------

function ShopProductCard({ product }) {
    const [hovered, setHovered] = useState(false);

    const price = product.selling_price?.flashSalePrice || product.price;
    const regularPrice = product.selling_price?.regularPrice || product.price;
    const hasDiscount = product.selling_price?.discountPercentage > 0;

    return (
        <Link
            href={paths.shop.details(product.slug)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group block rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-[#711a20]/30 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(113,26,32,0.15)]"
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden ">

                <img src="/img/overlay/overlay.png" alt="" className="absolute left-0 top-0 z-999 w-full h-full opacity-25 object-cover" />
                {product.featured_image && (
                    <Image
                        src={product.featured_image}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                )}

                {/* Overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

                {/* Quick View Badge */}
                <div className={`absolute bottom-4 left-4 right-4 transition-all duration-500 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md text-[#081a1a] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                        View Details
                        <ArrowRight className="w-3 h-3" />
                    </span>
                </div>

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-[#711a20] text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                        {product.selling_price.discountPercentage}% OFF
                    </div>
                )}

                {/* Out of Stock Badge */}
                {product.is_out_of_stock && (
                    <div className="absolute top-3 right-3 bg-gray-900/80 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        Sold Out
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 lg:p-5">
                {/* Category Label */}
                {product.categories?.[0] && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#711a20] mb-1 block">
                        {product.categories.length > 1
                            ? product.categories.find(c => c.category_id !== READY_MADE_CATEGORY_ID)?.category_name
                            : product.categories[0].category_name
                        }
                    </span>
                )}

                <h3 className="font-display font-black uppercase tracking-tighter text-lg leading-tight mb-2 group-hover:text-[#711a20] transition-colors">
                    {product.name}
                </h3>

                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-[#711a20]">{fCurrency(price)}</span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through font-bold">{fCurrency(regularPrice)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
