import { motion } from 'motion/react';
import { fCurrency } from '@/utils';

export default function Step4Review({
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
            className="space-y-1 mb-5"
        >
            <div className='mb-3'>
                <h2 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tighter mb-2 lg:mb-4 leading-none">Final <span className="text-[#711a20]">Review</span></h2>
            </div>

            <div className="space-y-3 lg:space-y-3">
                <div className="flex justify-between items-center p-3 lg:p-4  rounded-2xl lg:rounded-[1.5rem] border border-[#ffffff]/90 dark:border-[#081a1a]/90 ">
                    <span className="text-[10px] font-black uppercase tracking-widest ">Product</span>
                    <span className="font-display font-black uppercase tracking-tight text-base lg:text-lg">{selectedProduct?.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 lg:p-4  rounded-2xl lg:rounded-[1.5rem] border border-[#ffffff]/90 dark:border-[#081a1a]/90 ">
                    <span className="text-[10px] font-black uppercase tracking-widest ">Color</span>
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="w-4 h-4 lg:w-5 lg:h-5 rounded" style={{ background: selectedColor?.hex, boxShadow: '0 0 20px #cacaca' }} />
                        <span className="font-display font-black uppercase tracking-tight text-base lg:text-lg">{selectedColor?.name}</span>
                    </div>
                </div>
                {!!selectedSize && (

                    <div className="flex justify-between items-center p-3 lg:p-4  rounded-2xl lg:rounded-[1.5rem] border border-[#ffffff]/90 dark:border-[#081a1a]/90 ">
                        <span className="text-[10px] font-black uppercase tracking-widest ">Size</span>
                        <span className="font-display font-black uppercase tracking-tight text-base lg:text-lg">{selectedSize}</span>
                    </div>
                )

                }
                <div className="flex justify-between items-center p-3 lg:p-4  rounded-2xl lg:rounded-[1.5rem] border border-[#ffffff]/90 dark:border-[#081a1a]/90 ">
                    <span className="text-[10px] font-black uppercase tracking-widest ">Front Design</span>
                    <span className="font-display font-black uppercase tracking-tight text-base lg:text-lg truncate max-w-[150px] lg:max-w-[200px] text-right">{frontDesign?.name}</span>
                </div>
                {/* {backDesign && (
                    <div className="flex justify-between items-center p-3 lg:p-4  rounded-2xl lg:rounded-[1.5rem] border border-[#ffffff]/90 dark:border-[#081a1a]/90 ">
                        <span className="text-[10px] font-black uppercase tracking-widest ">Back Design</span>
                        <span className="font-display font-black uppercase tracking-tight text-base lg:text-lg truncate max-w-[150px] lg:max-w-[200px] text-right">{backDesign?.name}</span>
                    </div>
                )} */}
                <div className="flex justify-between items-center p-3 lg:p-3 bg-[#711a20] text-[#ffffff] rounded-2xl lg:rounded-[2rem] mt-6 lg:mt-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#711a20] opacity-20 blur-3xl" />
                    <span className="text-lg font-display font-black uppercase tracking-tighter">Total Price</span>
                    <span className="text-2xl lg:text-2xl font-display font-black tracking-tighter">{fCurrency(
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