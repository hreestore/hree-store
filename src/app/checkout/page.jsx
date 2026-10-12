import { CheckoutView } from "@/sections/checkout/view/checkout-view";

// ----------------------------------------------------------------------

export const metadata = { title: "Checkout" };

export default function Page() {
  return <CheckoutView />;
}


// 'use client';

// import { useStore } from '@/lib/store';
// import Image from 'next/image';
// import Link from 'next/link';
// import { motion } from 'motion/react';
// import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle2, MessageSquare } from 'lucide-react';
// import { useState } from 'react';
// import { paths } from '@/routes/paths';
// import { getAppName } from '@/api';

// // ------------------------------------------------
// // export async function generateMetadata() {
// //   const { appName } = await getAppName();

// //   return {
// //     metadataBase: new URL("https://zenoxtech.com"),
// //     title: `${appName} | About Us`,
// //     description:
// //       "Experience a modern and feature-rich ecommerce platform offering smooth navigation, fast performance and secure payments",
// //     keywords: [
// //       "ecommerce",
// //       "online shopping",
// //       "buy products",
// //       "modern ecommerce app",
// //       appName,
// //     ],
// //     authors: [{ name: appName }],
// //     creator: appName,
// //     publisher: appName,
// //     formatDetection: {
// //       email: false,
// //       address: false,
// //       telephone: false,
// //     },
// //     robots: {
// //       index: true,
// //       follow: true,
// //       nocache: false,
// //       googleBot: {
// //         index: true,
// //         follow: true,
// //         "max-video-preview": -1,
// //         "max-image-preview": "large",
// //         "max-snippet": -1,
// //       },
// //     },
// //     // icons: {
// //     //   icon: "/api/favicon.ico",
// //     // },
// //     alternates: {
// //       canonical: "/",
// //       languages: {
// //         "en-US": "/",
// //       },
// //     },
// //     verification: {
// //       google: "your-google-site-verification-code",
// //       // yandex: "your-yandex-verification-code",
// //       // bing: "your-bing-verification-code",
// //     },
// //     category: "ecommerce",
// //     openGraph: {
// //       title: `${appName}`,
// //       description:
// //         "Experience a powerful and user-friendly ecommerce platform.",
// //       url: "/",
// //       siteName: appName,
// //       images: [
// //         {
// //           url: "/og-image.png",
// //           width: 1200,
// //           height: 630,
// //           alt: "Ecommerce App Preview",
// //         },
// //       ],
// //       locale: "en_US",
// //       type: "website",
// //     },
// //     twitter: {
// //       card: "summary_large_image",
// //       title: `${appName}`,
// //       description: "Shop smarter with our ecommerce solution.",
// //       images: ["/og-image.png"],
// //       creator: "@your-twitter-handle",
// //       site: "@your-twitter-handle",
// //     },
// //   };
// // }
// // ------------------------------------------------

// export default function CheckoutPage() {
//   const { cart, removeFromCart, updateQuantity, clearCart } = useStore();
//   const [isOrdered, setIsOrdered] = useState(false);
//   const [whatsappLink, setWhatsappLink] = useState('');
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     address: '',
//     city: '',
//     state: '',
//     zip: '',
//     phone: '',
//   });

//   const subtotal = cart.reduce((acc, item) => acc + item.productType.basePrice * item.quantity, 0);
//   const shipping = subtotal > 100 ? 0 : 10;
//   const total = subtotal + shipping;

//   const handlePlaceOrder = (e) => {
//     e.preventDefault();

//     // Construct WhatsApp message
//     const phoneNumber = '9779801066279';
//     let message = `*NEW ORDER CONFIRMED - HREE CREATE*\n\n`;
//     message += `*Customer:* ${formData.firstName} ${formData.lastName}\n`;
//     message += `*Phone:* ${formData.phone}\n`;
//     message += `*Address:* ${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}\n\n`;
//     message += `*Items:*\n`;

