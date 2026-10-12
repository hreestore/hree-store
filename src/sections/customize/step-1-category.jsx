import Image from 'next/image';
import { motion } from 'motion/react';

export default function Step1Category({ categories, selectedProduct, setSelectedProduct, nextStep }) {
    return (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-5 lg:mt-4"
        >
            <div>
                <h2 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tighter mb-2 lg:mb-2 leading-none">Select Base <span className="text-[#711a20]"> Category</span></h2>
                <p className="text-gray-500 text-base lg:text-md">Choose the perfect canvas for customizing your design.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:gap-8 lg:grid-cols-4">
                {categories?.filter(type => type.show_in_home === true).map((type) => (
                    <button
                        key={type.category_id}
                        onClick={() => { setSelectedProduct(type); nextStep(); }}
                        className={`group relative h-48 lg:h-100 rounded-2xl lg:rounded-[3rem] overflow-hidden border-2 lg:border-4 transition-all duration-500 ${selectedProduct?.id === type.id ? 'border-[#711a20] scale-[1.02] shadow-xl lg:shadow-2xl' : 'border-transparent hover:border-[#081a1a]/10'
                            }`}
                    >
                        <Image
                            fill
                            src={type.web_image}
                            alt={type.name}
                            title={type.name}
                            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out mix-blend-multiply opacity-90"
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-4 lg:p-10 text-left">
                            <h3 className="text-xl lg:text-2xl font-display font-black text-[#ffffff] uppercase tracking-tighter">{type.name}</h3>
                        </div>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}