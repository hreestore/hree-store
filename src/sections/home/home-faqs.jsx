"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { useGetHomeFaqs } from "@/api";
import { Markdown } from "@/components/markdown";

// ----------------------------------------------------------------------

export default function HomeFaqs() {

    const { faqs } = useGetHomeFaqs()
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (!faqs || faqs.length === 0) {
        return null; // Don't render the section if there are no faqs
    }
    return (
        <section className="py-16 lg:py-24 relative pt-0!">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tighter mb-4">
                        Frequently Asked <span className="text-[#711a20]">Questions</span>
                    </h2>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Everything you need to know about our products and services.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs?.map((faq, index) => (
                        <div
                            key={index}
                            className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${openIndex === index ? ' shadow-sm' : 'border-gray-200'
                                }`}
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-5 lg:p-6 text-left focus:outline-none transition-colors"
                                aria-expanded={openIndex === index}
                            >
                                <span className={`font-bold text-lg pr-4 ${openIndex === index ? '' : ''}`}>
                                    {faq.question}
                                </span>
                                <motion.div
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-gray-400 flex-shrink-0"
                                >
                                    <Icon icon="solar:alt-arrow-down-bold-duotone" className="w-6 h-6" />
                                </motion.div>
                            </button>

                            <AnimatePresence initial={false}>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <Markdown className="p-5 lg:p-6 pt-0  leading-relaxed border-t border-gray-100 " children={faq.answer} />

                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}