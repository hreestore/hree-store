import ShopDetailView from "@/sections/shop/shop-detail-view";

export const metadata = {
    title: "Product Details | Hree Create",
};

export default async function ShopDetailPage({ params }) {
    const slug = (await params).slug;
    return <ShopDetailView slug={slug} />;
}
