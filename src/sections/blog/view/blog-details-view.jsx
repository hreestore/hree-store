"use client";

import { motion } from "motion/react";
import { RouterLink } from "@/routes/components";
import { paths } from "@/routes/paths";
import { fDate } from "@/utils/format-time";
import { Markdown } from "@/components/markdown";
import { CustomBreadcrumbs } from "@/components/custom-breadcrumbs";
import { EmptyContent } from "@/components/empty-content";
import { Iconify } from "@/components/iconify";
import { BlogDetailsSkeleton } from "../blog-skeleton";
import { useGetBlogDetail, useGetBlogs } from "@/api";

// ----------------------------------------------------------------------

function RecentBlogCard({ blog, index }) {
  const { title, featured_image, created_at, slug } = blog;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <RouterLink
        href={paths.blog.details(slug)}
        className="group flex gap-3 no-underline"
      >
        <div className="w-[72px] h-[72px] shrink-0 rounded-2xl overflow-hidden">
          <img
            src={featured_image}
            alt={title}
            title={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
          <p className="text-[13px] font-medium  leading-[1.4] line-clamp-2 group-hover:text-[#711a20] transition-colors duration-200">
            {title}
          </p>
          <div className="flex items-center gap-1">
            <Iconify icon="solar:calendar-linear" width={12} className="text-gray-400 shrink-0" />
            <span className="text-[11px] text-gray-400">{fDate(created_at)}</span>
          </div>
        </div>
      </RouterLink>
    </motion.div>
  );
}

