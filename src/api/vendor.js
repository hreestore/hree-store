import { CONFIG } from "@/global-config";

import { fetcher as serverFetcher } from "@/lib/axios-server";
import { endpoints } from "./endpoints";

// -------------------------------------------------------------
export async function getVendorDetails() {
  try {
    const response = await serverFetcher(endpoints.vendor);
    return response?.data?.[0] || response?.[0] || response;
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getAppName() {
  try {
    const vendorDetails = await getVendorDetails();
    const appName = vendorDetails?.vendor_name || CONFIG.appName;
    return { appName };
  } catch (error) {
    console.error(error);
    return { appName: CONFIG.appName };
  }
}
