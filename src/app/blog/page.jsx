import { getAppName } from "@/api";
import { BlogView } from "@/sections/blog/view";

// ----------------------------------------------------------------------

// export async function generateMetadata() {
//   const { appName } = await getAppName();

//   return {
//     metadataBase: new URL("https://premierhealth.com.np"),
//     title: `${appName} | Blogs`,
//     description:
//       "Read our latest articles, tips, and insights. Stay updated with news, product guides, and expert advice.",
//     keywords: [
//       "blog",
//       "articles",
//       "news",
//       "tips",
//       "guides",
//       "insights",
//       appName,
//     ],
//     alternates: {
//       canonical: "/blog",
//     },
//     openGraph: {
//       title: "Blog",
//       description:
//         "Read our latest articles, tips, and insights. Stay updated with news, product guides, and expert advice.",
//       url: "https://premierhealth.com.np/blog",
//       siteName: appName,
//       type: "website",
//       locale: "en_US",
//       images: [
//         {
//           url: "/og-image.png",
//           width: 1200,
//           height: 630,
//           alt: "Blog",
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: "Blog",
//       description:
//         "Read our latest articles, tips, and insights. Stay updated with news, product guides, and expert advice.",
//       images: ["/og-image.png"],
//     },
//     robots: {
//       index: true,
//       follow: true,
//     },
//   };
// }

// ----------------------------------------------------------------------

export default function Page() {
  return <BlogView />;
}
