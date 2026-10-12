import { Iconify } from '@/components/iconify';

export default function AboutPhilosophy({ aboutData }) {
    const { counters } = aboutData || {};
    return (
        <section className="bg-black text-[#ffffff] lg:py-24 py-16 overflow-hidden relative" >
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40rem] font-black uppercase tracking-tighter leading-none select-none">
                    Hree
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-3xl">
                    <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter leading-tight mb-12">
                        We believe in the power of <span className="">Hree</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Quality First</h3>
                            <p className="text-gray-400 font-medium leading-relaxed">
                                We don&apos;t compromise. Every piece is crafted from the finest materials and printed with industry-leading technology.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Creative Freedom</h3>
                            <p className="text-gray-400 font-medium leading-relaxed">
                                Our library is just the beginning. We empower you to mix, match, and create something that truly resonates with you.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-white/10">
                    {counters?.map((counter, index) => (
                        <div key={index} className="flex flex-col items-center md:items-start space-y-4 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-300">
                            {counter.icon && (
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#711a20] to-[#9a212a] flex items-center justify-center text-white shadow-lg shadow-[#711a20]/20">
                                    <Iconify icon={counter.icon} width={28} />
                                </div>
                            )}
                            <div className="space-y-1 text-center md:text-left w-full">
                                <div className="text-5xl md:text-6xl font-display font-black  tracking-tighter">
                                    {counter.count}<span className="">{counter.symbol}</span>
                                </div>
                                <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
                                    {counter.title}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}