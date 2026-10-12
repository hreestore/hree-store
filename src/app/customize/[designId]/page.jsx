'use client';

import { useParams, useRouter } from 'next/navigation';
import { DESIGNS, PRODUCT_TYPES, COLORS, SIZES } from '@/lib/data';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/lib/store';
import { Check, ShoppingBag, ArrowLeft, ChevronRight, ChevronLeft, Maximize2, RotateCw } from 'lucide-react';
import { paths } from '@/routes/paths';


// ----------------------------------------------------
// export async function generateMetadata() {
//   const { appName } = await getAppName();

//   return {
//     metadataBase: new URL("https://zenoxtech.com"),
//     title: `${appName} | About Us`,
//     description:
//       "Experience a modern and feature-rich ecommerce platform offering smooth navigation, fast performance and secure payments",
//     keywords: [
//       "ecommerce",
//       "online shopping",
//       "buy products",
//       "modern ecommerce app",
//       appName,
//     ],
//     authors: [{ name: appName }],
//     creator: appName,
//     publisher: appName,
//     formatDetection: {
//       email: false,
//       address: false,
//       telephone: false,
//     },
//     robots: {
//       index: true,
//       follow: true,
//       nocache: false,
//       googleBot: {
//         index: true,
//         follow: true,
//         "max-video-preview": -1,
//         "max-image-preview": "large",
//         "max-snippet": -1,
//       },
//     },
//     // icons: {
//     //   icon: "/api/favicon.ico",
//     // },
//     alternates: {
//       canonical: "/",
//       languages: {
//         "en-US": "/",
//       },
//     },
//     verification: {
//       google: "your-google-site-verification-code",
//       // yandex: "your-yandex-verification-code",
//       // bing: "your-bing-verification-code",
//     },
//     category: "ecommerce",
//     openGraph: {
//       title: `${appName}`,
//       description:
//         "Experience a powerful and user-friendly ecommerce platform.",
//       url: "/",
//       siteName: appName,
//       images: [
//         {
//           url: "/og-image.png",
//           width: 1200,
//           height: 630,
//           alt: "Ecommerce App Preview",
//         },
//       ],
//       locale: "en_US",
//       type: "website",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: `${appName}`,
//       description: "Shop smarter with our ecommerce solution.",
//       images: ["/og-image.png"],
//       creator: "@your-twitter-handle",
//       site: "@your-twitter-handle",
//     },
//   };
// }

// ------------------------------------------------

