import { BlogDetailsView } from "@/sections/blog/view";

import { getBlogDetails, getAppName } from "@/api";

// ----------------------------------------------------------------------

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [blog, { appName }] = await Promise.all([
    getBlogDetails(slug),
    getAppName(),
  ]);

  const rawTitle = blog?.title || "Blog Post";
  // Limit title to 59 characters for optimal SEO
  const blogTitle =
    rawTitle.length > 59 ? rawTitle.substring(0, 56) + "..." : rawTitle;

  const rawDescription =
    blog?.description ||
    blog?.content ||
    "Explore our newest blog post and discover fresh insights, helpful tips, and the latest updates curated just for you..";

  // Strip HTML tags and limit to 155 characters for optimal SEO
  const blogDescription = rawDescription
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
    .substring(0, 155)
    .concat(rawDescription.length > 155 ? "..." : "");

  const blogImage =
    blog?.image || blog?.featured_image
      ? `${blog.image || blog.featured_image}`
      : "/og-image.png";

  return {
    metadataBase: new URL("https://premierhealth.com.np"),
    title: blogTitle,
    description: blogDescription,
    keywords: [blogTitle, "blog", "article", appName],
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: blogTitle,
      description: blogDescription,
      url: `https://premierhealth.com.np/blog/${slug}`,
      siteName: appName,
      type: "article",
      locale: "en_US",
      images: [
        {
          url: blogImage,
          width: 1200,
          height: 630,
          alt: blogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blogTitle,
      description: blogDescription,
      images: [blogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ----------------------------------------------------------------------

export default async function Page({ params }) {
  const { slug } = await params;
  const [blog, { appName }] = await Promise.all([
    getBlogDetails(slug),
    getAppName(),
  ]);

  // Generate JSON-LD structured data for blog article
  const jsonLd = blog
    ? {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.description
        ?.replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim(),
      image:
        blog.image || blog.featured_image
          ? `${blog.image || blog.featured_image}`
          : undefined,
      datePublished: blog.created_at || blog.published_at,
      dateModified: blog.updated_at || blog.created_at,
      author: {
        "@type": blog.author?.name ? "Person" : "Organization",
        name: blog.author?.name || appName,
      },
      publisher: {
        "@type": "Organization",
        name: appName,
        logo: {
          "@type": "ImageObject",
          url: "https://premierhealth.com.np/logo/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://premierhealth.com.np/blog/${slug}`,
      },
    }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogDetailsView slug={slug} />
    </>
  );
}
