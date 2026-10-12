'use client';

// import { DESIGNS } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { paths } from '@/routes/paths';
import { useStore } from '@/lib/store';
import { useGetCategories } from '@/api';
import { fNumber } from '@/utils';
import { useTheme } from 'next-themes';

export default function HomeCategories() {
    const router = useRouter();
    const { setSelectedProduct, setStep } = useStore();
    const { categories } = useGetCategories();
    const { resolvedTheme } = useTheme();

    return (

        <section id="categories" className="lg:py-24 py-16" >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter  cursor-pointer">The {" "}
                            {resolvedTheme === 'light' && (

                                <span className='text-[#711a20]'>Essentials</span>
                            )}
                            {resolvedTheme === 'dark' && (

                                <span className='text-[#f7e6dc]'>Essentials</span>
                            )}
                        </h2>

                        <p className="text-gray-500 mt-4 text-lg ">Explore the variety of categories at Hree Store and discover everything you need, all in one place.</p>
                    </div>
                    {/* <div className="h-[1px] flex-1 bg-gray-100 mx-8 hidden md:block" /> */}
                </div>
                <div className="grid grid-cols-2 gap-4 lg:gap-8 lg:grid-cols-4">
                    {categories?.filter(type => type.show_in_home === true).map((type) => (
                        <button
                            key={type.category_id}
                            onClick={() => {
                                setSelectedProduct(type);
                                setStep(2);
                                router.push('/customize');
                            }}
                            className={`group relative h-48 lg:h-100 rounded-2xl lg:rounded-[3rem] overflow-hidden border-2 lg:border-4 transition-all duration-500 border-transparent hover:border-[#081a1a]/10 cursor-pointer`}
                        >
                            <Image
                                fill
                                src={type.web_image || ""}
                                alt={type.name}
                                title={type.name}
                                className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-90"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-4 lg:p-10 text-left">
                                <h3 className="text-xl lg:text-2xl font-display font-black text-[#ffffff] uppercase tracking-tighter">{type.name}</h3>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    )
}