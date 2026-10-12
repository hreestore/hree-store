"use client";

import { Box, Checkbox, Typography } from "@mui/material";

export function TableSelectedAction({
  dense,
  action,
  rowCount,
  numSelected,
  onSelectAllRows,
  sx,
}) {
  if (!numSelected) {
    return null;
  }

  return (
    <Box
      sx={{
        pl: 1,
        pr: 2,
        top: 0,
        left: 0,
        width: 1,
        zIndex: 9,
        height: 58,
        display: "flex",
        position: "absolute",
        alignItems: "center",
        bgcolor: "primary.lighter",
        ...(dense && {
          height: 38,
        }),
        ...sx,
      }}
    >
      <Checkbox
        indeterminate={numSelected > 0 && numSelected < rowCount}
        checked={rowCount > 0 && numSelected === rowCount}
        onChange={(event) =>
          onSelectAllRows(
            event.target.checked,
            []
          )
        }
      />

      <Typography
        variant="subtitle2"
        sx={{
          ml: 2,
          flexGrow: 1,
          color: "primary.main",
        }}
      >
        {numSelected} selected
      </Typography>

      {action && action}
    </Box>
  );
}
