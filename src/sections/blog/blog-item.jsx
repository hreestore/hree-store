import { useAppSelector } from "@/redux/hooks";
import { RouterLink } from "@/routes/components";
import { fDate } from "@/utils/format-time";
import { Iconify } from "@/components/iconify";
import { motion } from "motion/react";
import Image from "next/image";

// ----------------------------------------------------------------------

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

export function BlogItem({ blog, detailsHref, index = 0 }) {
  const { title, featured_image, created_at, description } = blog || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group dark:border-2 border-gray-200 rounded-[2rem] overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-500 hover:shadow-2xl"
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden h-52 flex-shrink-0">
        <Image
          alt={title}
          title={title}
          src={featured_image}
          width={600}
          height={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081a1a]/80 via-[#081a1a]/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-400" />

        {/* Category badge */}
        {/* {category && (
          <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.12em] font-medium text-white bg-[#711a20] px-3 py-1 rounded-full shadow-md">
            {category.name || category}
          </span>
        )} */}

        {/* Date overlay on image bottom */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white/70">
          <Iconify icon="solar:calendar-bold" width={13} />
          <span className="text-[11px] font-medium">{fDate(created_at)}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-6 lg:p-7 flex flex-col flex-1">
        <RouterLink href={detailsHref} className="no-underline">
          <h4 className="font-display font-black text-[1.55rem] uppercase tracking-tight leading-[1.05]  mb-3 line-clamp-2 group-hover:text-[#711a20] transition-colors duration-300">
            {title}
          </h4>
        </RouterLink>

        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-5 line-clamp-3 overflow-hidden transition-colors duration-300">
            {stripHtml(description)}
          </p>
        )}

        {/* Divider + footer */}
        <div className="border-t border-black/10 pt-4 mt-auto flex items-center justify-between">
          <RouterLink
            href={detailsHref}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider  no-underline hover:text-[#711a20] hover:gap-2.5 transition-all duration-200"
          >
            Read Article
            <Iconify icon="solar:arrow-right-bold" width={16} />
          </RouterLink>

          {/* Arrow button */}
          <RouterLink
            href={detailsHref}
            className="w-9 h-9 rounded-full bg-[#081a1a] flex items-center justify-center group-hover:bg-[#711a20] transition-colors duration-300 no-underline"
            aria-label="Read article"
          >
            <Iconify icon="solar:arrow-right-bold" width={16} className="text-white" />
          </RouterLink>
        </div>
      </div>
    </motion.div>
  );
}