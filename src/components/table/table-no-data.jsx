"use client";

import { TableRow, TableCell, Typography } from "@mui/material";

export function TableNoData({ notFound, sx }) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={12}>
          <Typography
            variant="h6"
            sx={{
              py: 8,
              textAlign: "center",
              color: "text.secondary",
              ...sx,
            }}
          >
            No data found
          </Typography>
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
