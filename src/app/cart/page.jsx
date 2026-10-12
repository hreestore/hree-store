import { getAppName } from "@/api";

import { CartView } from "@/sections/cart/view";

// ----------------------------------------------------------------------

// export async function generateMetadata() {
//   const { appName } = await getAppName();

//   return {
//     metadataBase: new URL("https://zenoxtech.com"),
//     title: `${appName} | Shopping Cart`,
//     description:
//       "Review your shopping cart items, update quantities, and proceed to checkout. Manage your selected products before completing your purchase.",
//     keywords: [
//       "shopping cart",
//       "cart",
//       "checkout",
//       "online shopping",
//       "review order",
//       appName,
//     ],
//     alternates: {
//       canonical: "/cart",
//     },
//     openGraph: {
//       title: `${appName} | Shopping Cart`,
//       description: "Review your shopping cart items and proceed to checkout.",
//       url: "https://zenoxtech.com/cart",
//       siteName: appName,
//       type: "website",
//       locale: "en_US",
//       images: [
//         {
//           url: "/og-image.png",
//           width: 1200,
//           height: 630,
//           alt: "Shopping Cart",
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: `${appName} | Shopping Cart`,
//       description: "Review your shopping cart items and proceed to checkout.",
//       images: ["/og-image.png"],
//     },
//     robots: {
//       index: true,
//       follow: true,
//       nocache: true,
//     },
//   };
// }

// ----------------------------------------------------------------------

export default function Page() {
  return <CartView />;
}
