import { forwardRef } from 'react';
import Box from '@mui/material/Box';

export const Scrollbar = forwardRef(({ children, sx, ...other }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        overflow: 'auto',
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
});

Scrollbar.displayName = 'Scrollbar';
