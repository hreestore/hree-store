export default function HomeBrandValues() {
    return (
        <section className="py-40 bg-black text-[#ffffff] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] font-black uppercase tracking-tighter leading-none select-none">

                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-24">
                    <h2 className="text-6xl md:text-[8rem] font-display font-black uppercase tracking-tighter leading-[0.85] mb-8">
                        Built to Last.<br /><span className="text-[#711a20]">Worn to Lead.</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-[#ffffff]/5 rounded-2xl flex items-center justify-center text-3xl">🔥</div>
                        <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Premium Fabrics</h3>
                        <p className="text-gray-400 text-lg leading-relaxed">100% organic cotton and high-density blends for maximum comfort and durability.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-[#ffffff]/5 rounded-2xl flex items-center justify-center text-3xl">🎨</div>
                        <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Vibrant Prints</h3>
                        <p className="text-gray-400 text-lg leading-relaxed">Advanced DTG printing that won&apos;t fade or crack. Your art, preserved perfectly.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-[#ffffff]/5 rounded-2xl flex items-center justify-center text-3xl">⚡</div>
                        <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Fast Shipping</h3>
                        <p className="text-gray-400 text-lg leading-relaxed">Custom made and shipped within 3-5 business days. Speed meets craftsmanship.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}