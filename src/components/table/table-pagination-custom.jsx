"use client";

import {
  Box,
  Switch,
  TablePagination,
  FormControlLabel,
} from "@mui/material";

export function TablePaginationCustom({
  dense,
  onChangeDense,
  rowsPerPageOptions = [5, 10, 25],
  sx,
  ...other
}) {
  return (
    <Box sx={{ position: "relative", ...sx }}>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        {...other}
        sx={{
          borderTopColor: "transparent",
        }}
      />

      {onChangeDense && (
        <FormControlLabel
          label="Dense"
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: {
              sm: "absolute",
            },
          }}
        />
      )}
    </Box>
  );
}
