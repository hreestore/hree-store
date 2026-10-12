import { CONFIG } from "@/global-config";
import { fCurrency } from "@/utils/format-number";
import { Tag } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectCartItems } from "@/redux/selectors";
import { useGetDesignCombinationShow } from "@/api";
import TshirtCanvas from '@/components/tshirt-canvas';

// ----------------------------------------------------------------------

export function OrderDetailsItems({
  sx,
  taxDetails,
  shipping,
  unit_price,
  discount,
  discountDetails,
  subtotal,
  items = [],
  totalAmount,
  paymentInfo,
  ...other
}) {

  const cartItems = useAppSelector(selectCartItems);
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    const cleanAssetsDir = CONFIG.assetsDir.endsWith('/') ? CONFIG.assetsDir.slice(0, -1) : CONFIG.assetsDir;
    return `${cleanAssetsDir}/${cleanUrl}`;
  };

  const enrichItemWithCartData = (orderItem) => {
    const orderItemKeys = [
      orderItem.item_id,
      orderItem.itemable_id,
      orderItem.product_id,
      orderItem.variant_id,
    ]
      .filter((value) => value !== undefined && value !== null && value !== '')
      .map((value) => String(value));

    // First try: Redux cart (for same session)
    if (cartItems?.length) {
      const cartItem = cartItems.find((ci) => {
        const cartItemKeys = [ci.product_id, ci.itemable_id, ci.variant_id, ci.item_id]
          .filter((value) => value !== undefined && value !== null && value !== '')
          .map((value) => String(value));

        return orderItemKeys.some((orderKey) => cartItemKeys.includes(orderKey));
      });

      if (cartItem) {
        return {
          ...orderItem,
          tshirtFrontImage: orderItem.tshirt_front_image || cartItem.tshirtFrontImage,
          frontDesign: orderItem.frontDesign || (cartItem.frontDesign && {
            frontImage: cartItem.frontDesign.frontImage,
            name: cartItem.frontDesign.name,
          }),
          backDesign: orderItem.backDesign || (cartItem.backDesign && {
            frontImage: cartItem.backDesign.frontImage,
            name: cartItem.backDesign.name,
          }),
          front_design_image: orderItem.front_design_image || cartItem.frontDesign?.frontImage,
          back_design_image: orderItem.back_design_image || cartItem.backDesign?.frontImage,
          front_design: orderItem.front_design || cartItem.frontDesign?.name,
          back_design: orderItem.back_design || cartItem.backDesign?.name,
        };
      }
    }

    // Second try: Session storage (for different sessions)
    try {
      const sessionCustomizations = JSON.parse(sessionStorage.getItem('orderCustomizations') || '{}');
      const localCustomizations = JSON.parse(localStorage.getItem('orderCustomizations') || '{}');
      const orderCustomizations = { ...localCustomizations, ...sessionCustomizations };
      const matchedKey = orderItemKeys.find((key) => orderCustomizations[key]);
      const customData = matchedKey ? orderCustomizations[matchedKey] : null;

      if (customData) {
        return {
          ...orderItem,
          tshirtFrontImage: orderItem.tshirt_front_image || customData.tshirtFrontImage,
          frontDesign: orderItem.frontDesign || customData.frontDesign,
          backDesign: orderItem.backDesign || customData.backDesign,
          front_design_image: orderItem.front_design_image || customData.front_design_image,
          back_design_image: orderItem.back_design_image || customData.back_design_image,
          front_design: orderItem.front_design || customData.front_design || customData.frontDesign?.name,
          back_design: orderItem.back_design || customData.back_design || customData.backDesign?.name,
          item_image: orderItem.item_image || customData.item_image || customData.thumbnailImage,
          featured_image: orderItem.featured_image || customData.featured_image,
          thumbnailImage: customData.thumbnailImage,
        };
      }
    } catch (e) {
      console.log('Could not retrieve customizations from session storage');
    }

    return orderItem;
  };

  const renderTotal = () => (
    <div className="p-6  border-t border-gray-600 space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="">Subtotal</span>
        <span className="font-bold ">
          {fCurrency(subtotal) || "-"}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="">Shipping</span>
        <span className={`font-bold ${shipping > 0 ? "text-green-600" : "text-gray-900"}`}>
          {shipping > 0 ? `+ ${fCurrency(shipping)}` : "-"}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="">
          {taxDetails?.tax_name || "VAT"}
          {taxDetails?.percentage && ` (${taxDetails.percentage}%)`}
          {taxDetails?.price_includes_tax ? " (Included)" : ""}
        </span>
        <span className={`font-medium ${(taxDetails?.tax_amount || 0) > 0 ? "text-green-600" : ""}`}>
          {(taxDetails?.tax_amount || 0) > 0 ? `+ ${fCurrency(taxDetails.tax_amount)}` : "-"}
        </span>
      </div>


      <div className="flex justify-between items-center text-sm">
        <span className="">Discount</span>
        <span className={`font-medium ${discount > 0 ? "text-red-600" : ""}`}>
          {discount > 0 ? `- ${fCurrency(discount)}` : "-"}
        </span>
      </div>

      {discountDetails && discount > 0 && (
        <div className="p-4 bg-green-50 border border-dashed border-green-500 rounded-xl space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-green-600" />
            <span className="font-black uppercase tracking-wider text-sm">
              {discountDetails.discount_code}
            </span>
            <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-black uppercase tracking-wider rounded-full">
              {discountDetails.discount_type === 'percentage'
                ? `${discountDetails.discount_value}% OFF`
                : `${fCurrency(discountDetails.discount_value)} OFF`}
            </span>
          </div>
          {discountDetails.description && (
            <p className="text-xs  pl-6">
              {discountDetails.description}
            </p>
          )}
          <p className="text-xs text-green-700 font-semibold pl-6">
            Applied to: {discountDetails.applies_to === 'all' ? 'All items' : discountDetails.applies_to === 'category' ? 'Category items' : 'Specific product'}
          </p>
        </div>
      )}

      <div className="pt-3 border-t border-gray-600 flex justify-between items-center">
        <span className="text-lg font-display font-black uppercase tracking-tighter ">Total</span>
        <span className="text-2xl font-display font-black text-[#711a20]">
          {fCurrency(totalAmount) || "-"}
        </span>
      </div>
    </div>
  );

  return (
    <div className=" rounded-3xl shadow-xl border border-[#ffffff]/10 overflow-hidden" {...other}>
      <div className="px-6 py-5 border-b border-gray-600">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter">
          Order <span className="text-[#711a20]">Details</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {items?.map((item, index) => (
            <OrderItemRow
              key={item.order_item_id || index}
              item={item}
              index={index}
              taxDetails={taxDetails}
              enrichItemWithCartData={enrichItemWithCartData}
              getImageUrl={getImageUrl}
            />
          ))}
        </div>
      </div>

      {renderTotal()}
    </div>
  );
}