function ShareButtons({ title }) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareLinks = [
    {
      name: "Facebook",
      icon: "mdi:facebook",
      color: "#1877F2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter",
      icon: "mdi:twitter",
      color: "#1DA1F2",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: "LinkedIn",
      icon: "mdi:linkedin",
      color: "#0A66C2",
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
    },
    {
      name: "WhatsApp",
      icon: "mdi:whatsapp",
      color: "#25D366",
      url: `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-widest font-medium text-gray-400 mr-1">Share</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200 hover:border-transparent hover:scale-110"
          style={{ color: link.color }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = link.color;
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = link.color;
          }}
        >
          <Iconify icon={link.icon} width={16} />
        </a>
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex gap-3">
          <div className="w-[72px] h-[72px] rounded-2xl bg-gray-100 animate-pulse shrink-0" />
          <div className="flex flex-col gap-2 flex-1 justify-center">
            <div className="h-3 w-full rounded-full bg-gray-100 animate-pulse" />
            <div className="h-3 w-3/5 rounded-full bg-gray-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlogDetailsView({ slug }) {
  const { blog, isLoading, error } = useGetBlogDetail(slug);
  const { blogs: allBlogs, isLoading: blogsLoading } = useGetBlogs();

  const { title, description, featured_image, created_by, created_at } = blog || {};

  const recentBlogs = allBlogs.filter((b) => b.slug !== slug).slice(0, 5);
  const isBlogFound = !isLoading && !error && title;
  const isBlogMissing = !isLoading && (error || !title);

  function stripHtml(html) {
    if (!html) return '';
    let cleaned = html
      .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, '');

    if (typeof window !== 'undefined') {
      const doc = new DOMParser().parseFromString(cleaned, 'text/html');
      cleaned = doc.body.textContent || '';
    } else {
      cleaned = cleaned
        .replace(/&nbsp;/gi, ' ')
        .replace(/&quot;/gi, '"')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#39;/gi, "'")
        .replace(/&apos;/gi, "'");
    }

    return cleaned.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
  }

  const authorInitials = created_by
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "A";

  const renderLoading = () => <BlogDetailsSkeleton />;

  const renderError = () => (
    <EmptyContent
      title="Blog Not Found"
      description="Oops! The blog you're looking for isn't available."
      action={
        <RouterLink
          href={paths.blog.root}
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-[#081a1a] hover:bg-[#711a20] transition-colors duration-300"
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={16} />
          Back to Blog
        </RouterLink>
      }
    />
  );

  const renderBlog = () => (
    <article className="min-h-screen lg:py-10 py-10">

      {/* ── HERO ── */}
      <div className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <img
          src={featured_image}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081a1a] via-[#081a1a]/60 to-transparent" />

        {/* decorative crimson bar bottom-left */}
        <div className="absolute bottom-0 left-0 w-1.5 h-full bg-[#711a20]" />

        {/* hero content */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pb-10 z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-[1.0] text-white mb-6">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {/* Author avatar */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#711a20] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {authorInitials}
                </div>
                <span className="text-white text-sm font-medium">{created_by || "Admin"}</span>
              </div>

              <span className="text-white/30 hidden sm:block">·</span>

              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <Iconify icon="solar:calendar-bold" width={15} />
                <span>{fDate(created_at)}</span>
              </div>

              <span className="text-white/30 hidden sm:block">·</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── BREADCRUMBS ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <CustomBreadcrumbs
          links={[
            { name: "Home", href: paths.home },
            { name: "Blog", href: paths.blog.root },
            { name: title },
          ]}
          className="py-5"
        />
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 xl:gap-12">

          {/* ── ARTICLE BODY ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* content card */}
            <div className="rounded-[2rem] p-6 sm:p-10 lg:p-14">
              {/* decorative top accent */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-0.5 w-10 bg-[#711a20] rounded-full" />
                <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#711a20] dark:text-[#ffffff]">
                  Article
                </span>
              </div>

              {/* Markdown content */}
              <div
                className="
                  prose prose-lg max-w-none
                  prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-[#081a1a]
                  prose-h2:text-3xl prose-h3:text-2xl
                  prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-[1.05rem]
                  prose-a:text-[#711a20] prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-[#711a20] prose-blockquote:border-l-4 prose-blockquote:bg-[#081a1a]/5 prose-blockquote:rounded-r-2xl prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic
                  prose-img:rounded-3xl prose-img:shadow-sm
                  prose-strong:text-[#081a1a] prose-strong:font-semibold
                  prose-code:text-[#711a20] prose-code:bg-[#711a20]/8 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-[#081a1a] prose-pre:rounded-2xl
                  prose-ul:text-gray-600 prose-ol:text-gray-600
                "
              >
                {description && (
                  <p className="text-sm text-gray-900 leading-relaxed flex-1 mb-5 overflow-hidden transition-colors duration-300">
                    {stripHtml(description)}
                  </p>
                )}
              </div>
            </div>

            {/* share + back row */}
            <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
              <RouterLink
                href={paths.blog.root}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#711a20] transition-colors duration-200 group"
              >
                <span className="w-8 h-8 rounded-full  flex items-center justify-center group-hover:bg-[#711a20] group-hover:text-white transition-all duration-200">
                  <Iconify icon="solar:arrow-left-linear" width={16} />
                </span>
                Back to all articles
              </RouterLink>

              {/* <ShareButtons title={title} /> */}
            </div>
          </motion.div>

          {/* ── SIDEBAR ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-5"
          >
            {/* Recent posts card */}
            <div className=" rounded-[2rem] p-6 dark:border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-0.5 w-8 bg-[#711a20] rounded-full" />
                <h3 className="text-sm font-black uppercase tracking-widest ">
                  Recent Posts
                </h3>
              </div>

              {blogsLoading ? (
                <SidebarSkeleton />
              ) : recentBlogs.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {recentBlogs.map((recentBlog, i) => (
                    <div key={recentBlog.id}>
                      <RecentBlogCard blog={recentBlog} index={i} />
                      {i < recentBlogs.length - 1 && (
                        <div className="mt-5 border-t border-gray-200" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No other posts available
                </p>
              )}

              {recentBlogs.length > 0 && (
                <RouterLink
                  href={paths.blog.root}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-[#081a1a]/15 text-[13px] font-medium hover:bg-[#081a1a] hover:text-white transition-all duration-300 no-underline"
                >
                  View All Posts
                  <Iconify icon="solar:arrow-right-linear" width={16} />
                </RouterLink>
              )}
            </div>

            {/* Newsletter card */}
            <div className="bg-[#081a1a] dark:border-2 border-gray-200 rounded-[2rem] p-6 text-center overflow-hidden relative">
              {/* decorative circle */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#711a20]/20" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[#711a20]/10" />

              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#711a20] flex items-center justify-center">
                  <Iconify icon="solar:letter-bold" width={24} className="text-white" />
                </div>

                <h3 className="font-display font-black uppercase tracking-tight text-xl text-white leading-tight">
                  Stay<br />Updated
                </h3>

                <p className="text-[13px] text-white/55 leading-relaxed">
                  Subscribe for the latest articles and fashion updates.
                </p>

                <button className="mt-1 w-full py-3 px-4 rounded-2xl bg-[#711a20] text-white font-semibold text-sm hover:bg-[#8f2028] transition-colors duration-200">
                  Subscribe Now
                </button>
              </div>
            </div>

            {/* Author card */}
            <div className=" rounded-[2rem] p-6 dark:border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shrink-0">
                  {authorInitials}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest font-medium  mb-0.5">Written by</p>
                  <p className="font-display font-black uppercase text-lg leading-tight tracking-tight">
                    {created_by || "Admin"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div >
    </article >
  );

  return (
    <>
      {isLoading && renderLoading()}
      {isBlogFound && renderBlog()}
      {isBlogMissing && renderError()}
    </>
  );
}