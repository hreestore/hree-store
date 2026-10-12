"use client";

import { useTheme } from "next-themes";
import { WishlistOverview } from "../wishlist-overview";

export function WishlistView() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="max-w-7xl mx-auto lg:py-20 py-16 px-4 sm:px-6 lg:px-8 ">
      {resolvedTheme === 'light' && (
        <h1 className="text-4xl md:text-4xl font-display font-black uppercase tracking-tighter mb-4 md:mb-4">
          My <span className="text-[#711a20]">Wishlist</span>
        </h1>
      )}
      {resolvedTheme === 'dark' && (

        <h1 className="text-4xl md:text-4xl font-display font-black uppercase tracking-tighter mb-4 md:mb-4">
          My <span className="text-[#f7e6dc]">Wishlist</span>
        </h1>
      )}
      <WishlistOverview />
    </div>
  );
}
