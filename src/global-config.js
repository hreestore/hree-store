import { paths } from "@/routes/paths";
import packageJson from "../package.json";


// ----------------------------------------------------------------------

export const CONFIG = {
    appName: "Hree Create Store",

    appVersion: packageJson.version,

    serverUrl:
        process.env.NEXT_PUBLIC_SERVER_URL ??
        "https://venturekartapi.walkershive.com.np/api/frontend/",

    assetsDir:
        process.env.NEXT_PUBLIC_ASSETS_DIR ??
        "https://venturekartapi.walkershive.com.np/storage/",

    vendorToken: "3mMalhoVgmhaxWKmqbDILjkCR0VEKNy5m9PwhcK6AAyhXLib7kYZ0Rg0vPvP",

    vendorId: process.env.NEXT_PUBLIC_VENDOR_ID ?? "1",

    auth: {
        redirectPath: paths.home,
    },

    genericErrorMessage: "Oops! Something went wrong. Please try again.",

    pusher: {
        key: "c35c0621c3312fb4fe89",
        cluster: "ap2",
    },
};
