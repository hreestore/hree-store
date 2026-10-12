import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { paths } from '@/routes/paths';

export default function AboutCTA() {
    return (
        <section className="py-40" >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none mb-12">
                    Ready to <span className="text-[#711a20]">Create?</span>
                </h2>
                <Link
                    href={paths.customize.root}
                    className="group inline-flex items-center gap-4 bg-black text-[#ffffff] px-16 py-8 rounded-full font-black text-2xl uppercase tracking-tighter hover:bg-[#711a20] transition-all shadow-2xl hover:scale-105 active:scale-95"
                >
                    Enter the Studio <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </Link>
            </div>
        </section>
    )
}