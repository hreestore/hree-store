import { useBoolean } from "minimal-shared/hooks";
import Link from 'next/link';
import { Loader2, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import {
  Box,
  Card,
  Button,
  CardHeader,
  Typography,
  LinearProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  resetCart,
  changeActiveStep,
  removeCartItem,
  changeItemQuantity,
  addToWishlist,
  getWishlistRequest,
  getWishlistSuccess,
  getCartDataRequest,
} from "@/redux/actions";

import { useRouter } from "@/routes/hooks";
import { RouterLink } from "@/routes/components";

import { Iconify } from "@/components/iconify";
import { EmptyContent } from "@/components/empty-content";
import { toast } from "@/components/snackbar";
import { ConfirmDialog } from "@/components/custom-dialog";

import { CartSummary } from "./cart-summary";
import { CartProductList } from "./cart-product-list";

import {
  removeProductFromCart,
  updateProductInCart,
  clearCartData,
  addProductToWishlist,
} from "@/api";
import { addGuestWishlistItem, getGuestWishlist } from "@/utils/wishlist-storage";
import { paths } from "@/routes/paths";
import { useEffect } from "react";

// ----------------------------------------------------------------------

export function CartOverview() {
  const dispatch = useAppDispatch();

  const router = useRouter();

  const confirmDialog = useBoolean(false);

  const { isLoading, items, totalItems } = useAppSelector(
    (state) => state.cart
  );
  console.log("this is cart item", items)
  const { isLogin } = useAppSelector((state) => state.auth);

  const isCartEmpty = !items.length;

  useEffect(() => {
    dispatch(getCartDataRequest());
  }, []);

  const handleProceedToAddress = () => {
    if (!isLogin) {
      localStorage.setItem("cart", JSON.stringify(items));
      router.push(paths.auth.signIn);
      return;
    }

    // Logged in, proceed to next step (address)
    dispatch(changeActiveStep(1));
  };

  // Helper to check if cart_id is a valid API ID (not a generated timestamp)
  const isValidApiCartId = (id) => {
    // Timestamps from Date.now() are 13-digit numbers (e.g., 1679529600000)
    // Valid API cart IDs are typically much smaller
    const numId = Number(id);
    return !isNaN(numId) && numId < 10000000000; // Less than 10 billion
  };

  const handleDeleteCartItem = async (id) => {
    try {
      if (isLogin && isValidApiCartId(id)) {
        const response = await removeProductFromCart(id);
        if (!response.success) {
          throw response;
        }
        dispatch(getCartDataRequest());
      } else {
        dispatch(removeCartItem(id));
      }

      toast.success("Product removed from cart!");
    } catch (error) {
      toast.error(error?.message || "Couldn't remove product! Try again.");
    }
  };

  const handleChangeCartItemQuantity = async (id, quantity) => {
    const product = { cartId: id, quantity: Number(quantity) };

    try {
      if (isLogin && isValidApiCartId(id)) {
        const response = await updateProductInCart(product);
        if (!response.success) {
          throw response;
        }
        dispatch(getCartDataRequest());
      } else {
        dispatch(changeItemQuantity(product));
      }
    } catch (error) {
      toast.error(error?.message || "Couldn't update quantity! Try again.");
    }
  };

  const handleMoveToWishlist = async (row) => {
    const cartId = row.cart_id || row.id;

    // Correctly resolve product_id and variant_id
    const productId =
      row.itemable?.product_id ||
      row.product?.product_id ||
      row.product?.id ||
      row.itemable_id ||
      row.product_id;

    const variantId =
      row.variant_id ||
      row.itemable?.variant_id ||
      (row.itemable_type === 'ProductVariant' || row.product_type === 'ProductVariant'
        ? (row.variant_id || row.itemable_id || row.product_id)
        : undefined);

    if (!productId) {
      toast.error("Unable to identify product. Try again.");
      return;
    }

    if (!cartId) {
      toast.error("Unable to identify cart item. Try again.");
      return;
    }

    // Guest wishlist handling
    if (!isLogin) {
      const { item, added } = addGuestWishlistItem({
        product_id: productId,
        variant_id: variantId,
        product_name: row.item_name || row.product_name || row.name || "Product",
        slug: row.slug || "",
        product_image: row.item_image || row.featured_image || row.image || row.product_image || "",
        price: Number(row.price || row.regular_price || 0),
      });

      if (added && item) {
        dispatch(addToWishlist(item));
      } else {
        dispatch(getWishlistSuccess(getGuestWishlist()));
      }

      dispatch(removeCartItem(cartId));
      toast.success("Product moved to wishlist!");
      return;
    }

    // Authenticated user handling
    const newProduct = {
      product_id: productId,
      ...(variantId && { variant_id: variantId }),
    };

    try {
      const response = await addProductToWishlist(newProduct);

      if (isValidApiCartId(cartId)) {
        try {
          await removeProductFromCart(cartId);
        } catch (removeErr) {
          console.warn("Failed to remove item from server cart:", removeErr);
        }
      }
      dispatch(removeCartItem(cartId));
      dispatch(getCartDataRequest());

      const wishlistItem = Array.isArray(response?.data)
        ? response.data[0]
        : Array.isArray(response)
          ? response[0]
          : response?.data || response;

      if (wishlistItem) {
        dispatch(addToWishlist(wishlistItem));
      } else {
        dispatch(getWishlistRequest());
      }

      toast.success("Product moved to wishlist!");
    } catch (error) {
      const errorMessage = String(error?.message || "").toLowerCase();
      if (errorMessage.includes("already") && errorMessage.includes("wishlist")) {
        if (isValidApiCartId(cartId)) {
          try {
            await removeProductFromCart(cartId);
          } catch (removeErr) {
            console.warn("Failed to remove item from server cart:", removeErr);
          }
        }
        dispatch(removeCartItem(cartId));
        dispatch(getCartDataRequest());
        dispatch(getWishlistRequest());
        toast.success("Product moved to wishlist!");
      } else {
        toast.error(error?.message || "Couldn't move to wishlist! Try again.");
      }
    }
  };

  const handleClearCart = async () => {
    try {
      if (isLogin) {
        const response = await clearCartData();
        if (!response.success) {
          throw response;
        }
        dispatch(getCartDataRequest());
      } else {
        dispatch(resetCart());
      }

      confirmDialog.onFalse();

      toast.success("Cart cleared sucessfully!");
    } catch (error) {
      toast.error(error?.message || "Couldn't clear cart! Try again.");
    }
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center h-[340px]">
      <Loader2 className="w-8 h-8 text-[#081a1a] animate-spin" />
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[340px]  rounded-3xl border border-[#081a1a]/5 shadow-sm">
      <div className="w-24 h-24  rounded-full dark:border-[#ffffff]/10 border border-[#081a1a] flex items-center justify-center mb-6 shadow-lg shadow-[#081a1a]/20">
        <ShoppingBag className="w-10 h-10 opacity-80" />
      </div>
      <p className="text-2xl font-display font-black uppercase tracking-tighter ">Cart is empty!</p>
      <p className="text-gray-500 mt-2 font-medium">Looks like you have no items in your shopping cart.</p>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2">
          <div className="rounded-3xl overflow-hidden border dark:border-[#ffffff]/20 border-[#081a1a] shadow-sm mb-6">
            <div className="p-6 flex justify-between items-center border-[#081a1a]/5 ">
              <h2 className="text-2xl font-display font-black uppercase tracking-tighter">
                Cart <span className="text-lg">({totalItems} items)</span>
              </h2>
              {!isCartEmpty && (
                <button
                  onClick={confirmDialog.onTrue}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-black uppercase tracking-widest text-[#711a20] hover:bg-[#711a20]/10 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            {isLoading ? (
              renderLoading()
            ) : (
              <div className="p-0 border-t border-[#081a1a]/5">
                {isCartEmpty ? (
                  renderEmpty()
                ) : (
                  <CartProductList
                    items={items}
                    onDeleteCartItem={handleDeleteCartItem}
                    onChangeItemQuantity={handleChangeCartItemQuantity}
                    onMoveToWishlist={handleMoveToWishlist}
                  />
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
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-gray-600 shadow-sm overflow-hidden">
            <CartSummary />
          </div>

          <button
            onClick={handleProceedToAddress}
            disabled={isCartEmpty}
            className={`w-full py-4 lg:py-5 rounded-2xl lg:rounded-[2rem] font-display font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 lg:gap-3 shadow-lg ${!isCartEmpty
              ? ' hover:bg-[#711a20] hover:text-[#ffffff] hover:scale-[1.02] active:scale-95'
              : 'cursor-not-allowed shadow-none'
              }`}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Clear Cart"
        content={<>Are you sure you want to clear the cart ?</>}
        action={
          <Button variant="contained" color="error" onClick={handleClearCart}>
            Clear
          </Button>
        }
      />
    </>
  );
}
