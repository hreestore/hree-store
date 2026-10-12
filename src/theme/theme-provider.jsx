'use client';

import { useTheme } from 'next-themes';
import { useMemo, useEffect, useState } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export function ThemeProvider({ children }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = useMemo(() => {
    const isDark = mounted && resolvedTheme === 'dark';

    return createTheme({
      palette: {
        mode: isDark ? 'dark' : 'light',
        primary: {
          main: '#0a1a1a',
          light: '#333333',
          dark: '#0a1a1a',
          contrastText: '#ffffff',
        },
        error: {
          main: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#f97316',
          light: '#fb923c',
          dark: '#ea580c',
          contrastText: '#ffffff',
        },
        success: {
          main: '#22c55e',
          light: '#4ade80',
          dark: '#16a34a',
          contrastText: '#ffffff',
        },
        info: {
          main: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
          contrastText: '#ffffff',
        },
        grey: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        background: {
          default: isDark ? '#0a1a1a' : '#ffffff',
          paper: isDark ? '#1e1e1e' : '#ffffff',
          neutral: isDark ? '#262626' : '#f3f4f6',
        },
        text: {
          primary: isDark ? '#f9fafb' : '#111827',
          secondary: isDark ? '#9ca3af' : '#6b7280',
          disabled: isDark ? '#4b5563' : '#9ca3af',
        },
      },
      typography: {
        fontFamily: 'var(--font-sans), sans-serif',
        subtitle2: {
          fontSize: '0.875rem',
          fontWeight: 600,
        },
        caption: {
          fontSize: '0.75rem',
        },
      },
      spacing: 8,
      shape: {
        borderRadius: 8,
      },
      shadows: [
        'none',
        '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      ],
    });
  }, [resolvedTheme, mounted]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
    </MuiThemeProvider>
  );
}