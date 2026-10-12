import { CONFIG } from "@/global-config";

import { ProfileView } from "@/sections/profile/view";

// ----------------------------------------------------------------------

export const metadata = {
  metadataBase: new URL("https://hree.com.np"),
  title: "My Profile",
  description:
    "Manage your account settings, personal information, and preferences.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

// ----------------------------------------------------------------------

export default async function Page() {
  return <ProfileView />;
}
