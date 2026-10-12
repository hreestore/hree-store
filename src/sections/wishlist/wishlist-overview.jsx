import Link from "next/link";
import { Loader2, ArrowLeft, Heart, Trash2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCart, removeWishlistItem, getCartDataRequest } from "@/redux/actions";

import { paths } from "@/routes/paths";
import { toast } from "@/components/snackbar";
import { fCurrency } from "@/utils/format-number";

import { addProductToCart, removeProductFromWishlist } from "@/api";
import { removeGuestWishlistItem } from "@/utils/wishlist-storage";

// ----------------------------------------------------------------------

export function WishlistOverview() {
  const dispatch = useAppDispatch();

  const { isLoading, items, totalItems } = useAppSelector(
    (state) => state.wishlist
  );
  const { isLogin } = useAppSelector((state) => state.auth);

  const isWishlistEmpty = !items.length;

  const handleMoveToCart = async ({ product_id, variant_id, wishlist_id, product_name, product_image, slug, price }) => {
    if (!isLogin) {
      dispatch(
        addToCart({
          cart_id: Date.now(),
          product_id: variant_id || product_id,
          itemable_id: product_id,
          product_name,
          item_name: product_name,
          featured_image: product_image,
          item_image: product_image,
          slug,
          price: Number(price || 0),
          regular_price: Number(price || 0),
          product_type: variant_id ? "ProductVariant" : "Product",
          quantity: 1,
          ...(variant_id && { variant_id }),
        })
      );

      removeGuestWishlistItem(wishlist_id);
      dispatch(removeWishlistItem(wishlist_id));
      toast.success("Product moved to cart!");
      return;
    }

    const newProduct = {
      product_id,
      quantity: 1,
      ...(variant_id && { variant_id }),
    };

    try {
      const cartResponse = await addProductToCart([newProduct]);

      // console.log("[MOVE TO CART] API Response:", cartResponse);

      await removeProductFromWishlist(wishlist_id);

      dispatch(removeWishlistItem(wishlist_id));

      // Refresh cart from server to get complete data
      dispatch(getCartDataRequest());

      toast.success("Product moved to cart!");
    } catch (error) {
      console.error("[MOVE TO CART] Error:", error);
      toast.error("Couldn't move to cart! Try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!isLogin) {
      removeGuestWishlistItem(id);
      dispatch(removeWishlistItem(id));
      toast.success("Product removed from wishlist!");
      return;
    }

    try {
      await removeProductFromWishlist(id);

      dispatch(removeWishlistItem(id));

      toast.success("Product removed from wishlist!");
    } catch (error) {
      toast.error("Couldn't remove product! Try again.");
    }
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center h-[340px]">
      <Loader2 className="w-8 h-8 text-[#081a1a] animate-spin" />
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[340px]  border border-[#081a1a]/5 shadow-sm">
      <div className="w-24 h-24 rounded-full  flex items-center justify-center mb-6 shadow-lg shadow-[#081a1a]/20">
        <Heart className="w-10 h-10 opacity-80" />
      </div>
      <p className="text-2xl font-display font-black uppercase tracking-tighter ">Wishlist is empty!</p>
      <p className="text-gray-500 mt-2 font-medium">Looks like you have no items in your wishlist.</p>
    </div>
  );

  return (
    <>
      <div className=" rounded-3xl overflow-hidden border border-[#081a1a]/30 shadow-sm mb-6">
        <div className="p-6 flex justify-between items-center border-b border-[#081a1a]/5 ">
          <h2 className="text-2xl font-display font-black uppercase tracking-tighter">
            Wishlist <span className="text-gray-400 text-lg">({totalItems} items)</span>
          </h2>
        </div>

        {isLoading ? (
          renderLoading()
        ) : (
          <div className="p-0 border-t border-[#081a1a]/5">
            {isWishlistEmpty ? (
              renderEmpty()
            ) : (
              <div className="divide-y divide-[#081a1a]/5">
                {items?.map((row) => (
                  <div
                    key={row.wishlist_id}
                    className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-[#081a1a]/5 shrink-0">
                        <img
                          src={row.product_image || '/assets/placeholder.png'}
                          alt={row.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/placeholder.png';
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={paths.product.details(row.slug)}
                          className="text-sm md:text-base font-bold text-[#081a1a] hover:text-[#711a20] transition-colors line-clamp-2"
                        >
                          {row.product_name}
                        </Link>
                      </div>
                    </div>

                    <div className="md:w-32 text-left md:text-right">
                      <span className="text-base md:text-lg font-black text-[#711a20]">
                        {fCurrency(row.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <button
                        onClick={() => handleMoveToCart(row)}
                        className="px-4 py-2 text-xs font-black uppercase tracking-widest text-[#081a1a] border border-[#081a1a] rounded-xl hover:bg-[#081a1a] hover:text-[#ffffff] transition-colors"
                      >
                        Add to Cart
                      </button>

                      <button
                        onClick={() => handleDelete(row.wishlist_id)}
                        className="p-2 rounded-xl text-[#711a20] hover:bg-[#711a20]/10 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Link
        href={paths.product.root}
        className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-[#081a1a] transition-colors py-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Continue shopping
      </Link>
    </>
  );
}
