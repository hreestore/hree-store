import { ProductDetailsView } from "@/sections/catalog/view/product-details-view";

export const metadata = {
    title: "Product Details",
};

export default async function Page({ params }) {
    const slug = (await params).slug;
    return <ProductDetailsView slug={slug} />;
}