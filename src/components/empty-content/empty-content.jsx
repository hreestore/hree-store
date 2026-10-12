import { Box, Typography } from "@mui/material";

export function EmptyContent({ title, description, imgUrl, sx, ...other }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
        ...sx,
      }}
      {...other}
    >
      {imgUrl && (
        <Box
          component="img"
          src={imgUrl}
          alt={title}
          sx={{
            width: 160,
            height: 160,
            mb: 3,
            opacity: 0.6,
          }}
        />
      )}

      <Typography variant="h6" sx={{ mb: 1, color: "text.secondary" }}>
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ color: "text.disabled" }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
