"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { useGetHomeTestimonial } from "@/api";


// ------------------------------------------------------------------------

export default function HomeTestimonials() {
    const { testimonials } = useGetHomeTestimonial()

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-play functionality
    useEffect(() => {
        if (!testimonials || testimonials.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [testimonials]);

    const handleNext = () => {
        if (!testimonials || testimonials.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const handlePrev = () => {
        if (!testimonials || testimonials.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    if (!testimonials || testimonials.length === 0) {
        return null; // Do not render section if there are no testimonials yet
    }

    return (
        <section className="py-16 lg:py-24 bg-[#081a1a] overflow-hidden relative">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tighter mb-4 text-white">
                        What Our <span className="text-[#711a20]">Customers</span> Say
                    </h2>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Read real reviews from people who brought their ideas to life.
                    </p>
                </div>

                <div className="relative h-[300px] sm:h-[250px] w-full flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="absolute w-full px-4 sm:px-12 flex flex-col items-center text-center"
                        >
                            <div className="flex gap-1 mb-6 text-yellow-400">
                                {[...Array(Number(testimonials[currentIndex]?.rating || 5))].map((_, i) => (
                                    <Icon key={i} icon="solar:star-bold" className="w-6 h-6" />
                                ))}
                            </div>

                            <div
                                className="text-xl sm:text-xl font-medium text-gray-100 mb-8 leading-relaxed [&>p]:mb-0"
                                dangerouslySetInnerHTML={{ __html: testimonials[currentIndex]?.comment || "" }}
                            />

                            <div>
                                <h4 className="font-bold text-lg text-white">
                                    {testimonials[currentIndex]?.name}
                                </h4>
                                <p className="text-sm text-gray-400 font-medium">
                                    {testimonials[currentIndex]?.designation}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <button
                        onClick={handlePrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 hidden sm:flex"
                        aria-label="Previous testimonial"
                    >
                        <Icon icon="solar:alt-arrow-left-linear" className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 hidden sm:flex"
                        aria-label="Next testimonial"
                    >
                        <Icon icon="solar:alt-arrow-right-linear" className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex justify-center gap-2 mt-8">
                    {testimonials?.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-[#711a20]" : "w-2 bg-gray-600 hover:bg-gray-500"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