//     cart.forEach((item, index) => {
//       message += `${index + 1}. ${item.productType.name} (${item.quantity}x)\n`;
//       message += `   - Size: ${item.size}\n`;
//       message += `   - Color: ${item.color.name}\n`;
//       if (item.frontDesign) message += `   - Front: ${item.frontDesign.name}\n`;
//       if (item.backDesign) message += `   - Back: ${item.backDesign.name}\n`;
//       message += `   - Price: $${item.productType.basePrice * item.quantity}\n\n`;
//     });

//     message += `*Total Amount: $${total}*`;

//     const encodedMessage = encodeURIComponent(message);
//     const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

//     setWhatsappLink(whatsappUrl);
//     setIsOrdered(true);

//     // Open WhatsApp in a new tab
//     window.open(whatsappUrl, '_blank');

//     setTimeout(() => {
//       clearCart();
//     }, 1000);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   if (isOrdered) {
//     return (
//       <main className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-[#ffffff]">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="text-center px-4 max-w-lg"
//         >
//           <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
//             <CheckCircle2 className="w-12 h-12" />
//           </div>
//           <h1 className="text-5xl font-display font-black uppercase tracking-tighter mb-4">Order Confirmed!</h1>
//           <p className="text-gray-500 mb-8 text-lg">
//             Thank you for shopping with Hree Create. We&apos;ve sent your order details to our team via WhatsApp. We&apos;ll contact you soon for delivery.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <a
//               href={whatsappLink || `https://wa.me/9779801066279`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="bg-green-500 text-[#ffffff] px-10 py-4 rounded-full font-bold hover:bg-green-600 transition-all uppercase tracking-tighter flex items-center justify-center gap-2"
//             >
//               <MessageSquare className="w-5 h-5" />
//               Open WhatsApp
//             </a>
//             <Link
//               href={paths.home}
//               className="bg-black text-[#ffffff] px-10 py-4 rounded-full font-bold hover:bg-gray-900 transition-all uppercase tracking-tighter"
//             >
//               Back to Home
//             </Link>
//           </div>
//         </motion.div>
//       </main>
//     );
//   }

