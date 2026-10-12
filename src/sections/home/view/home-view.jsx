'use client'

import HomeBrandValues from "../home-brand-values";
import HomeCategories from "../home-categories";
import HomeFeaturedDesigns from "../home-featured-designs";
import HomeHero from "../home-hero";
import HomeTestimonials from "../home-testimonials";
import HomeFaqs from "../home-faqs";
import HomeGoogleReview from "../home-google-review";
import { useGetAboutData } from "@/api/about";
import AboutMissionVision from "@/sections/about/about-mission-vision";
import AboutPhilosophy from "@/sections/about/about-philosophy";
import HomeBlogs from "../home-blogs";
import HomePopupDialog from "../home-popup-dialog";
import { useGetBlogs } from "@/api";
import { useGetPopupNotifications } from "@/api/popup-notification";

// -----------------------------------------------------------------

export default function HomeView() {
    const { aboutData } = useGetAboutData();
    const { blogs } = useGetBlogs();
    const { popupNotifications, isLoading: isPopupLoading } = useGetPopupNotifications();

    return (
        <>
            <HomePopupDialog popupNotifications={popupNotifications} isLoading={isPopupLoading} />
            <HomeHero />
            <HomeCategories />
            <AboutMissionVision aboutData={aboutData} />
            <AboutPhilosophy aboutData={aboutData} />
            {/* <HomeFeaturedDesigns /> */}
            <HomeGoogleReview />
            {/* <HomeTestimonials /> */}
            <HomeFaqs />
            <HomeBlogs blogs={blogs} />
            {/* <HomeBrandValues /> */}
        </>
    );
}