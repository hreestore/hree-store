'use client';

import AboutCTA from '../about-cta';
import AboutHero from '../about-hero';
import AboutPhilosophy from '../about-philosophy';
import AboutMissionVision from '../about-mission-vision';
import { useGetAboutData } from '@/api/about';

//----------------------------------------------------

export default function AboutView() {
    const { aboutData } = useGetAboutData()

    return (
        <>
            <AboutHero aboutData={aboutData} />
            <AboutMissionVision aboutData={aboutData} />
            <AboutPhilosophy aboutData={aboutData} />
            {/* <AboutCTA /> */}
        </>
    );
}


