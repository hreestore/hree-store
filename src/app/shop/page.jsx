'use client';

import { Suspense } from 'react';
import ShopListingView from '@/sections/shop/shop-listing-view';

// ----------------------------------------------------------------------------------------------------

function ShopPageContent() {
    return <ShopListingView />;
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-[#711a20] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ShopPageContent />
        </Suspense>
    );
}
