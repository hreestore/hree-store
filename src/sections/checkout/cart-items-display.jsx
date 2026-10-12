"use client";

import { Stack } from "@mui/material";

import { CONFIG } from "@/global-config";

import { fCurrency } from "@/utils/format-number";
import TshirtCanvas from '@/components/tshirt-canvas';

// ----------------------------------------------------------------------

export function CartItemsDisplay({ items, deliveryCharge = 0 }) {
    if (!items || items.length === 0) return null;

    const calculateSubtotal = () => {
        return items.reduce((total, item) => {
            const itemPrice = parseFloat(item.price || 0);
            const itemQuantity = parseInt(item.quantity || 0);
            return total + itemPrice * itemQuantity;
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const total = subtotal + deliveryCharge;

    const renderThumbnail = (item) => {
        const productName = item.product_name || item.name;
        const isHoodieTemplate = productName?.toLowerCase().includes('hoodie');
        const isToteTemplate = productName?.toLowerCase().includes('tote bag');
        const isSweatshirtTemplate = productName?.toLowerCase().includes('sweatshirt');
        const isTshirtTemplate = !isHoodieTemplate && !isToteTemplate && !isSweatshirtTemplate;
        const isSwappedCombination = Boolean(
            item.swapped_combination ?? item.customization?.swapped_combination,
        );

        // If we have customization data, render composite image
        if (item.tshirtFrontImage) {
            return (
                <div className="relative w-28 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center isolate" style={{ aspectRatio: '16/11' }}>
                    <TshirtCanvas
                        mockUrl={item.tshirtFrontImage || ''}
                        frontDesignUrl={item.frontDesign?.frontImage || null}
                        backDesignUrl={item.backDesign?.frontImage || null}
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

        // Standard product image fallback
        return (
            <img
                alt={item.product_name || item.name}
                title={item.product_name || item.name}
                src={
                    item.featured_image
                        ? `${item.featured_image}`
                        : `/assets/placeholder.png`
                }
                className="w-24 h-24 shrink-0 rounded bg-gray-100 object-cover"
            />
        );
    };

    return (
        <div className="p-2 md:p-4">
            <Stack spacing={0}>
                {items.map((item, index) => (
                    <div key={item.cart_id || index} className={`py-4 ${index < items.length - 1 ? 'border-b-2 border-[#f7e6dc]/10' : ''}`}>
                        <Stack direction="row" spacing={3} alignItems="center" sx={{ width: '100%' }}>
                            {renderThumbnail(item)}

                            <div className="flex-grow min-w-0 pr-2">
                                <span className="block font-display font-black uppercase  text-md md:text-base">
                                    {item.product_name || item.name}
                                </span>

                                {item.variant_name && (
                                    <span className="block font-sans font-medium text-[12px] md:text-xs mt-1">
                                        Variant: {item.variant_name}
                                    </span>
                                )}

                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    sx={{ mt: 1 }}
                                >
                                    <span className="font-sans font-bold  text-xs md:text-sm">
                                        Qty: {item.quantity}
                                    </span>
                                    <span className="font-sans font-bold text-xs md:text-sm">
                                        {fCurrency(item.price)}
                                    </span>
                                </Stack>
                            </div>

                            <span className="font-display font-black tracking-tighter text-base md:text-xl whitespace-nowrap shrink-0">
                                {fCurrency(parseFloat(item.price) * parseInt(item.quantity))}
                            </span>
                        </Stack>
                    </div>
                ))}
            </Stack>

            <div className="mt-4 pt-4 border-t-[3px] border-[#f7e6dc] flex flex-col gap-2 -mx-2 -mb-2 p-4 rounded-b-xl md:rounded-b-[2rem] md:-mx-4 md:-mb-4">
                <div className="flex justify-between items-center">
                    <span className="font-display font-black uppercase tracking-tighter  text-base md:text-lg">
                        Cart Subtotal:
                    </span>
                    <span className={`font-display font-black tracking-tighter ${deliveryCharge > 0 ? '' : ''} text-xl md:text-2xl`}>
                        {fCurrency(subtotal)}
                    </span>
                </div>
                {deliveryCharge > 0 && (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="font-display font-black uppercase tracking-tighter  text-base md:text-lg">
                                Delivery Charge:
                            </span>
                            <span className="font-display font-black tracking-tighter text-green-500 text-xl md:text-2xl">
                                {fCurrency(deliveryCharge)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#081a1a]/10">
                            <span className="font-display font-black uppercase tracking-tighter  text-base md:text-lg">
                                Total:
                            </span>
                            <span className="font-display font-black tracking-tighter  text-xl md:text-2xl">
                                {fCurrency(total)}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
