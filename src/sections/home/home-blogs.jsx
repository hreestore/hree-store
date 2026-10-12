import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { paths } from '@/routes/paths';

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

function BlogCard({ blog, index }) {
    const formattedDate = blog.created_at
        ? format(new Date(blog.created_at), 'MMM d, yyyy')
        : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className=" rounded-[2rem] overflow-hidden flex flex-col shadow-2xl  border border-transparent dark:border-white/5 group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-white/5"
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden flex-shrink-0">
                {blog.featured_image ? (
                    <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                        <svg
                            className="w-12 h-12 opacity-15"
                            fill="none"
                            stroke="white"
                            strokeWidth={1.5}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 3h18"
                            />
                        </svg>
                    </div>
                )}

                {/* Author badge as category replacement */}
                {blog.created_by && (
                    <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.12em] font-medium text-white bg-white/15 border border-white/25 backdrop-blur-sm px-3 py-1 rounded-full">
                        {blog.created_by}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-6 lg:p-7 flex flex-col flex-1">
                <h3 className="font-display text-[1.65rem] uppercase tracking-tight leading-[1.05]  mb-3 font-black transition-colors duration-300">
                    {blog.title}
                </h3>

                {blog.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-5 line-clamp-3 overflow-hidden transition-colors duration-300">
                        {stripHtml(blog.description)}
                    </p>
                )}

                {/* Divider */}
                <div className="border-t border-black/10 dark:border-white/10 pt-4 mt-auto transition-colors duration-300">
                    <div className="flex items-center justify-between">
                        {/* Date */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#081a1a] dark:bg-white text-white dark:text-[#081a1a] text-[11px] font-medium flex items-center justify-center flex-shrink-0 group-hover:bg-[#711a20] dark:group-hover:bg-[#ff3b4a] dark:group-hover:text-white transition-colors duration-300">
                                {blog.created_by
                                    ?.split(' ')
                                    .map((w) => w[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[#081a1a] dark:text-white leading-tight transition-colors duration-300">
                                    {blog.created_by}
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5 transition-colors duration-300">
                                    {formattedDate}
                                </p>
                            </div>
                        </div>

                        {/* Arrow Button */}
                        <a
                            href={paths.blog.details(blog.slug)}
                            className="w-9 h-9 rounded-full bg-[#081a1a] dark:bg-white flex items-center justify-center group-hover:bg-[#711a20] dark:group-hover:bg-[#ff3b4a] transition-colors duration-300 flex-shrink-0 group/btn"
                            aria-label="Read article"
                        >
                            <ArrowRight className="w-4 h-4 text-white dark:text-[#081a1a] group-hover/btn:text-white transition-colors duration-300" />
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}


export default function HomeBlogs({ blogs }) {
    if (!blogs || blogs.length === 0) {
        return null; // Don't render the section if there are no blogs
    }
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#711a20] dark:text-[#ff3b4a] mb-2 transition-colors duration-300">
                        From Our Journal
                    </p>
                    <h2 className="font-display font-black text-5xl lg:text-6xl uppercase tracking-tighter  leading-[0.95] transition-colors duration-300">
                        Latest<br />Stories
                    </h2>
                </motion.div>

                <motion.a
                    href="/blog"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-wider text-[#081a1a] dark:text-white border-b border-[#081a1a] dark:border-white pb-0.5 hover:text-[#711a20] dark:hover:text-[#ff3b4a] hover:border-[#711a20] dark:hover:border-[#ff3b4a] transition-colors duration-300 self-start sm:self-auto group"
                >
                    View all posts
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.a>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {blogs?.map((blog, index) => (
                    <article key={blog.id}>

                        <BlogCard blog={blog} index={index} />
                    </article>
                ))}
            </div>
        </section>
    );
}