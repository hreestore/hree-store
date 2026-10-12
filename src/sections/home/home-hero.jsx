'use client';

import { DESIGNS, PRODUCT_TYPES } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import DesignCard from '@/components/DesignCard';
import { ArrowRight } from 'lucide-react';
import { paths } from '@/routes/paths';
import HomeView from '@/sections/home/view/home-view';
import { useGetHomeSliders } from '@/api';
import { Markdown } from '@/components/markdown';
import { Logo } from '@/components/logo';
import { useTheme } from 'next-themes';

// ------------------------------------------------------

export default function HomeHero() {
    const { sliders } = useGetHomeSliders();
    const { title, description, featured_image } = sliders[0] || {};
    const { resolvedTheme } = useTheme();

    return (
        <section className=" h-[100vh] flex items-center justify-center   ">
            <div className="absolute inset-0 opacity-100">
                {resolvedTheme === 'light' && (

                    <img
                        src={featured_image}
                        alt={title}
                        title={title}
                        className="object-cover  w-full h-full"
                    />
                )}
                {resolvedTheme === 'dark' && (

                    <img
                        src="/img/hero/Banner2.png"
                        alt={title}
                        title={title}
                        className="object-cover  w-full h-full"
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5" />
            </div>
            <div className="relative z-10 text-center px-4 max-w-5xl">
                <motion.div
                    initial={false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                >
                    {/* <div className='flex justify-center pb-5'>
                        <Logo className="lg:scale-[5] scale-[3] my-10" />
                    </div> */}
                    {/* <h1 className="text-7xl md:text-[10rem] font-display font-black text-[#ffffff] tracking-tighter uppercase leading-[0.85] mb-8">
                        {title ? (
                            <>
                                {title.split(' ')[0]}{' '}
                                <span className="text-[#711a20]">{title.split(' ').slice(1).join(' ')}</span>
                            </>
                        ) : (
                            <>HREE<span className="text-[#711a20]">CREATE</span></>
                        )}
                    </h1> */}
                    {/* <Markdown className="mt-6 text-xl md:text-3xl text-gray-200 font-medium max-w-3xl mx-auto tracking-tight" children={description} /> */}
                    {/* Premium Streetwear. Your Canvas. <span className="text-[#711a20]">Our Soul.</span> */}
                    <div className="lg:mt-12 mt-2 flex flex-col sm:flex-row items-center justify-center gap-6">
                        {/* <Link
                            href={paths.customize.root}
                            className="group relative bg-[#711a20] text-[#ffffff] px-12 py-6 rounded-full text-xl font-black uppercase tracking-tighter hover:bg-[#710000] transition-all shadow-[0_0_40px_rgba(139,0,0,0.3)] overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Customize Now <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link> */}
                        {resolvedTheme === 'dark' && (

                            <Link
                                href={paths.catalog}
                                className="bg-[#ffffff]/10 backdrop-blur-md text-[#ffffff] border border-white/20 px-12 py-6 rounded-full text-xl font-black uppercase tracking-tighter hover:bg-[#ffffff] hover:text-[#081a1a] transition-all"
                            >
                                Browse Catalog
                            </Link>

                        )}
                        {resolvedTheme === 'light' && (

                            <Link
                                href={paths.catalog}
                                className="bg-[#0a1a1a]/20 text-[#0a1a1a] border border-white/20 px-12 py-6 rounded-full text-xl font-black uppercase tracking-tighter hover:bg-[#710000] hover:text-[#f6e5dc] transition-all"
                            >
                                Browse Catalog
                            </Link>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            {/* <motion.div
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffffff]/40">Scroll</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
            </motion.div> */}
        </section>
    );

}