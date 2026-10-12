import { getAppName } from "@/api";
import AboutView from "@/sections/about/view/about-view";

//----------------------------------------------------
export async function generateMetadata() {
  const { appName } = await getAppName();

  return {
    metadataBase: new URL("https://hree.com.np"),
    title: `About Us | ${appName}`,
    description:
      "Learn more about Hree Store — our story, mission, and passion for creating unique apparel and lifestyle products that reflect your style.",
    keywords: [
      "about hree store",
      "hree store story",
      "fashion brand nepal",
      "custom apparel nepal",
      "hree brand",
      appName,
    ],
    authors: [{ name: appName }],
    creator: appName,
    publisher: appName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: "/about",
      languages: {
        "en-US": "/about",
      },
    },
    verification: {
      google: "your-google-site-verification-code",
    },
    category: "ecommerce",
    openGraph: {
      title: `About ${appName}`,
      description:
        "Discover the vision behind Hree Store and what makes our designs unique.",
      url: "/about",
      siteName: appName,
      images: [
        {
          url: "/og-about.png", // optional: about-specific image
          width: 1200,
          height: 630,
          alt: "About Hree Store",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `About ${appName}`,
      description:
        "Get to know Hree Store — our mission, values, and creative journey.",
      images: ["/og-about.png"],
      creator: "@your-twitter-handle",
      site: "@your-twitter-handle",
    },
  };
}
// ------------------------------------------------
export default function AboutPage() {
  return (
    <main className="lg:py-24 py-16">
      <AboutView />
    </main>
  );
}
