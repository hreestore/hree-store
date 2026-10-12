'use client';

import { DESIGNS } from '@/lib/data';
import { useState } from 'react';
import DesignCard from '@/components/DesignCard';
import { motion } from 'motion/react';
import { Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { paths } from '@/routes/paths';
import { buildProductFilterQuery, getAppName, useGetCategories, useGetProducts } from '@/api';
import CatalogView from '@/sections/catalog/view/catalog-view';

// ----------------------------------------------------

// export async function generateMetadata() {
//   const { appName } = await getAppName();

//   return {
//     metadataBase: new URL("https://zenoxtech.com"),
//     title: `${appName} | About Us`,
//     description:
//       "Experience a modern and feature-rich ecommerce platform offering smooth navigation, fast performance and secure payments",
//     keywords: [
//       "ecommerce",
//       "online shopping",
//       "buy products",
//       "modern ecommerce app",
//       appName,
//     ],
//     authors: [{ name: appName }],
//     creator: appName,
//     publisher: appName,
//     formatDetection: {
//       email: false,
//       address: false,
//       telephone: false,
//     },
//     robots: {
//       index: true,
//       follow: true,
//       nocache: false,
//       googleBot: {
//         index: true,
//         follow: true,
//         "max-video-preview": -1,
//         "max-image-preview": "large",
//         "max-snippet": -1,
//       },
//     },
//     // icons: {
//     //   icon: "/api/favicon.ico",
//     // },
//     alternates: {
//       canonical: "/",
//       languages: {
//         "en-US": "/",
//       },
//     },
//     verification: {
//       google: "your-google-site-verification-code",
//       // yandex: "your-yandex-verification-code",
//       // bing: "your-bing-verification-code",
//     },
//     category: "ecommerce",
//     openGraph: {
//       title: `${appName}`,
//       description:
//         "Experience a powerful and user-friendly ecommerce platform.",
//       url: "/",
//       siteName: appName,
//       images: [
//         {
//           url: "/og-image.png",
//           width: 1200,
//           height: 630,
//           alt: "Ecommerce App Preview",
//         },
//       ],
//       locale: "en_US",
//       type: "website",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: `${appName}`,
//       description: "Shop smarter with our ecommerce solution.",
//       images: ["/og-image.png"],
//       creator: "@your-twitter-handle",
//       site: "@your-twitter-handle",
//     },
//   };
// }

// ------------------------------------------------

export default function CatalogPage() {

  return (
    <main className="py-16 lg:py-20 ">
      <CatalogView />
    </main>
  );
}
