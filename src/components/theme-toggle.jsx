'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { Iconify } from '@/components/iconify';

export function ThemeToggle({ sx }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder of the same size to prevent layout shift
        return (
            <IconButton sx={sx} disabled>
                <Iconify icon="solar:sun-2-bold" sx={{ opacity: 0 }} />
            </IconButton>
        );
    }

    const isDark = theme === 'dark';

    return (
        <IconButton
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            sx={{
                color: isDark ? 'warning.main' : 'primary.main',
                ...sx
            }}
            aria-label="Toggle dark mode"
        >
            <Iconify icon={isDark ? 'solar:sun-2-bold' : 'solar:moon-bold-duotone'} />
        </IconButton>
    );
}
