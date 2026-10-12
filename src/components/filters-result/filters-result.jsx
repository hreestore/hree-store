import { Box, Button, Typography, Stack } from "@mui/material";

// ----------------------------------------------------------------------

export const chipProps = {
  size: "small",
  variant: "soft",
};

// ----------------------------------------------------------------------

export function FiltersBlock({ label, children, isShow, sx }) {
  if (!isShow) {
    return null;
  }

  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="center"
      sx={{
        py: 1,
        px: 1,
        borderRadius: 1,
        overflow: "hidden",
        ...sx,
      }}
    >
      <Box component="span" sx={{ fontWeight: 600, fontSize: 14 }}>
        {label}
      </Box>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ flex: "1 1 auto" }}>
        {children}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function FiltersResult({ totalResults, onReset, children, sx }) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        flexGrow: 1,
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2">
          <strong>{totalResults}</strong>
          <Box component="span" sx={{ color: "text.secondary", ml: 0.5 }}>
            results found
          </Box>
        </Typography>

        <Button
          color="error"
          onClick={onReset}
          size="small"
        >
          Clear
        </Button>
      </Box>

      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        gap={1}
      >
        {children}
      </Stack>
    </Stack>
  );
}
