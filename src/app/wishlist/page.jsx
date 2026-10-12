import { getAppName } from "@/api";

import { WishlistView } from "@/sections/wishlist/view";

// ----------------------------------------------------------------------

export async function generateMetadata() {
  const { appName } = await getAppName();

  return {
    metadataBase: new URL("https://hree.com.np"),
    title: "Wishlist",
    description:
      "View and manage your saved items. Keep track of products you love and purchase them later.",
    keywords: ["wishlist", "saved items", "favorites", appName],
    alternates: {
      canonical: "/wishlist",
    },
    openGraph: {
      title: "Wishlist",
      description: "View and manage your saved items.",
      url: "https://hree.com.np/wishlist",
      siteName: appName,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: "Wishlist",
      description: "View and manage your saved items.",
    },
    robots: {
      index: false,
      follow: true,
      nocache: true,
    },
  };
}

export default async function Page() {
  return <WishlistView />;
}
