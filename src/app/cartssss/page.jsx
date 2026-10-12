'use client';

import { useStore } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronRight } from 'lucide-react';
import { paths } from '@/routes/paths';
import { getAppName } from '@/api';

// ------------------------------------------------

// export async function generateMetadata() {
//   const { appName } = await getAppName();

//   return {
//     metadataBase: new URL("https://zenoxtech.com"),
//     title: `${appName} | Shopping Cart`,
//     description:
//       "Review your shopping cart items, update quantities, and proceed to checkout. Manage your selected products before completing your purchase.",
//     keywords: [
//       "shopping cart",
//       "cart",
//       "checkout",
//       "online shopping",
//       "review order",
//       appName,
//     ],
//     alternates: {
//       canonical: "/cart",
//     },
//     openGraph: {
//       title: `${appName} | Shopping Cart`,
//       description: "Review your shopping cart items and proceed to checkout.",
//       url: "https://zenoxtech.com/cart",
//       siteName: appName,
//       type: "website",
//       locale: "en_US",
//       images: [
//         {
//           url: "/og-image.png",
//           width: 1200,
//           height: 630,
//           alt: "Shopping Cart",
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: `${appName} | Shopping Cart`,
//       description: "Review your shopping cart items and proceed to checkout.",
//       images: ["/og-image.png"],
//     },
//     robots: {
//       index: true,
//       follow: true,
//       nocache: true,
//     },
//   };
// }

// ------------------------------------------------

export default function Page() {
  const { cart, removeFromCart, updateQuantity } = useStore();

  const subtotal = cart.reduce((acc, item) => acc + item.productType.basePrice * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <main className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h1 className="text-5xl font-display font-black uppercase tracking-tighter mb-4">Your bag is empty</h1>
          <p className="text-gray-500 mb-10 text-lg font-medium">Looks like you haven&apos;t added any custom pieces yet.</p>
          <Link
            href={paths.catalog}
            className="inline-block bg-[#711a20] text-[#ffffff] px-12 py-5 rounded-full font-black uppercase tracking-tighter hover:bg-[#a00000] transition-all shadow-xl hover:scale-105"
          >
            Start Designing
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h1 className="text-6xl md:text-7xl font-display font-black uppercase tracking-tighter leading-none">Shopping Bag</h1>
            <p className="text-gray-500 mt-4 text-lg font-medium">Review your custom creations before checkout.</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            <span className="text-[#081a1a]">Cart</span>
            <ChevronRight className="w-3 h-3" />
            <span>Shipping</span>
            <ChevronRight className="w-3 h-3" />
            <span>Confirm</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#ffffff] rounded-[3.5rem] p-10 border border-black/5 shadow-sm">
              <div className="space-y-12">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-8 group">
                    <div className="relative w-full sm:w-48 h-48 rounded-[2.5rem] overflow-hidden bg-gray-50 flex-shrink-0 border border-black/5 shadow-inner">
                      <Image
                        src={item.mockupFrontImage || item.productType.image}
                        alt={item.productType.name}
                        fill
                        className="object-cover mix-blend-multiply opacity-90"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center p-10">
                        {(item.frontDesign || item.backDesign) && (
                          <Image
                            src={item.frontDesign ? item.frontDesign.image : item.backDesign.image}
                            alt={item.frontDesign ? item.frontDesign.name : item.backDesign.name}
                            width={100}
                            height={100}
                            className="object-contain drop-shadow-2xl"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-3xl font-display font-black uppercase tracking-tight text-gray-900 mb-2">
                            {item.frontDesign?.name || 'No Front Design'}
                            {item.backDesign ? ` / ${item.backDesign.name}` : ''}
                          </h3>
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                            {item.productType.name} • {item.color.name} • {item.size}
                          </p>
                          <div className="flex gap-2 mt-4">
                            {item.frontDesign && <span className="text-[9px] bg-black text-[#ffffff] px-3 py-1 rounded-full font-black uppercase tracking-widest">Front</span>}
                            {item.backDesign && <span className="text-[9px] bg-black text-[#ffffff] px-3 py-1 rounded-full font-black uppercase tracking-widest">Back</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-3 text-gray-300 hover:text-[#711a20] hover:bg-[#711a20]/5 rounded-2xl transition-all"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-8">
                        <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-black/5">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2.5 hover:text-[#711a20] transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-6 font-display font-black text-xl">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2.5 hover:text-[#711a20] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-4xl font-display font-black tracking-tighter">${item.productType.basePrice * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-black text-[#ffffff] rounded-[3.5rem] p-12 sticky top-32 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#711a20] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />

              <h2 className="text-3xl font-display font-black uppercase tracking-tighter mb-10 relative z-10">Summary</h2>

              <div className="space-y-6 mb-12 relative z-10">
                <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-xs">
                  <span>Subtotal</span>
                  <span className="text-[#ffffff]">${subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-xs">
                  <span>Shipping</span>
                  <span className="text-[#ffffff]">Calculated at checkout</span>
                </div>
                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Estimated Total</p>
                    <span className="text-5xl font-display font-black tracking-tighter leading-none">${subtotal}</span>
                  </div>
                </div>
              </div>

              <Link
                href={paths.checkout}
                className="group w-full bg-[#711a20] text-[#ffffff] py-7 rounded-full font-black text-xl uppercase tracking-tighter hover:bg-[#a00000] transition-all flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 relative z-10"
              >
                Checkout <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>

              <p className="text-center text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-8 relative z-10">
                Secure WhatsApp Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