function OrderItemRow({ item, index, taxDetails, enrichItemWithCartData, getImageUrl }) {
  const tshirtImage = item.item_image;
  const combinationId = item?.design_combination?.id;
  const { designCombinationShow } = useGetDesignCombinationShow(combinationId);
  const combination = designCombinationShow?.data?.[0];

  const enrichedItem = enrichItemWithCartData(item);
  const itemTotal = Number(enrichedItem.unit_price || enrichedItem.price || 0);
  // const productImage = getImageUrl(enrichedItem.thumbnailImage || enrichedItem.item_image || enrichedItem.featured_image);
  // const tshirtFrontImage = getImageUrl(enrichedItem.tshirtFrontImage || enrichedItem.tshirt_front_image) || (enrichedItem.is_customized ? productImage : null);

  const frontCombinationImage = combination?.items?.[0]?.design?.featured_image;
  const backCombinationImage = combination?.items?.[1]?.design?.featured_image;

  const frontDesignImage = getImageUrl(enrichedItem.frontDesign?.frontImage || enrichedItem.front_design_image || frontCombinationImage);
  const backDesignImage = getImageUrl(enrichedItem.backDesign?.frontImage || enrichedItem.back_design_image || backCombinationImage);

  const frontDesignName = enrichedItem.frontDesign?.name || enrichedItem.front_design;
  const backDesignName = enrichedItem.backDesign?.name || enrichedItem.back_design;
  const designCombination = enrichedItem.design_combination;
  const is_customized = enrichedItem.is_customized;
  const customization_snapshot = enrichedItem.customization_snapshot;
  const isSwappedCombination = Boolean(
    enrichedItem.swapped_combination ?? enrichedItem.customization?.swapped_combination,
  );

  let displayAmount = itemTotal;
  if (taxDetails?.price_includes_tax && taxDetails?.percentage) {
    displayAmount = itemTotal / (1 + taxDetails.percentage / 100);
  }

  const productName = enrichedItem.item_name;
  const isHoodieTemplate = productName?.toLowerCase().includes('hoodie');
  const isToteTemplate = productName?.toLowerCase().includes('tote bag');
  const isSweatshirtTemplate = productName?.toLowerCase().includes('sweatshirt');
  const isTshirtTemplate = !isHoodieTemplate && !isToteTemplate && !isSweatshirtTemplate;

  return (
    <div
      key={enrichedItem.order_item_id}
      className="p-6 flex items-center gap-4 border-b border-dashed border-gray-600  transition-colors"
    >
      {tshirtImage ? (
        <div className="relative w-28 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center isolate" style={{ aspectRatio: '16/11' }}>
          <TshirtCanvas
            mockUrl={tshirtImage || ''}
            frontDesignUrl={frontDesignImage || null}
            backDesignUrl={backDesignImage || null}
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
      ) : (
        <div className="w-16 h-16 shrink-0 relative rounded-lg overflow-hidden border border-gray-100 bg-[#ffffff]">
          <img
            src={productImage || '/assets/placeholder.png'}
            alt={enrichedItem.item_name}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.src = '/assets/placeholder.png';
            }}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium truncate">
            {enrichedItem.item_name}
          </p>
          {is_customized && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.7rem] font-semibold bg-[#081a1a] text-[#ffffff]">
              Customized
            </span>
          )}
        </div>

        {/* Design combination from API */}
        {designCombination && (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#711a20] bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
              {designCombination.name}
            </span>
            {designCombination.code && (
              <span className="text-xs text-gray-400 font-mono">
                #{designCombination.code}
              </span>
            )}
          </div>
        )}

        {/* Fallback: design from cart/session data */}
        {!designCombination && (frontDesignName || backDesignName) ? (
          <div className="mt-1 space-y-0.5">
            {frontDesignName && (
              <p className="text-xs truncate">
                Front: {frontDesignName}
              </p>
            )}
            {backDesignName && (
              <p className="text-xs truncate">
                Back: {backDesignName}
              </p>
            )}
          </div>
        ) : (
          is_customized && customization_snapshot?.placements && customization_snapshot.placements.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {customization_snapshot.placements.map((placement, idx) => (
                <p key={idx} className="text-xs text-gray-500 truncate max-w-[240px]">
                  <span className="capitalize">{placement.placement_code}</span>: Design #{placement.design_id}
                </p>
              ))}
            </div>
          )
        )}
      </div>

      <div className="text-sm font-medium">
        x{enrichedItem.quantity}
      </div>

      <div className="w-28 text-right">
        <span className="text-lg font-bold">
          {fCurrency(displayAmount)}
        </span>
      </div>
    </div>
  );
}
