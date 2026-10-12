import { CONFIG } from "@/global-config";

import { OrderView } from "@/sections/order/view";

// ----------------------------------------------------------------------

export const metadata = {
  metadataBase: new URL("https://hree.com.np"),
  title: "My Orders",
  description: "View and track your order history and current orders.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

// ----------------------------------------------------------------------

export default async function Page() {
  return <OrderView />;
}
