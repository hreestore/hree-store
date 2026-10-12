import { endpoints } from "./endpoints";

import { fetcher } from "@/lib/axios-server";

export async function getPageDetails(slug) {
    try {
        const response = await fetcher(endpoints.app.getPageDetails(slug));

        return response.data[0];
    } catch (error) {
        console.error(error);
        return {};
    }
}
