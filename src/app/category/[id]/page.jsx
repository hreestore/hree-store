'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { paths } from '@/routes/paths';
import { buildProductFilterQuery, useGetProducts } from '@/api';
import CatalogDetailView from '@/sections/catalog/view/catalog-detail-view';

// ----------------------------------------------------------------------------------------------------

export default function CategoryProductsPage({ params }) {
    const { id } = use(params);

    const productQuery = buildProductFilterQuery({ category_id: id });
    const { products, isLoading } = useGetProducts(productQuery);

    return (
        <main className="lg:pb-10 pb-10  lg:pt-10 pt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-2 flex flex-col md:flex-row md:items-end justify-between gap-10 ">
                    <div>
                        <Link href={paths.home} className="inline-flex items-center gap-2 text-gray-500 hover:text-[#711a20] transition-colors mb-0 font-bold uppercase tracking-widest text-xs">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                        {/* Removed Category Products text to match the Customizer aesthetic */}
                    </div>
                </div>

                <CatalogDetailView id={id} />
            </div>
        </main>
    );
}
