import { Popover } from "@mui/material";

export function CustomPopover({
  open,
  anchorEl,
  onClose,
  children,
  slotProps,
  anchorOrigin = { vertical: "bottom", horizontal: "right" },
  transformOrigin = { vertical: "top", horizontal: "right" },
  ...other
}) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          sx: {
            overflow: "inherit",
            ml: 0.75,
            width: "auto",
            ...slotProps?.paper?.sx,
          },
        },
      }}
      {...other}
    >
      {children}
    </Popover>
  );
}
