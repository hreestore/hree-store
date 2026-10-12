import { CONFIG } from "@/global-config";
import Image from "next/image";

import { RouterLink } from "@/routes/components";
import { paths } from "@/routes/paths";

import { useAppSelector } from "@/redux/hooks";
import { selectAuthState, selectWishlistState } from "@/redux/selectors";

import { fCurrency } from "@/utils/format-number";

import { Iconify } from "@/components/iconify";
import { NumberInput } from "@/components/number-input";
import { useGetDesignCombinationShow } from "@/api";
import TshirtCanvas from '@/components/tshirt-canvas';

// ----------------------------------------------------------------------

export function CartProduct({
  row,
  onDeleteCartItem,
  onChangeItemQuantity,
  onMoveToWishlist,
}) {
  const { isLogin } = useAppSelector(selectAuthState);
  const { items: wishlistItems } = useAppSelector(selectWishlistState);
  const {
    cart_id,
    product_id,
    itemable_id, // Alternative field for product_id from API
    product_name,
    item_name, // API returns item_name instead of product_name
    slug,
    featured_image,
    item_image, // API returns item_image instead of featured_image
    price,
    regular_price,
    quantity,
    is_flash_sale,
    flash_sale_price,
    flash_sale_remaining_qty,
    // Customization fields
    tshirtFrontImage,
    frontDesign,
    backDesign,
    color,
    is_customized,
    customization,
    customization_snapshot,
    swapped_combination,
  } = row;


  // Use API field names as fallback
  const productId = product_id || itemable_id;
  const productName = item_name || product_name;
  const frontDesignName = frontDesign?.name || row.front_design;
  const backDesignName = backDesign?.name || row.back_design;

  const combinationId = customization?.design_combination_id;
  // console.log('combo', combinationId)
  const { designCombinationShow } = useGetDesignCombinationShow(combinationId);
  const combination = designCombinationShow?.data[0];


  console.log("COMBINATION:", combination);


  const frontDesignImage = combination?.items[0]?.design?.featured_image;
  const backDesignImage = combination?.items[1]?.design?.featured_image;

  // Handle image URL - try all possible locations where the API or local state might store the image
  let productImage = item_image || featured_image || row.image || row.product?.featured_image || row.itemable?.featured_image || row.product_image;

  if (typeof productImage === 'string') {
    if (productImage.endsWith('/storage/') || productImage.endsWith('/storage')) {
      productImage = null;
    } else if (productImage.includes('/uploads/') && !productImage.includes('/storage/uploads/')) {
      productImage = productImage.replace('/uploads/', '/storage/uploads/');
    }
  }

  // If it's a relative path (doesn't start with http or data:), prepend the assets directory
  if (productImage && !productImage.startsWith('http') && !productImage.startsWith('data:')) {
    const cleanAssetsDir = CONFIG.assetsDir.endsWith('/') ? CONFIG.assetsDir.slice(0, -1) : CONFIG.assetsDir;
    const cleanPath = productImage.startsWith('/') ? productImage : `/${productImage}`;
    productImage = `${cleanAssetsDir}${cleanPath}`;
  }

  let enrichedTshirtFrontImage = tshirtFrontImage || (is_customized ? productImage : null);
  let enrichedFrontDesign = frontDesign;
  let enrichedBackDesign = backDesign;

  if (is_customized) {
    try {
      const sessionCustomizations = JSON.parse(sessionStorage.getItem('orderCustomizations') || '{}');
      const localCustomizations = JSON.parse(localStorage.getItem('orderCustomizations') || '{}');
      const orderCustomizations = { ...localCustomizations, ...sessionCustomizations };

      const itemKeys = [
        product_id,
        itemable_id,
        row.variant_id,
        cart_id
      ].filter((value) => value !== undefined && value !== null && value !== '')
        .map(String);

      const matchedKey = itemKeys.find((key) => orderCustomizations[key]);
      const customData = matchedKey ? orderCustomizations[matchedKey] : null;

      if (customData) {
        enrichedTshirtFrontImage = enrichedTshirtFrontImage || customData.tshirtFrontImage;
        enrichedFrontDesign = enrichedFrontDesign || customData.frontDesign;
        enrichedBackDesign = enrichedBackDesign || customData.backDesign;
        productImage = productImage || customData.thumbnailImage || customData.item_image;
      }
    } catch (e) {
      console.log('Could not retrieve customizations from storage');
    }
  }

  const resolveDesignImage = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const cleanAssetsDir = CONFIG.assetsDir.endsWith('/') ? CONFIG.assetsDir.slice(0, -1) : CONFIG.assetsDir;
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${cleanAssetsDir}${cleanPath}`;
  };

  const isHoodieTemplate = productName?.toLowerCase().includes('hoodie');
  const isToteTemplate = productName?.toLowerCase().includes('tote bag');
  const isSweatshirtTemplate = productName?.toLowerCase().includes('sweatshirt');
  // If it's not any of the above, we'll treat it as a t-shirt template by default for config
  const isTshirtTemplate = !isHoodieTemplate && !isToteTemplate && !isSweatshirtTemplate;

  const isSwappedCombination = Boolean(
    swapped_combination ?? customization?.swapped_combination,
  );

  const renderThumbnail = () => {
    // If we have customization data, render composite image
    if (enrichedTshirtFrontImage) {
      return (
        <div className="relative w-28 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center isolate" style={{ aspectRatio: '16/11' }}>
          <TshirtCanvas
            mockUrl={enrichedTshirtFrontImage || ''}
            frontDesignUrl={enrichedFrontDesign?.frontImage ? resolveDesignImage(enrichedFrontDesign.frontImage) : resolveDesignImage(frontDesignImage)}
            backDesignUrl={enrichedBackDesign?.frontImage ? resolveDesignImage(enrichedBackDesign.frontImage) : resolveDesignImage(backDesignImage)}
            isSwapped={isSwappedCombination}
            isReverseMockup={isHoodieTemplate}
            className={`transition-transform duration-300 w-full h-full object-cover`}
            frontConfig={{
              scale: isHoodieTemplate ? 0.45 : isSweatshirtTemplate ? 0.80 : isToteTemplate ? 0.75 : isTshirtTemplate ? 0.9 : 1,
              shiftX: isToteTemplate ? 0.115 : isSweatshirtTemplate ? 0.070 : isTshirtTemplate ? 0.055 : -0.03,
              shiftY: isToteTemplate ? 0.19 : isSweatshirtTemplate ? 0.030 : isTshirtTemplate ? -0.02 : 0.08,
              rotation: 0
            }}
            backConfig={{
              scale: isHoodieTemplate ? 0.75 : isSweatshirtTemplate ? 0.40 : isToteTemplate ? 0.55 : isTshirtTemplate ? 0.4 : 1,
              shiftX: isToteTemplate ? -0.11 : isSweatshirtTemplate ? -0.055 : isTshirtTemplate ? -0.05 : 0.020,
              shiftY: isToteTemplate ? 0.19 : isSweatshirtTemplate ? -0.16 : isTshirtTemplate ? -0.23 : 0.10,
              rotation: 0
            }}
          />
        </div>
      );
    }

    return (
      <div className="w-16 h-16 shrink-0 relative rounded-lg overflow-hidden border border-gray-100 bg-[#ffffff]">
        <img
          src={productImage || undefined}
          alt={productName}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/placeholder.png'; // Fallback image if configured, or remove onError
          }}
        />
      </div>
    );
  };

  const priceValue = Number(price) || Number(regular_price) || 0;
  const regularPriceValue = Number(regular_price) || 0;
  const isFlashSale = Boolean(is_flash_sale);
  const flashSaleRemaining = Number(flash_sale_remaining_qty) || 0;

  // Calculate savings if flash sale is active
  const flashSaleSavings = isFlashSale && regularPriceValue > priceValue
    ? (regularPriceValue - priceValue) * quantity
    : 0;

  const isProductInWishlist = wishlistItems?.some((wishlistItem) => {
    const wishProductId = String(wishlistItem.product_id || "");
    const wishVariantId = String(wishlistItem.variant_id || "");
    const rowProductId = String(row.itemable?.product_id || row.product?.product_id || row.itemable_id || row.product_id || "");
    const rowVariantId = String(row.variant_id || (row.itemable_type === 'ProductVariant' || row.product_type === 'ProductVariant' ? row.product_id : "") || "");

    const isSameProduct = wishProductId === rowProductId || wishProductId === String(row.product_id) || wishProductId === String(row.itemable_id);
    if (rowVariantId && wishVariantId) {
      return isSameProduct && wishVariantId === rowVariantId;
    }
    return isSameProduct;
  });

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="py-4 pl-4 pr-2">
        <div className="flex items-center gap-4">
          {renderThumbnail()}

          <div className="flex flex-col gap-1">
            <div className=" items-center gap-2">
              <h2 className="text-sm font-medium  max-w-[240px] truncate">
                <RouterLink href={paths.product.details(slug)} className="hover:text-black transition-colors focus:outline-none">
                  {productName}
                </RouterLink>
              </h2>
              <div>

                {isFlashSale && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.7rem] font-semibold bg-red-100 text-red-600">
                    <Iconify icon="solar:fire-bold" width={14} />
                    Flash Sale
                  </span>
                )}
                {is_customized && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.7rem] font-semibold bg-[#081a1a] text-[#ffffff]">
                    Customized
                  </span>
                )}
              </div>
            </div>
            {isFlashSale && flashSaleRemaining > 0 && (
              <span className="flex items-center gap-1 text-xs text-orange-600 font-medium tracking-tight">
                <Iconify icon="solar:clock-circle-bold" width={12} />
                {flashSaleRemaining} left at this price
              </span>
            )}
            {(frontDesignName || backDesignName) ? (
              <div className="space-y-0.5 pt-0.5">
                {frontDesignName && (
                  <p className="text-xs text-gray-500 truncate max-w-[240px]">
                    Front: {frontDesignName}
                  </p>
                )}
                {backDesignName && (
                  <p className="text-xs text-gray-500 truncate max-w-[240px]">
                    Back: {backDesignName}
                  </p>
                )}
              </div>
            ) : (
              is_customized && customization_snapshot?.placements && customization_snapshot.placements.length > 0 && (
                <div className="space-y-0.5 pt-0.5">
                  {customization_snapshot.placements.map((placement, idx) => (
                    <p key={idx} className="text-xs text-gray-500 truncate max-w-[240px]">
                      <span className="capitalize">{placement.placement_code}</span>: Design #{placement.design_id}
                    </p>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </td>

      <td className="py-4 px-2 align-center pt-6">
        <div className="flex flex-col items-start gap-1">
          {isFlashSale && regularPriceValue > priceValue ? (
            <>
              <span className="text-xs  line-through">
                {fCurrency(regularPriceValue)}
              </span>
              <span className="text-sm font-bold text-red-500">
                {fCurrency(priceValue)}
              </span>
              <span className="text-xs font-semibold text-green-600">
                Save {fCurrency(regularPriceValue - priceValue)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold ">
              {fCurrency(priceValue)}
            </span>
          )}
        </div>
      </td>

      <td className="py-4 px-2 align-middle">
        <div className="w-[100px] ml-auto">
          <NumberInput
            hideDivider
            value={Number(quantity)}
            onChange={(event, quantity) =>
              onChangeItemQuantity(cart_id, quantity)
            }
            min={1}
          />
        </div>
      </td>

      <td className="py-4 px-2 text-right whitespace-nowrap text-sm font-medium  align-middle">
        {fCurrency(priceValue * quantity)}
      </td>

      <td className="py-4 pr-4 pl-2 align-middle">
        <div className="flex items-center justify-end gap-2">
          {!isProductInWishlist && (
            <button
              onClick={() => onMoveToWishlist(row)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-[#ffffff] dark:bg-[#0a1a1a] border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 whitespace-nowrap transition-colors"
            >
              To Wishlist
            </button>
          )}

          <button
            onClick={() => onDeleteCartItem(cart_id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center shrink-0"
            title="Remove item"
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={20} />
          </button>
        </div>
      </td>
    </tr>
  );
}
