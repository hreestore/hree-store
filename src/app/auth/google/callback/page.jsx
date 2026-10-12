import { getAppName } from "@/api";

import { GoogleCallbackView } from "@/auth/view";

// ----------------------------------------------------------------------

export async function generateMetadata() {
    const { appName } = await getAppName();

    return {
        metadataBase: new URL("https://hree.com.np"),
        title: "Google Sign In",
        description: `Completing Google sign-in for ${appName}.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default function Page() {
    return <GoogleCallbackView />;
}
