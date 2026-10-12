'use client';

import { paths } from "@/routes/paths";
import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { useGetCategories, useGetProducts, buildProductFilterQuery } from "@/api";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToWishlist, getWishlistRequest, getWishlistSuccess } from "@/redux/actions";
import { addProductToWishlist } from "@/api";
import { selectAuthState, selectWishlistState } from "@/redux/selectors";
import { toast } from "@/components/snackbar";
import { addGuestWishlistItem, getGuestWishlist } from "@/utils/wishlist-storage";
import { fCurrency } from "@/utils";

function SubcategoryRow({ subCategory }) {
    const dispatch = useAppDispatch();
    const { isLogin } = useAppSelector(selectAuthState);
    const { items: wishlistItems } = useAppSelector(selectWishlistState);
    const [wishlistLoadingIds, setWishlistLoadingIds] = useState({});

    const productQuery = buildProductFilterQuery({ category_id: subCategory.category_id });
    const { products, isLoading } = useGetProducts(productQuery);

    useEffect(() => {
        if (isLogin) {
            dispatch(getWishlistRequest());
        }
    }, [dispatch, isLogin]);

    if (isLoading) return <div className="py-8 text-center text-gray-400 animate-pulse">Loading {subCategory.name}...</div>;
    if (!products || products.length === 0) return null;

    // Display up to 8 items for the homepage summary row
    const displayProducts = products.slice(0, 8);

    const isInWishlist = (productId, variantId = null) =>
        wishlistItems?.some((wishlistItem) => {
            if (!wishlistItem || wishlistItem.product_id === undefined || wishlistItem.product_id === null) {
                return false;
            }

            return (
                String(wishlistItem.product_id) === String(productId) &&
                String(wishlistItem.variant_id || "") === String(variantId || "")
            );
        });

    const handleAddToWishlist = async (product) => {
        if (!product?.product_id) {
            toast.error("Unable to identify product. Try again.");
            return;
        }

        if (!isLogin) {
            const { item, added } = addGuestWishlistItem({
                product_id: product.product_id,
                product_name: product.name,
                slug: product.slug,
                product_image: product.featured_image,
                featured_image: product.featured_image,
                price: product.price || product.basePrice || 0,
            });

            if (!item) {
                toast.error("Couldn't add to wishlist! Try again.");
                return;
            }

            if (added) {
                dispatch(addToWishlist(item));
            } else {
                // If local storage already had this item but UI state was stale, rehydrate from storage.
                dispatch(getWishlistSuccess(getGuestWishlist()));
            }
            toast.success("Added to wishlist!");
            return;
        }

        setWishlistLoadingIds((prev) => ({ ...prev, [product.product_id]: true }));

        try {
            const response = await addProductToWishlist({ product_id: product.product_id });
            const wishlistItem = Array.isArray(response) ? response[0] : response;

            if (wishlistItem && !isInWishlist(wishlistItem.product_id, wishlistItem.variant_id)) {
                dispatch(addToWishlist(wishlistItem));
            }

            toast.success("Added to wishlist!");
        } catch (error) {
            const errorMessage = String(error?.message || "").toLowerCase();
            if (errorMessage.includes("already") && errorMessage.includes("wishlist")) {
                dispatch(getWishlistRequest());
                toast.success("Added to wishlist!");
            } else {
                toast.error(error?.message || "Couldn't add to wishlist! Try again.");
            }
        } finally {
            setWishlistLoadingIds((prev) => ({ ...prev, [product.product_id]: false }));
        }
    };

    return (
        <div className="lg:mb-20 mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
                <div>
                    <h3 className="text-3xl md:text-3xl font-display font-black  uppercase tracking-tighter hover:text-[#711a20] cursor-pointer">
                        {subCategory.name}
                    </h3>
                </div>
                <Link
                    href={`/category/${subCategory.category_id}`}
                    className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#711a20] hover:text-[##0a1a1a] transition-colors"
                >
                    View All {subCategory.name} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {displayProducts.map((product, idx) => (
                    <motion.div
                        key={product.product_id || idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative  rounded-[2rem] overflow-hidden border border-black/5 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                    >
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleAddToWishlist(product);
                            }}
                            disabled={wishlistLoadingIds[product.product_id]}
                            className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${isInWishlist(product.product_id)
                                ? 'bg-[#711a20] border-[#711a20]'
                                : ' border-black text-[##0a1a1a] hover:bg-[#711a20] hover:border-[#711a20] '
                                } ${wishlistLoadingIds[product.product_id] ? 'opacity-60 cursor-not-allowed' : ''}`}
                            aria-label="Add to wishlist"
                        >
                            <Heart className={`w-4 h-4 ${isInWishlist(product.product_id) ? 'fill-current' : ''}`} />
                        </button>

                        <Link href={paths.product.details ? paths.product.details(product.slug) : '#'}>
                            <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                                <Image
                                    src={product.featured_image}
                                    alt={product.name || "Product Image"}
                                    title={product.name || "Product Image"}
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            </div>
                            <div className="lg:p-6 p-4">
                                <h3 className="font-display font-black text-xl uppercase tracking-tighter truncate text-[##0a1a1a] mb-1">
                                    {product.name}
                                </h3>
                                {/* <p className="text-gray-500 text-xs font-bold uppercase tracking-widest line-clamp-1 mb-4">
                                    {product.category || subCategory.name}
                                </p> */}
                                <div className="flex items-center justify-between flex-wrap">
                                    <span className="font-black text-lg text-[#711a20] mb-2">
                                        {fCurrency(product.price || product.basePrice || "0")}
                                    </span>
                                    <span className="bg-[#ffffff] text-[#711a20] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest group-hover:bg-[#711a20] group-hover:text-[#ffffff] transition-colors">
                                        View details
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default function HomeFeaturedDesigns() {
    const { categories, isLoading } = useGetCategories();

    const readyMadeCategory = categories?.find(cat => Number(cat.category_id) === 289);
    const subCategories = readyMadeCategory?.subCategories || [];

    return (
        <section className="lg:py-16 py-10 ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:mb-10 mb-10">
                    <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter  cursor-pointer mb-2"> <span className=" text-[#711a20]">Ready Made</span> Products</h2>
                    <p className="text-gray-500 text-lg  ">Explore our collection of t-shirts, hoodies, tote bags, and sweatshirts—each piece crafted around unique designs</p>
                </div>

                {
                    isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-gray-400 animate-pulse">Loading collections...</p>
                        </div>
                    ) : (
                        subCategories.map(subCat => (
                            <SubcategoryRow key={subCat.category_id} subCategory={subCat} />
                        ))
                    )
                }
            </div >
        </section >
    );
}