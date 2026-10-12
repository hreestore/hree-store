'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Markdown } from '@/components/markdown';

// Helper function to extract text from HTML safely if needed
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

  return cleaned.replace(/\s+/g, ' ').trim();
}

export default function HomePopupDialog({ popupNotifications = [], isLoading = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out active popups according to API response (is_active === 1)
  const activePopups = (Array.isArray(popupNotifications) ? popupNotifications : []).filter((item) => {
    if (!item) return false;
    if (item.is_active !== undefined) return Number(item.is_active) === 1 || item.is_active === true;
    if (item.status !== undefined) return item.status === 1 || item.status === true || item.status === 'active';
    return true;
  });

  useEffect(() => {
    if (!isLoading && activePopups.length > 0) {
      // Automatically open the popup dialog on home page load
      setIsOpen(true);
    }
  }, [isLoading, activePopups.length]);

  if (!isOpen || activePopups.length === 0) return null;

  const currentPopup = activePopups[currentIndex] || activePopups[0];

  const title = currentPopup?.title || currentPopup?.name || currentPopup?.heading || currentPopup?.header || '';
  const description = currentPopup?.description || currentPopup?.content || currentPopup?.message || currentPopup?.details || '';
  const imageUrl =
    currentPopup?.image ||
    currentPopup?.featured_image ||
    currentPopup?.banner ||
    currentPopup?.image_url ||
    currentPopup?.file_url ||
    '';
  const buttonLink = currentPopup?.link || currentPopup?.button_link || currentPopup?.url || currentPopup?.link_url || '';
  const buttonText = currentPopup?.button_text || (buttonLink ? 'Learn More' : 'Got it');
  const isExternalLink = buttonLink && (buttonLink.startsWith('http://') || buttonLink.startsWith('https://'));

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activePopups.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activePopups.length) % activePopups.length);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-xl bg-[#081a1a] text-white rounded-3xl border border-[#711a20]/40 shadow-[0_25px_60px_-15px_rgba(113,26,32,0.5)] overflow-hidden flex flex-col my-auto"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              type="button"
              aria-label="Close dialog"
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#711a20] text-white border border-white/20 flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Notification Image Banner */}
            {imageUrl && (
              <div className="relative w-full max-h-[60vh] flex items-center justify-center bg-black/50 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={title || 'Announcement'}
                  title={title}
                  className="w-full max-h-[60vh] object-contain"
                />
                
                {/* Notice Badge */}
                <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[#711a20]/90 text-white border border-white/20 shadow-md backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Announcement</span>
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className={`p-6 sm:p-8 flex flex-col ${!imageUrl ? 'pt-10' : 'pt-2'}`}>
              {!imageUrl && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[#711a20]/90 text-white border border-white/20 shadow-md backdrop-blur-sm self-start mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Announcement</span>
                </div>
              )}

              {title && (
                <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-white mb-3">
                  {title}
                </h2>
              )}

              {description && (
                <div className="text-sm sm:text-base text-gray-300 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar mb-6 pr-1">
                  {description.includes('<') ? (
                    <Markdown className="prose prose-invert prose-sm max-w-none text-gray-300" children={description} />
                  ) : (
                    <p>{description}</p>
                  )}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pt-4 border-t border-white/10">
                {/* Carousel Controls if multiple popups */}
                {activePopups.length > 1 ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors"
                      aria-label="Previous notice"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-gray-400 px-1">
                      {currentIndex + 1} / {activePopups.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors"
                      aria-label="Next notice"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div />
                )}

                {/* Primary CTA / Close Button */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {buttonLink ? (
                    isExternalLink ? (
                      <a
                        href={buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleClose}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#711a20] hover:bg-[#8e2129] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-[#711a20]/40 transition-all duration-200 transform hover:-translate-y-0.5"
                      >
                        <span>{buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <Link
                        href={buttonLink}
                        onClick={handleClose}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#711a20] hover:bg-[#8e2129] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-[#711a20]/40 transition-all duration-200 transform hover:-translate-y-0.5"
                      >
                        <span>{buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#711a20] hover:bg-[#8e2129] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-[#711a20]/40 transition-all duration-200"
                    >
                      Got it
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
