'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { paths } from '@/routes/paths';
import { CONFIG } from '@/global-config';

export default function DesignCard({ design }) {
  const designImage = CONFIG.assetsDir + design?.featured_image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative aspect-square rounded-[3rem] overflow-hidden bg-gray-100 border border-black/5 shadow-sm"
    >
      {designImage ? (
        <Image
          src={designImage}
          alt={design.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 bg-gray-200" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
        <div className="translate-y-5 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          {/* <span className="block text-[9px] font-black uppercase tracking-[0.4em] text-[#711a20] mb-2">
            {design.category}
          </span> */}
          <h3 className="text-xl font-display font-black text-[#ffffff] uppercase tracking-tighter mb-2 leading-none drop-shadow-2xl">{design.name}</h3>
          <Link
            href={paths.customize.detail(design.product_id)}
            className="group/btn bg-[#ffffff] text-[#081a1a] px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#711a20] hover:text-[#ffffff] transition-all shadow-2xl active:scale-95"
          >
            Customize <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
