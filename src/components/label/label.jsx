import { forwardRef } from "react";
import { Box } from "@mui/material";

// ----------------------------------------------------------------------

export const Label = forwardRef(
  ({ children, color = "default", variant = "soft", sx, ...other }, ref) => {
    const colorStyles = {
      filled: {
        default: {
          color: "common.white",
          bgcolor: "text.primary",
        },
        primary: {
          color: "primary.contrastText",
          bgcolor: "primary.main",
        },
        secondary: {
          color: "secondary.contrastText",
          bgcolor: "secondary.main",
        },
        info: {
          color: "info.contrastText",
          bgcolor: "info.main",
        },
        success: {
          color: "success.contrastText",
          bgcolor: "success.main",
        },
        warning: {
          color: "warning.contrastText",
          bgcolor: "warning.main",
        },
        error: {
          color: "error.contrastText",
          bgcolor: "error.main",
        },
      },
      soft: {
        default: {
          color: "text.primary",
          bgcolor: "action.selected",
        },
        primary: {
          color: "primary.dark",
          bgcolor: "primary.lighter",
        },
        secondary: {
          color: "secondary.dark",
          bgcolor: "secondary.lighter",
        },
        info: {
          color: "info.dark",
          bgcolor: "info.lighter",
        },
        success: {
          color: "success.dark",
          bgcolor: "success.lighter",
        },
        warning: {
          color: "warning.dark",
          bgcolor: "warning.lighter",
        },
        error: {
          color: "error.dark",
          bgcolor: "error.lighter",
        },
      },
      outlined: {
        default: {
          color: "text.primary",
          border: "1px solid currentColor",
        },
        primary: {
          color: "primary.main",
          border: "1px solid currentColor",
        },
        secondary: {
          color: "secondary.main",
          border: "1px solid currentColor",
        },
        info: {
          color: "info.main",
          border: "1px solid currentColor",
        },
        success: {
          color: "success.main",
          border: "1px solid currentColor",
        },
        warning: {
          color: "warning.main",
          border: "1px solid currentColor",
        },
        error: {
          color: "error.main",
          border: "1px solid currentColor",
        },
      },
    };

    return (
      <Box
        ref={ref}
        component="span"
        sx={{
          px: 0.75,
          py: 0.25,
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1.5,
          borderRadius: 0.5,
          textTransform: "capitalize",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          ...colorStyles[variant][color],
          ...sx,
        }}
        {...other}
      >
        {children}
      </Box>
    );
  }
);

Label.displayName = "Label";
