import { CONFIG } from "@/global-config";

import { OrderDetailsView } from "@/sections/order/view";

// ----------------------------------------------------------------------

export const metadata = {
  metadataBase: new URL("https://hree.com.np"),
  title: "Order Details",
  description: "View your order details, tracking information, and status.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function Page({ params }) {
  const { id } = await params;

  return <OrderDetailsView orderId={id} />;
}
