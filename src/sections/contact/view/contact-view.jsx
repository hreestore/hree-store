'use client';

import { useAppSelector } from '@/redux/hooks';
import ContactForm from '../contact-form';
import ContactMap from '../contact-map';
import { useTheme } from 'next-themes';

export default function ContactView() {
    const { resolvedTheme } = useTheme()

    return (
        <section className=" py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {resolvedTheme === "light" && (

                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-black uppercase tracking-tighter  sm:text-5xl">
                            Get in <span className="text-[#711a20] ">Touch</span>
                        </h2>
                        <p className="mt-4 text-lg text-gray-600  font-medium">
                            Have questions? We'd love to hear from you.
                        </p>
                    </div>
                )}

                {resolvedTheme === "dark" && (
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-black uppercase tracking-tighter  sm:text-5xl">
                            Get in <span className="text-[#f7e6dc] ">Touch</span>
                        </h2>
                        <p className="mt-4 text-lg text-[#f7e6dc]  font-medium">
                            Have questions? We'd love to hear from you.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left Grid: Contact Form */}
                    <ContactForm />

                    {/* Right Grid: Google Map & Contact Info */}
                    <ContactMap />

                </div>
            </div>
        </section>
    );
}