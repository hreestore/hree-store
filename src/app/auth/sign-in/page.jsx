import { getAppName } from "@/api";

import { SignInView } from "@/auth/view";

// ----------------------------------------------------------------------

export async function generateMetadata() {
  const { appName } = await getAppName();

  return {
    metadataBase: new URL("https://hree.com.np"),
    title: "Sign In",
    description: `Sign in to access your orders, wishlist, and personalized shopping experience at ${appName}.`,
    keywords: ["sign in", "login", "account", "user login", appName],
    alternates: {
      canonical: "/auth/sign-in",
    },
    openGraph: {
      title: "Sign In",
      description: `Sign in to access your orders, wishlist, and personalized shopping experience at ${appName}.`,
      url: "https://hree.com.np/auth/sign-in",
      siteName: appName,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Sign In",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Sign In",
      description: `Sign in to access your orders, wishlist, and personalized shopping experience at ${appName}.`,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
    },
  };
}

export default function Page() {
  return <SignInView />;
}
