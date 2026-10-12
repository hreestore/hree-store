import { Markdown } from '@/components/markdown';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

//----------------------------------------------------
export default function AboutHero({ aboutData }) {
    const { resolvedTheme } = useTheme();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                {resolvedTheme === 'light' && (
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">
                            {aboutData?.subtitle}
                        </span>
                        <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.85] mb-8">
                            {aboutData?.title && (() => {
                                const words = aboutData.title.split(' ');
                                if (words.length <= 1) return aboutData.title;
                                const half = Math.ceil(words.length / 2);
                                return (
                                    <>
                                        {words.slice(0, half).join(' ')} <br />
                                        <span style={{ color: '#711a20' }}>{words.slice(half).join(' ')}</span>
                                    </>
                                );
                            })()}
                        </h1>
                        <Markdown className="text-lg font-medium leading-relaxed max-w-lg" children={aboutData?.description} />
                    </motion.div>
                )}
                {resolvedTheme === 'dark' && (

                    <motion.div
                        initial={false}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]  mb-6 block">{aboutData?.subtitle}</span>
                        <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.85] mb-8">
                            {aboutData?.title && (() => {
                                const words = aboutData.title.split(' ');
                                if (words.length <= 1) return aboutData.title;
                                const half = Math.ceil(words.length / 2);
                                return (
                                    <>
                                        {words.slice(0, half).join(' ')} <br />
                                        <span className="!text-[#f7e6dc]">{words.slice(half).join(' ')}</span>
                                    </>
                                );
                            })()}
                        </h1>
                        <Markdown className="text-lg font-medium leading-relaxed max-w-lg" children={aboutData?.description}
                        />

                    </motion.div>
                )}

                <motion.div
                    initial={false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl"
                >
                    {aboutData?.featured_image ? (
                        <Image
                            src={aboutData.featured_image}
                            alt="Our Studio"
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </motion.div>
            </div>
        </section>
    );
}