import { paths } from "@/routes/paths";
import { Iconify } from "@/components/iconify";

export const mobileBottomNavData = [
  {
    title: "Home",
    path: paths.home,
    icon: <Iconify width={24} icon="solar:home-2-bold-duotone" />,
  },
  {
    title: "Categories",
    path: paths.category,
    icon: <Iconify width={24} icon="solar:widget-bold-duotone" />,
  },
  {
    title: "Cart",
    path: paths.cart,
    icon: <Iconify width={24} icon="solar:cart-3-bold-duotone" />,
  },
  {
    title: "Deals",
    path: `${paths.product.root}?deals=true`,
    icon: <Iconify width={24} icon="solar:tag-price-bold-duotone" />,
  },
  {
    title: "Profile",
    path: paths.profile.root,
    icon: <Iconify width={24} icon="solar:user-circle-bold-duotone" />,
  },
];
