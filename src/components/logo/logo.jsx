import { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RouterLink } from "@/routes/components";
import { useTheme } from "next-themes";

import { CONFIG } from "@/global-config";
import { logoClasses } from "./classes";
import { getVendorDetailRequest } from "@/redux/actions/vendor-actions";

// ----------------------------------------------------------------------

export const Logo = forwardRef((props, ref) => {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const dispatch = useAppDispatch();
    const { vendor } = useAppSelector((state) => state.vendor);
    useEffect(() => {
        if (!vendor || Object.keys(vendor).length === 0) {
            dispatch(getVendorDetailRequest());
        }
    }, [dispatch, vendor]);
    const {
        className,
        href = "/",
        isSingle = true,
        disabled,
        sx,
        ...other
    } = props;

    const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');
    const logoSrc = isDark ? "/img/logo/dark/Brand Kit-11.png" : vendor?.logo;

    const logo = (
        <img
            alt={vendor?.vendor_name || "Logo"}
            title={vendor?.vendor_name || "Logo"}
            src={logoSrc}
            className="w-36 object-contain"
        />
    );

    // const sizeClasses = isSingle ? "h-20 w-20" : "h-9 w-[120px]";
    const disabledClasses = disabled ? "pointer-events-none" : "";
    const sxClasses = typeof sx === "string" ? sx : "";

    return (


        <RouterLink
            ref={ref}
            href={href}
            aria-label="Logo"
            className={cn(
                logoClasses.root,
                "flex justify-center",
                // sizeClasses,
                disabledClasses,
                sxClasses,
                className,
            )}
            {...other}
        >
            {/* {isSingle ? singleLogo : fullLogo} */}
            {logo}
        </RouterLink>
    );
});