export default function CustomizerPage() {
  const params = useParams();
  const router = useRouter();
  const initialDesignId = params.designId;
  const initialDesign = DESIGNS.find((d) => d.id === initialDesignId);

  const [selectedProduct, setSelectedProduct] = useState(PRODUCT_TYPES[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [frontDesign, setFrontDesign] = useState(initialDesignId === 'blank' ? null : initialDesign || null);
  const [backDesign, setBackDesign] = useState(null);
  const [view, setView] = useState('front');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const addItemToCart = useStore((state) => state.addItemToCart);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItemToCart({
      frontDesign,
      backDesign,
      productType: selectedProduct,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    setTimeout(() => {
      setIsAdding(false);
      router.push(paths.checkout);
    }, 1000);
  };

  const toggleView = () => setView(view === 'front' ? 'back' : 'front');

  return (
    <main className="pt-16 pb-32 md:pb-16 min-h-screen bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#081a1a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <div className="hidden md:block text-center">
            <h1 className="text-2xl font-display font-black uppercase tracking-tighter">Studio</h1>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative">
          {/* Live Preview - Sticky on both Mobile and Desktop */}
          <div className="sticky top-20 z-20 bg-[#ffffff] pb-4 lg:pb-0">
            <div className="relative aspect-[4/5] md:aspect-square rounded-[3rem] overflow-hidden bg-[#F8F8F8] border border-black/5 shadow-inner group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedProduct.id}-${selectedColor.hex}-${view}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute inset-0 cursor-zoom-in"
                  onClick={() => setIsZoomed(!isZoomed)}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 50 && view === 'back') setView('front');
                    if (info.offset.x < -50 && view === 'front') setView('back');
                  }}
                >
                  <div
                    className="absolute inset-0 transition-colors duration-1000 ease-in-out"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <Image
                    src={view === 'front' ? selectedProduct.image : selectedProduct.backImage}
                    alt={selectedProduct.name}
                    fill
                    className={`object-cover mix-blend-multiply opacity-90 transition-transform duration-1000 ease-out ${isZoomed ? 'scale-150' : 'scale-100'}`}
                    referrerPolicy="no-referrer"
                  />

                  {/* Design Overlay with Realistic Shadow */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-1/2 h-1/2 relative transition-transform duration-1000 ease-out ${isZoomed ? 'scale-150' : 'scale-100'}`}>
                      <AnimatePresence mode="wait">
                        {(view === 'front' ? frontDesign : backDesign) && (
                          <motion.div
                            key={(view === 'front' ? frontDesign : backDesign)?.id}
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 1.1, opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0"
                          >
                            {(view === 'front' ? frontDesign : backDesign)?.image && (
                              <Image
                                src={(view === 'front' ? frontDesign : backDesign).image}
                                alt="Design"
                                fill
                                className="object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.25)] brightness-95 contrast-110"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* View Swap Button */}
              <button
                onClick={toggleView}
                className="absolute top-8 left-8 p-4 bg-[#ffffff]/90 backdrop-blur-md rounded-full shadow-2xl border border-black/5 hover:scale-110 active:scale-95 transition-all z-30"
                title="Swap View"
              >
                <RotateCw className={`w-6 h-6 text-[#081a1a] transition-transform duration-700 ${view === 'back' ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {/* Zoom Indicator */}
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-8 right-8 p-4 bg-[#ffffff]/90 backdrop-blur-md rounded-full shadow-2xl border border-black/5 hover:scale-110 active:scale-95 transition-all z-30"
              >
                <Maximize2 className={`w-6 h-6 text-[#081a1a] transition-transform ${isZoomed ? 'rotate-45' : 'rotate-0'}`} />
              </button>
            </div>
          </div>

          {/* Customizer Controls */}
          <div className="space-y-16 pb-40 lg:pb-12">
            {/* Selection Summary */}
            <div className="bg-black text-[#ffffff] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#711a20]/20 blur-[60px] rounded-full" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#711a20] mb-8">Configuration</h2>
              <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                <div className="space-y-2">
                  <p className="text-gray-500 text-[9px] uppercase font-black tracking-[0.2em]">Base</p>
                  <p className="font-display font-black text-lg tracking-tighter">{selectedProduct.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-500 text-[9px] uppercase font-black tracking-[0.2em]">Color</p>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: selectedColor.hex }} />
                    <p className="font-display font-black text-lg tracking-tighter">{selectedColor.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-500 text-[9px] uppercase font-black tracking-[0.2em]">Front</p>
                  <p className="font-display font-black text-lg tracking-tighter truncate">{frontDesign?.name || 'None'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-500 text-[9px] uppercase font-black tracking-[0.2em]">Back</p>
                  <p className="font-display font-black text-lg tracking-tighter truncate">{backDesign?.name || 'None'}</p>
                </div>
              </div>
            </div>

            {/* Step 1: Product Type */}
            <section className="space-y-8">
              <div className="flex justify-between items-end">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">1. Product Type</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {PRODUCT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedProduct(type)}
                    className={`p-6 rounded-[2rem] border-2 transition-all text-left group relative overflow-hidden ${selectedProduct.id === type.id
                      ? 'border-[#711a20] bg-black text-[#ffffff] shadow-2xl scale-[1.02]'
                      : 'border-black/5 hover:border-black/20 bg-[#ffffff]'
                      }`}
                  >
                    <p className="font-display font-black text-lg tracking-tighter">{type.name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${selectedProduct.id === type.id ? 'text-[#711a20]' : 'text-gray-400'}`}>
                      From ${type.basePrice}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 2: Color */}
            <section className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">2. Product Color</h3>
              <div className="flex flex-wrap gap-5">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`group relative w-14 h-14 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor.name === color.name ? 'border-black scale-110 shadow-xl' : 'border-transparent hover:scale-105'
                      }`}
                  >
                    <span
                      className="w-11 h-11 rounded-full shadow-inner border border-black/5"
                      style={{ backgroundColor: color.hex }}
                    />
                    {selectedColor.name === color.name && (
                      <Check className={`w-5 h-5 absolute ${color.name === 'White' ? 'text-[#081a1a]' : 'text-[#ffffff]'}`} />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Step 3: Size */}
            <section className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">3. Select Size</h3>
              <div className="flex flex-wrap gap-4">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-16 h-16 rounded-[1.5rem] font-display font-black text-lg transition-all border-2 ${selectedSize === size
                      ? 'bg-black text-[#ffffff] border-black shadow-xl scale-110'
                      : 'bg-[#ffffff] text-[#081a1a] border-black/5 hover:border-black/20'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </section>

            {/* Step 4: Front Design */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">4. Front Design</h3>
                <button onClick={() => setFrontDesign(null)} className="text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors">Clear</button>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 snap-x">
                {DESIGNS.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => {
                      setFrontDesign({
                        ...design,
                        image: design.frontImage || design.image || null,
                      });
                      setView('front');
                    }}
                    className={`relative flex-shrink-0 w-32 aspect-square rounded-[2rem] overflow-hidden border-2 transition-all snap-start ${frontDesign?.id === design.id ? 'border-[#711a20] scale-95 shadow-inner' : 'border-black/5 hover:border-black/20'
                      }`}
                  >
                    {(design.frontImage || design.image) ? (
                      <Image
                        src={design.frontImage || design.image}
                        alt={design.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200" />
                    )}
                    {frontDesign?.id === design.id && (
                      <div className="absolute inset-0 bg-[#711a20]/20 flex items-center justify-center backdrop-blur-[2px]">
                        <Check className="w-8 h-8 text-[#ffffff] drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Step 5: Back Design */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">5. Back Design</h3>
                <button onClick={() => setBackDesign(null)} className="text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors">Clear</button>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 snap-x">
                {DESIGNS.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => {
                      setBackDesign({
                        ...design,
                        image: design.backImage || design.frontImage || design.image || null,
                      });
                      setView('back');
                    }}
                    className={`relative flex-shrink-0 w-32 aspect-square rounded-[2rem] overflow-hidden border-2 transition-all snap-start ${backDesign?.id === design.id ? 'border-[#711a20] scale-95 shadow-inner' : 'border-black/5 hover:border-black/20'
                      }`}
                  >
                    {(design.backImage || design.frontImage || design.image) ? (
                      <Image
                        src={design.backImage || design.frontImage || design.image}
                        alt={design.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200" />
                    )}
                    {backDesign?.id === design.id && (
                      <div className="absolute inset-0 bg-[#711a20]/20 flex items-center justify-center backdrop-blur-[2px]">
                        <Check className="w-8 h-8 text-[#ffffff] drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Step 6: View Toggle Switch */}
            <section className="space-y-8 pt-8 border-t border-black/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">6. Live Preview Toggle</h3>
              <div className="flex p-1.5 bg-gray-100 rounded-[2rem] w-full max-w-xs shadow-inner">
                <button
                  onClick={() => setView('front')}
                  className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'front' ? 'bg-[#ffffff] text-[#081a1a] shadow-xl scale-105' : 'text-gray-400 hover:text-[#081a1a]'
                    }`}
                >
                  Front View
                </button>
                <button
                  onClick={() => setView('back')}
                  className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'back' ? 'bg-[#ffffff] text-[#081a1a] shadow-xl scale-105' : 'text-gray-400 hover:text-[#081a1a]'
                    }`}
                >
                  Back View
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#ffffff]/80 backdrop-blur-2xl border-t border-black/5 p-6 md:p-8 shadow-[0_-20px_60px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="hidden sm:block">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Estimated Total</p>
            <p className="text-4xl font-display font-black tracking-tighter">${selectedProduct.basePrice * quantity}</p>
          </div>

          <div className="flex items-center border-2 border-black/5 rounded-full p-1.5 bg-gray-50/50">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#ffffff] hover:shadow-md transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-6 font-display font-black text-xl">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#ffffff] hover:shadow-md transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex-1 md:flex-none md:px-16 py-5 rounded-full font-black uppercase tracking-tighter text-lg flex items-center justify-center gap-4 transition-all relative overflow-hidden ${isAdding
              ? 'bg-green-500 text-[#ffffff]'
              : 'bg-black text-[#ffffff] hover:bg-[#711a20] shadow-2xl active:scale-95'
              }`}
          >
            {isAdding ? (
              <>
                <Check className="w-6 h-6" /> Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="w-6 h-6" />
                <span className="md:hidden">Add — ${selectedProduct.basePrice * quantity}</span>
                <span className="hidden md:inline">Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
