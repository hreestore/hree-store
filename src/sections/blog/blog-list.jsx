import { useState } from "react";
import { paths } from "@/routes/paths";
import { BlogItem } from "./blog-item";
import { BlogItemSkeleton } from "./blog-skeleton";

// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 8;

export function BlogList({ blogs, loading }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(blogs.length / ITEMS_PER_PAGE);
  const paginatedBlogs = blogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const renderLoading = () => <BlogItemSkeleton />;

  const renderList = () =>
    paginatedBlogs.map((blog, index) => (
      <BlogItem
        key={blog.id}
        blog={blog}
        index={index}
        detailsHref={paths.blog.details(blog.slug)}
      />
    ));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {loading ? renderLoading() : renderList()}
      </div>

      {blogs.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-1.5 mt-10 md:mt-16">
          {/* Prev */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-black/10 text-[#081a1a] hover:bg-[#081a1a] hover:text-white hover:border-[#081a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isActive = pageNum === page;
            const isNearCurrent = Math.abs(pageNum - page) <= 1;
            const isEdge = pageNum === 1 || pageNum === totalPages;

            if (!isNearCurrent && !isEdge) {
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return (
                  <span key={pageNum} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">
                    …
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-[#081a1a] text-white border border-[#081a1a]"
                    : "border border-black/10 text-[#081a1a] hover:bg-[#081a1a] hover:text-white hover:border-[#081a1a]"
                  }`}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-black/10 text-[#081a1a] hover:bg-[#081a1a] hover:text-white hover:border-[#081a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Next page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}