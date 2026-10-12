import { getAppName } from "@/api";

import { SignUpView } from "@/auth/view";

// ----------------------------------------------------------------------

export async function generateMetadata() {
  const { appName } = await getAppName();

  return {
    metadataBase: new URL("https://hree.com.np"),
    title: "Sign Up",
    description:
      "Create a new account to start shopping and enjoy exclusive benefits.",
    keywords: ["sign up", "register", "create account", appName],
    alternates: {
      canonical: "/auth/sign-up",
    },
    robots: {
      index: false,
      follow: true,
      nocache: true,
    },
  };
}

export default function Page() {
  return <SignUpView />;
}