//   if (cart.length === 0) {
//     return (
//       <main className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center px-4">
//           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <ShoppingBag className="w-10 h-10 text-gray-300" />
//           </div>
//           <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-4">Your cart is empty</h1>
//           <p className="text-gray-500 mb-8 text-lg">Looks like you haven&apos;t created any custom apparel yet.</p>
//           <Link
//             href={paths.catalog}
//             className="inline-block bg-[#711a20] text-[#ffffff] px-12 py-5 rounded-full font-black uppercase tracking-tighter hover:bg-[#a00000] transition-all shadow-xl hover:scale-105"
//           >
//             Start Designing
//           </Link>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="pt-32 pb-24 min-h-screen bg-gray-50/50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
//           <div>
//             <h1 className="text-6xl md:text-7xl font-display font-black uppercase tracking-tighter leading-none">Checkout</h1>
//             <p className="text-gray-500 mt-4 text-lg font-medium">Complete your order and we&apos;ll process it via WhatsApp.</p>
//           </div>
//           <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
//             <span className="text-[#081a1a]">Cart</span>
//             <ArrowRight className="w-3 h-3" />
//             <span>Shipping</span>
//             <ArrowRight className="w-3 h-3" />
//             <span>Confirm</span>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
//           {/* Order Summary */}
//           <div className="lg:col-span-7 space-y-12">
//             <div className="bg-[#ffffff] rounded-[3.5rem] p-10 border border-black/5 shadow-sm">
//               <div className="flex items-center justify-between mb-10">
//                 <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Your Selection</h2>
//                 <span className="bg-gray-100 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{cart.length} Items</span>
//               </div>
//               <div className="space-y-10">
//                 {cart.map((item) => (
//                   <div key={item.id} className="flex gap-8 group">
//                     <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden bg-gray-50 flex-shrink-0 border border-black/5 shadow-inner">
//                       <Image
//                         src={item.mockupFrontImage || item.productType.image}
//                         alt={item.productType.name}
//                         fill
//                         className="object-cover mix-blend-multiply opacity-90"
//                         referrerPolicy="no-referrer"
//                       />
//                       <div className="absolute inset-0 flex items-center justify-center p-8">
//                         {(item.frontDesign || item.backDesign) && (
//                           <Image
//                             src={item.frontDesign ? item.frontDesign.image : item.backDesign.image}
//                             alt={item.frontDesign ? item.frontDesign.name : item.backDesign.name}
//                             width={80}
//                             height={80}
//                             className="object-contain drop-shadow-2xl"
//                             referrerPolicy="no-referrer"
//                           />
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex-1 min-w-0 flex flex-col justify-between py-2">
//                       <div className="flex justify-between items-start gap-4">
//                         <div>
//                           <h3 className="text-2xl font-display font-black uppercase tracking-tight text-gray-900 mb-2">
//                             {item.frontDesign?.name || 'No Front Design'}
//                             {item.backDesign ? ` / ${item.backDesign.name}` : ''}
//                           </h3>
//                           <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
//                             {item.productType.name} • {item.color.name} • {item.size}
//                           </p>
//                           <div className="flex gap-2 mt-4">
//                             {item.frontDesign && <span className="text-[9px] bg-black text-[#ffffff] px-3 py-1 rounded-full font-black uppercase tracking-widest">Front</span>}
//                             {item.backDesign && <span className="text-[9px] bg-black text-[#ffffff] px-3 py-1 rounded-full font-black uppercase tracking-widest">Back</span>}
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => removeFromCart(item.id)}
//                           className="p-3 text-gray-300 hover:text-[#711a20] hover:bg-[#711a20]/5 rounded-2xl transition-all"
//                         >
//                           <Trash2 className="w-6 h-6" />
//                         </button>
//                       </div>
//                       <div className="flex justify-between items-center mt-6">
//                         <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-black/5">
//                           <button
//                             onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
//                             className="p-2.5 hover:text-[#711a20] transition-colors"
//                           >
//                             <Minus className="w-4 h-4" />
//                           </button>
//                           <span className="px-6 font-display font-black text-lg">{item.quantity}</span>
//                           <button
//                             onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                             className="p-2.5 hover:text-[#711a20] transition-colors"
//                           >
//                             <Plus className="w-4 h-4" />
//                           </button>
//                         </div>
//                         <p className="text-3xl font-display font-black tracking-tighter">${item.productType.basePrice * item.quantity}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Shipping Form */}
//             <form id="checkout-form" onSubmit={handlePlaceOrder} className="bg-[#ffffff] rounded-[3.5rem] p-12 border border-black/5 shadow-sm space-y-10">
//               <div className="flex items-center gap-6 mb-4">
//                 <div className="w-14 h-14 bg-[#711a20] text-[#ffffff] rounded-2xl flex items-center justify-center font-display font-black text-xl rotate-6">1</div>
//                 <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Shipping Details</h2>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="space-y-3">
//                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">First Name</label>
//                   <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="John" className="w-full px-8 py-5 rounded-[2rem] border border-black/5 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-[#711a20]/10 focus:bg-[#ffffff] transition-all font-bold uppercase tracking-widest text-sm" />
//                 </div>
//                 <div className="space-y-3">
//                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Last Name</label>
//                   <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Doe" className="w-full px-8 py-5 rounded-[2rem] border border-black/5 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-[#711a20]/10 focus:bg-[#ffffff] transition-all font-bold uppercase tracking-widest text-sm" />
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="space-y-3">
//                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Phone Number</label>
//                   <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="+977 980..." className="w-full px-8 py-5 rounded-[2rem] border border-black/5 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-[#711a20]/10 focus:bg-[#ffffff] transition-all font-bold uppercase tracking-widest text-sm" />
//                 </div>
//                 <div className="space-y-3">
//                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Email Address</label>
//                   <input required type="email" placeholder="john@example.com" className="w-full px-8 py-5 rounded-[2rem] border border-black/5 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-[#711a20]/10 focus:bg-[#ffffff] transition-all font-bold uppercase tracking-widest text-sm" />
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Delivery Address</label>
//                 <input required name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="Street name, House No." className="w-full px-8 py-5 rounded-[2rem] border border-black/5 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-[#711a20]/10 focus:bg-[#ffffff] transition-all font-bold uppercase tracking-widest text-sm" />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                 <div className="space-y-3">
//                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">City</label>
//                   <input required name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="Kathmandu" className="w-full px-8 py-5 rounded-[2rem] border border-black/5 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-[#711a20]/10 focus:bg-[#ffffff] transition-all font-bold uppercase tracking-widest text-sm" />
//                 </div>
//                 <div className="space-y-3">
//                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">State / Province</label>
//                   <input required name="state" value={formData.state} onChange={handleInputChange} type="text" placeholder="Bagmati" className="w-full px-8 py-5 rounded-[2rem] border border-black/5 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-[#711a20]/10 focus:bg-[#ffffff] transition-all font-bold uppercase tracking-widest text-sm" />
//                 </div>
//                 <div className="space-y-3">
//                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">ZIP Code</label>
//                   <input required name="zip" value={formData.zip} onChange={handleInputChange} type="text" placeholder="44600" className="w-full px-8 py-5 rounded-[2rem] border border-black/5 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-[#711a20]/10 focus:bg-[#ffffff] transition-all font-bold uppercase tracking-widest text-sm" />
//                 </div>
//               </div>
//             </form>
//           </div>

