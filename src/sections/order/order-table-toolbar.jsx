import { useCallback } from "react";

import {
  Box,
  TextField,
  InputAdornment,
  formHelperTextClasses,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { Iconify } from "@/components/iconify";

// ----------------------------------------------------------------------

export function OrderTableToolbar({ filters, onResetPage, dateError }) {
  const { state: currentFilters, setState: updateFilters } = filters;

  const handleFilterName = useCallback(
    (event) => {
      onResetPage();
      updateFilters({ name: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      onResetPage();
      updateFilters({ startDate: newValue });
    },
    [onResetPage, updateFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      onResetPage();
      updateFilters({ endDate: newValue });
    },
    [onResetPage, updateFilters]
  );

  return (
    <Box
      sx={{
        p: 2.5,
        gap: 2,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-end", md: "center" },
      }}
    >
      <DatePicker
        label="Start date"
        value={currentFilters.startDate}
        onChange={handleFilterStartDate}
        slotProps={{ textField: { fullWidth: true } }}
        sx={{ maxWidth: { md: 200 } }}
      />

      <DatePicker
        label="End date"
        value={currentFilters.endDate}
        onChange={handleFilterEndDate}
        slotProps={{
          textField: {
            fullWidth: true,
            error: dateError,
            helperText: dateError
              ? "End date must be later than start date"
              : null,
          },
        }}
        sx={{
          maxWidth: { md: 200 },
          [`& .${formHelperTextClasses.root}`]: {
            position: { md: "absolute" },
            bottom: { md: -40 },
          },
        }}
      />

      <Box
        sx={{
          gap: 2,
          width: 1,
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextField
          fullWidth
          value={currentFilters.name}
          onChange={handleFilterName}
          placeholder="Search order number..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    icon="eva:search-fill"
                    sx={{ color: "text.disabled" }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </Box>
  );
}
