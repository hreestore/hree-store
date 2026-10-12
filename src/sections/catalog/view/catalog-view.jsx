'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import CatalogCard from '@/components/catalog-card';
import { useGetDesignCombination } from '@/api/design';
import { CONFIG } from '@/global-config';

// ----------------------------------------------------------------------------------------

export default function CatalogView() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { designCombination, designsLoading, designsError } = useGetDesignCombination();
  const combinationList = Array.isArray(designCombination?.data)
    ? designCombination?.data
    : [];
  const formattedCombinations = combinationList.map((combination) => {
    const primaryItem = combination.items?.find(item => item.is_primary) || combination.items?.[0];
    return {
      category_id: combination.id,
      name: combination.name || 'Design Name',
      code: combination.code || 'Design Code',
      web_image: primaryItem?.design?.featured_image ? CONFIG.assetsDir + primaryItem.design.featured_image : null,
    };
  }).filter(c => c.web_image);

  const displayItems = formattedCombinations.sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="lg:mb-4 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none mb-2">Design <span className="text-[#711a20]"> Catalogs</span></h1>
          <p className=" text-lg max-w-2xl font-medium">Explore our curated collection of premium products or create your own design from scratch.</p>
        </div>
      </div>


      {/* Grid */}
      {designsLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-[#711a20] animate-spin" />
        </div>
      ) : displayItems?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7
         gap-3">
          {displayItems?.map((design, idx) => (
            <motion.div
              key={`${design.category_id}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
            >
              <CatalogCard design={design} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-xl text-gray-400">No designs found matching your criteria.</p>
        </div>
      )}

    </div>
  )
}
