import Image from 'next/image';
import { motion } from 'motion/react';
import { Loader2, Check } from 'lucide-react';
import { CONFIG } from '@/global-config';
import { fCurrency } from '@/utils';
import { useEffect, useRef } from 'react';

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

export default function Step2Design({
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
            className="space-y-1 mb-3 py-3 
            "
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

                {Array.isArray(designCombination?.data) && [...designCombination.data]
                    .sort((a, b) => a.id - b.id)
                    .map((combination) => {
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
                                    setSelectedCombinationId(combination.id); // <-- Add this line
                                    setFrontDesign(frontPayload);
                                    setBackDesign(backPayload);
                                }}
                                className={`group relative rounded-2xl lg:rounded-2xl overflow-hidden border-2 lg:border-4 transition-all duration-500 ${isSelected
                                    ? 'border-[#711a20] scale-75 shadow-inner'
                                    : 'border-transparent hover:border-[#081a1a]/10'
                                    }`}
                            >
                                <div className="p-2 lg:p-2.5 ">
                                    <div className="relative aspect-square rounded-xl lg:rounded-xl overflow-hidden border border-[#ffffff]/40 mb-0 pb-0">
                                        <CanvasImage
                                            src={CONFIG.assetsDir + primaryItem.design.featured_image}
                                            alt={primaryItem.design.name}
                                            title={primaryItem.design.name}
                                        />
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#711a20] text-[#ffffff] p-2 lg:p-3 rounded-xl lg:rounded-2xl shadow-2xl rotate-12">
                                        <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
            </div>

            {selectedItem && (
                <div className="flex justify-center">
                    <div className="px-4 py-3 mt-4 border-white rounded-xl border  flex items-center justify-between gap-4 shadow-sm w-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                            <div className="flex flex-col">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Selected Product</p>
                                <p className="font-display font-black uppercase tracking-tight text-sm lg:text-base leading-none truncate max-w-[200px] lg:max-w-xs">{selectedItem.name}</p>
                            </div>
                            <div className="hidden lg:block w-1 h-1 rounded-full bg-gray-300" />
                        </div>
                        <div className='flex gap-2 items-center'>
                            <p className="text-sm font-bold  mt-1 lg:mt-0">
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
