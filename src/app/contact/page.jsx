import { getAppName } from "@/api";
import ContactView from "@/sections/contact/view/contact-view";


export async function generateMetadata() {
    const { appName } = await getAppName();

    return {
        metadataBase: new URL("https://hree.com.np"),
        title: `${appName} | Contact Us`,
        description:
            "Get in touch with Hree Store for inquiries, support, or collaborations. We're here to help you with your orders, products, and more.",
        keywords: [
            "Hree Store contact",
            "contact Hree Store Nepal",
            "customer support Hree Store",
            "online store contact",
            "Hree Store help",
            appName,
        ],
        authors: [{ name: appName }],
        creator: appName,
        publisher: appName,
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        robots: {
            index: true,
            follow: true,
            nocache: false,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        alternates: {
            canonical: "/contact",
            languages: {
                "en-US": "/contact",
            },
        },
        verification: {
            google: "your-google-site-verification-code",
        },
        category: "contact",
        openGraph: {
            title: `${appName} | Contact Us`,
            description:
                "Reach out to Hree Store for support, questions, or feedback. We're always happy to hear from you.",
            url: "/contact",
            siteName: appName,
            images: [
                {
                    url: "/og-contact.png", // optional: change if you have a contact-specific OG image
                    width: 1200,
                    height: 630,
                    alt: "Contact Hree Store",
                },
            ],
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${appName} | Contact Us`,
            description:
                "Need help? Contact Hree Store for quick support and assistance.",
            images: ["/og-contact.png"],
            creator: "@your-twitter-handle",
            site: "@your-twitter-handle",
        },
    };
}
export default function Page() {
    return (
        <ContactView />
    );
}