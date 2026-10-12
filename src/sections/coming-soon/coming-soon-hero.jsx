'use client';

import { motion } from 'motion/react';
import { ArrowRight, Mail, Instagram, Facebook, Twitter, Sparkles, Palette, Zap, LocationEditIcon, LocateIcon, LocateOffIcon, MapIcon } from 'lucide-react';
import Link from 'next/link';
import { paths } from '@/routes/paths';
import { useState } from 'react';

const tshirts = [{
    id: 1,
    image: "/img/tshirts/1.jpeg",
    link: "https://www.instagram.com/p/C5gENo6yism/?img_index=3",
},
{
    id: 2,
    image: "/img/tshirts/2.jpeg",
    link: "https://www.instagram.com/p/DJ14PUyBYDd/",
},
{
    id: 3,
    image: "/img/tshirts/2.jpeg",
    link: "https://www.instagram.com/p/DCKUjgXNNP9/?img_index=5",
},
{
    id: 4,
    image: "/img/tshirts/2.jpeg",
    link: "https://www.instagram.com/p/DMf3qhKN1Ed/?img_index=1",
}
];

export default function ComingSoonHero() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Add email subscription logic
        setIsSubmitted(true);
        setTimeout(() => {
            setEmail('');
            setIsSubmitted(false);
        }, 3000);
    };

    const features = [
        {
            icon: Sparkles,
            title: 'Exclusive Designs',
            description: 'Limited edition graphics crafted by top artists'
        },
        {
            icon: Palette,
            title: 'Custom Studio',
            description: 'Powerful tools to bring your vision to life'
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Order today, wear it tomorrow'
        }
    ];

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black py-12 sm:py-16 md:py-20 mt-0">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(to right, #711a20 1px, transparent 1px),
                        linear-gradient(to bottom, #711a20 1px, transparent 1px)
                    `,
                    backgroundSize: '100px 100px'
                }} />
            </div>

            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black" />

            {/* Main Content */}
            <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="mb-8 sm:mb-10"
                    >
                        <img
                            src="/img/logo/dark/Brand Kit-05.png"
                            alt="HREE Logo"
                            className="h-20 sm:h-30 md:h-50 mx-auto"
                        />
                    </motion.div>

                    {/* Coming Soon Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="inline-block mb-6 sm:mb-8"
                    >
                        <div className="px-6 sm:px-8 py-2 sm:py-3 bg-[#711a20]/20 border border-[#711a20] rounded-full">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-[#ffffff]">
                                Coming Soon
                            </span>
                        </div>
                    </motion.div>

                    {/* Main Heading */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[12rem] font-display font-black text-[#ffffff] tracking-tighter uppercase leading-[0.85] mb-6 sm:mb-8 md:mb-10">
                        HREE<span className="text-[#711a20]">CREATE</span>
                    </h1>

                    {/* Subheading */}
                    {/* <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-2xl md:text-4xl text-gray-300 font-medium leading-relaxed mb-8"
                    >
                        Something <span className="text-[#711a20] font-black">Extraordinary</span> is in the Works
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-16"
                    >
                        We're crafting the ultimate custom apparel experience. Premium designs, bold statements, infinite possibilities.
                    </motion.p> */}

                    {/* Email Signup Form */}
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="max-w-xl mx-auto mb-20"
                    >
                        <form onSubmit={handleSubmit} className="relative">
                            <div className="relative flex items-center">
                                <Mail className="absolute left-8 text-gray-400 w-6 h-6" />
                                <input
                                    type="email"
                                    placeholder="Enter your email for early access"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-20 pr-56 py-6 bg-[#ffffff]/5 border-2 border-white/10 rounded-full text-[#ffffff] placeholder:text-gray-500 focus:outline-none focus:border-[#711a20] focus:bg-[#ffffff]/10 transition-all text-base font-bold uppercase tracking-widest"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 bg-[#711a20] text-[#ffffff] px-10 py-4 rounded-full font-black text-sm uppercase tracking-tighter hover:bg-[#a00000] transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    Notify Me <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>

                        {isSubmitted && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 text-[#711a20] font-bold text-sm uppercase tracking-widest"
                            >
                                Thanks! You'll be the first to know.
                            </motion.p>
                        )}
                    </motion.div> */}

                    {/* Feature Teasers */}
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto"
                    >
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 + idx * 0.1, duration: 0.6 }}
                                className="p-8 bg-[#ffffff]/5 border border-white/10 rounded-3xl hover:border-[#711a20] hover:bg-[#ffffff]/10 transition-all group"
                            >
                                <feature.icon className="w-10 h-10 text-[#711a20] mb-6 mx-auto group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-black uppercase tracking-tighter text-[#ffffff] mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div> */}

                    {/* Product Showcase */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="mb-16 sm:mb-20 max-w-6xl mx-auto px-0 w-full"
                    >
                        <div className="mb-8 sm:mb-12">
                            {/* <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-4">
                                Coming Products
                            </p> */}
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#ffffff] tracking-tighter">
                                Recreating Your Imagination

                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                            {tshirts.map((tshirt) => (
                                <motion.div
                                    key={tshirt.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.5 + tshirt.id * 0.1, duration: 0.6 }}
                                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-[#ffffff]/5 hover:border-[#711a20] transition-all duration-500"
                                >
                                    {/* Image Container */}
                                    <a href={tshirt.link} className="block w-full h-full" target='_blank'>
                                        <div className="relative h-48 sm:h-60 md:h-72 lg:h-80 overflow-hidden bg-gradient-to-b from-white/5 to-black/20">

                                            <img
                                                src={`/img/tshirts/${tshirt.id}.jpeg`}
                                                alt={`Product ${tshirt.id}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />

                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            {/* Hover Badge */}
                                            {/* <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            whileHover={{ opacity: 1, y: 0 }}
                                            className="absolute bottom-4 left-4 right-4 bg-[#711a20] text-[#ffffff] px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider text-center"
                                            >
                                            Coming Soon
                                            </motion.div> */}
                                        </div>

                                    </a>
                                    {/* Border Accent */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl sm:rounded-2xl border-2 border-[#711a20]/50" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Contact Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.3, duration: 0.8 }}
                        className="mb-12 sm:mb-16 max-w-3xl mx-auto w-full px-0"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6 sm:mb-8">
                            Get In Touch
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 justify-center">
                            {/* Main Contact */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="p-4 sm:p-6 bg-[#ffffff]/5 border border-white/10 rounded-xl sm:rounded-2xl hover:border-[#ffd9d9] hover:bg-[#ffffff]/10 transition-all group text-center"
                            >
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-bold">
                                    Main Contact
                                </p>
                                <a
                                    href="tel:+9779856015343"
                                    className="text-xl sm:text-2xl font-black text-[#ffffff] hover:text-[#ffd9d9] transition-colors group-hover:scale-110 transition-transform inline-block"
                                >
                                    9856015343
                                </a>
                                <p className="text-gray-400 text-xs mt-2 sm:mt-3 font-medium">
                                    Call • WhatsApp • Viber • Online Orders
                                </p>
                            </motion.div>

                            {/* Kathmandu */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="p-4 sm:p-6 bg-[#ffffff]/5 border border-white/10 rounded-xl sm:rounded-2xl hover:border-[#ffd9d9] hover:bg-[#ffffff]/10 transition-all group text-center"
                            >
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-bold">
                                    Kathmandu
                                </p>
                                <a
                                    href="tel:+9779705015343"
                                    className="text-xl sm:text-2xl font-black text-[#ffffff] hover:text-[#ffd9d9] transition-colors group-hover:scale-110 transition-transform inline-block"
                                >
                                    9705015343
                                </a>
                                <p className="text-gray-400 text-xs mt-2 sm:mt-3 font-medium">
                                    Local Support
                                </p>
                            </motion.div>

                            {/* Pokhara */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="p-4 sm:p-6 bg-[#ffffff]/5 border border-white/10 rounded-xl sm:rounded-2xl hover:border-[#ffd9d9] hover:bg-[#ffffff]/10 transition-all group text-center"
                            >
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-bold">
                                    Pokhara
                                </p>
                                <a
                                    href="tel:+9779856022343"
                                    className="text-xl sm:text-2xl font-black text-[#ffffff] hover:text-[#ffd9d9] transition-colors group-hover:scale-110 transition-transform inline-block"
                                >
                                    9856022343
                                </a>
                                <p className="text-gray-400 text-xs mt-2 sm:mt-3 font-medium">
                                    Local Support
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2, duration: 0.8 }}
                        className="mb-12 sm:mb-16"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-4 sm:mb-6">
                            Follow Our Journey
                        </p>
                        <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 flex-wrap">
                            <Link
                                href={paths.social.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ffffff]/5 border border-white/10 rounded-lg sm:rounded-2xl flex items-center justify-center hover:bg-[#711a20] hover:border-[#711a20] transition-all cursor-pointer group hover:scale-110"
                            >
                                <Instagram className="w-4 sm:w-5 h-4 sm:h-5 text-[#ffffff] group-hover:scale-110 transition-transform" />
                            </Link>
                            <Link
                                href={paths.social.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ffffff]/5 border border-white/10 rounded-lg sm:rounded-2xl flex items-center justify-center hover:bg-[#711a20] hover:border-[#711a20] transition-all cursor-pointer group hover:scale-110"
                            >
                                <Facebook className="w-4 sm:w-5 h-4 sm:h-5 text-[#ffffff] group-hover:scale-110 transition-transform" />
                            </Link>
                            <Link
                                href={paths.social.location}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ffffff]/5 border border-white/10 rounded-lg sm:rounded-2xl flex flex-col items-center justify-center hover:bg-[#711a20] hover:border-[#711a20] transition-all cursor-pointer group hover:scale-110"
                                title="Kathmandu Location"
                            >
                                <LocateIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#ffffff] group-hover:scale-110 transition-transform mb-1" />
                                <span className="text-[8px] font-bold text-[#ffffff] uppercase">KTM</span>
                            </Link>
                            <Link
                                href={paths.social.location2}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ffffff]/5 border border-white/10 rounded-lg sm:rounded-2xl flex flex-col items-center justify-center hover:bg-[#711a20] hover:border-[#711a20] transition-all cursor-pointer group hover:scale-110"
                                title="Pokhara Location"
                            >
                                <MapIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#ffffff] group-hover:scale-110 transition-transform mb-1" />
                                <span className="text-[8px] font-bold text-[#ffffff] uppercase">PKR</span>
                            </Link>
                            {/* <Link
                                href={paths.social.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-14 h-14 bg-[#ffffff]/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-[#711a20] hover:border-[#711a20] transition-all cursor-pointer group hover:scale-110"
                            >
                                <Twitter className="w-5 h-5 text-[#ffffff] group-hover:scale-110 transition-transform" />
                            </Link> */}
                        </div>
                    </motion.div>


                    {/* CTA to Main Site */}
                    {/* <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.2, duration: 0.8 }}
                    >
                        <Link
                            href={paths.home}
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ffffff] transition-colors text-sm font-bold uppercase tracking-widest group"
                        >
                            <span className="w-8 h-[1px] bg-gray-600 group-hover:bg-[#ffffff] transition-colors" />
                            Visit Main Site
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div> */}
                </motion.div>
            </div>

            {/* Floating Elements */}
            {/* <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-20 left-10 w-32 h-32 border-2 border-[#711a20]/20 rounded-3xl"
            />
            <motion.div
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -5, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-20 right-10 w-40 h-40 border-2 border-white/10 rounded-full"
            /> */}
        </main>
    );
}
