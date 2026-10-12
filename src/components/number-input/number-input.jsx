import { Box, IconButton, TextField, Divider } from "@mui/material";
import { Iconify } from "@/components/iconify";

export function NumberInput({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  hideDivider = false,
  sx,
  ...other
}) {
  const handleIncrement = (event) => {
    const newValue = Math.min(value + 1, max);
    onChange?.(event, newValue);
  };

  const handleDecrement = (event) => {
    const newValue = Math.max(value - 1, min);
    onChange?.(event, newValue);
  };

  const handleChange = (event) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange?.(event, newValue);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        ...sx,
      }}
      {...other}
    >
      <IconButton
        size="small"
        onClick={handleDecrement}
        disabled={value <= min}
        sx={{ p: 0.5 }}
      >
        <Iconify icon="eva:minus-fill" width={16} />
      </IconButton>

      {!hideDivider && <Divider orientation="vertical" flexItem />}

      <TextField
        value={value}
        onChange={handleChange}
        inputProps={{
          min,
          max,
          style: { textAlign: "center", padding: "4px 0" },
        }}
        sx={{
          width: 40,
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "& .MuiInputBase-input": {
            p: 0,
            textAlign: "center",
          },
        }}
        size="small"
      />

      {!hideDivider && <Divider orientation="vertical" flexItem />}

      <IconButton
        size="small"
        onClick={handleIncrement}
        disabled={value >= max}
        sx={{ p: 0.5 }}
      >
        <Iconify icon="eva:plus-fill" width={16} />
      </IconButton>
    </Box>
  );
}