//           {/* Payment Summary */}
//           <div className="lg:col-span-5">
//             <div className="bg-black text-[#ffffff] rounded-[3rem] p-10 sticky top-24 shadow-2xl overflow-hidden relative">
//               <div className="absolute top-0 right-0 w-64 h-64 bg-[#711a20] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />

//               <h2 className="text-3xl font-display font-black uppercase tracking-tighter mb-10 relative z-10">Order Summary</h2>

//               <div className="space-y-5 mb-10 relative z-10">
//                 <div className="flex justify-between text-gray-400 font-medium">
//                   <span>Subtotal</span>
//                   <span className="text-[#ffffff] font-bold">${subtotal}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-400 font-medium">
//                   <span>Shipping</span>
//                   <span className="text-[#ffffff] font-bold">{shipping === 0 ? 'FREE' : `Rs.${shipping}`}</span>
//                 </div>
//                 <div className="pt-6 border-t border-white/10 flex justify-between items-end">
//                   <div>
//                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Total Amount</p>
//                     <span className="text-4xl font-black tracking-tighter">Rs.{total}</span>
//                   </div>
//                   <span className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">USD</span>
//                 </div>
//               </div>

//               <div className="space-y-6 relative z-10">
//                 <div className="bg-[#ffffff]/5 p-6 rounded-[2rem] border border-white/10">
//                   <div className="flex items-center justify-between mb-4">
//                     <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Order Method</p>
//                     <div className="flex items-center gap-1 text-green-500">
//                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
//                       <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center">
//                       <MessageSquare className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <p className="font-bold text-sm">WhatsApp Confirmation</p>
//                       <p className="text-[10px] text-gray-500 font-medium">Direct contact with our team</p>
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   form="checkout-form"
//                   type="submit"
//                   className="group w-full bg-[#711a20] text-[#ffffff] py-6 rounded-full font-black text-xl uppercase tracking-tighter hover:bg-[#a00000] transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95"
//                 >
//                   Confirm Order <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
//                 </button>

//                 <div className="flex flex-col items-center gap-2">
//                   <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">
//                     Secure Order Processing
//                   </p>
//                   <div className="flex gap-4 opacity-30 grayscale">
//                     <div className="w-8 h-5 bg-[#ffffff] rounded-sm" />
//                     <div className="w-8 h-5 bg-[#ffffff] rounded-sm" />
//                     <div className="w-8 h-5 bg-[#ffffff] rounded-sm" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

// function ChevronRight(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="m9 18 6-6-6-6" />
//     </svg>
//   );
// }
