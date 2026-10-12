import { Toaster } from 'sonner';
import { styled, alpha } from '@mui/material/styles';

import { snackbarClasses } from './classes';
import { justifyContent } from '@mui/system';

// ----------------------------------------------------------------------

export const SnackbarRoot = styled(Toaster)(({ theme }) => {
  const baseStyles = {
    toastDefault: {
      padding: theme.spacing(1.5, 1.5, 1.5, 2),
      boxShadow: '0 8px 32px rgba(8, 26, 26, 0.15)',
      color: '#ffffff',
      backgroundColor: '#081a1a',
      borderRadius: '24px',
      border: '2px solid #081a1a',
    },
    toastColor: {
      padding: theme.spacing(1, 2, 1, 1),
      boxShadow: '4px 8px 24px rgba(8, 26, 26, 0.12)',
      color: '#081a1a',
      backgroundColor: '#ffffff',
      border: '3px solid #081a1a',
      borderRadius: '24px',
    },
    toastLoader: {
      padding: theme.spacing(0.5, 1, 0.5, 0.5),
      boxShadow: '0 8px 32px rgba(8, 26, 26, 0.15)',
      color: '#081a1a',
      backgroundColor: '#ffffff',
      border: '3px solid #081a1a',
      borderRadius: '24px',
    },
  };

  const loadingStyles = {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'none',
    transform: 'none',
    overflow: 'hidden',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 'inherit',
    justifyContent: 'center',
    background: '#ffffff',
    [`& .${snackbarClasses.loadingIcon}`]: {
      zIndex: 9,
      width: 24,
      height: 24,
      borderRadius: '50%',
      animation: 'rotate 3s infinite linear',
      background: `conic-gradient(transparent, #081a1a)`,
    },
    [snackbarClasses.loaderVisible]: { display: 'flex' },
  };

  return {
    width: 320,
    [`& .${snackbarClasses.toast}`]: {
      gap: 16,
      width: '100%',
      minHeight: 64,
      display: 'flex',
      borderRadius: 24,
      alignItems: 'center',
      fontFamily: theme.typography.fontFamily,
    },
    /**
     * Content
     */
    [`& .${snackbarClasses.content}`]: { gap: 0, flex: '1 1 auto' },
    [`& .${snackbarClasses.title}`]: {
      fontSize: '14px',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '-0.02em',
      color: 'inherit'
    },
    [`& .${snackbarClasses.description}`]: {
      fontSize: '12px',
      fontWeight: 600,
      opacity: 0.8
    },
    /**
     * Buttons
     */
    [`& .${snackbarClasses.actionButton}`]: {},
    [`& .${snackbarClasses.cancelButton}`]: {},
    [`& .${snackbarClasses.closeButton}`]: {
      position: 'absolute',
      top: 8,
      right: 8,
      left: 'auto',
      color: 'currentColor',
      backgroundColor: 'transparent',
      transform: 'none',
      border: 'none',
      transition: theme.transitions.create(['background-color', 'opacity', 'transform']),
      '&:hover': {
        opacity: 0.7,
        backgroundColor: 'transparent',
        transform: 'scale(1.1)',
      },
      '& svg': {
        width: 16,
        height: 16,
        strokeWidth: 3,
      }
    },
    /**
     * Icon
     */
    [`& .${snackbarClasses.icon}`]: {
      margin: 0,
      width: 48,
      height: 48,
      alignItems: 'center',
      borderRadius: '16px',
      justifyContent: 'center',
      alignSelf: 'center',
      display: 'flex',
      // border: '2px solid #081a1a',
      [`& .${snackbarClasses.iconSvg}`]: { width: 24, height: 24, fontSize: 0 },
    },

    '@keyframes rotate': { to: { transform: 'rotate(1turn)' } },

    /**
     * @variant default
     */
    [`& .${snackbarClasses.default}`]: {
      ...baseStyles.toastDefault,
      [`&:has(${snackbarClasses.closeBtnVisible})`]: {
        [`& .${snackbarClasses.content}`]: { paddingRight: 32 },
      },
      [`&:has(.${snackbarClasses.loader})`]: baseStyles.toastLoader,
      /**
       * @with loader
       */
      [`&:has(.${snackbarClasses.loader})`]: baseStyles.toastLoader,
      [`& .${snackbarClasses.loader}`]: loadingStyles,
    },
    /**
     * @variant error
     */
    [`& .${snackbarClasses.error}`]: {
      ...baseStyles.toastColor,
      [`& .${snackbarClasses.icon}`]: {
        color: '#ffffff',
        backgroundColor: '#711a20',
      },
    },
    /**
     * @variant success
     */
    [`& .${snackbarClasses.success}`]: {
      ...baseStyles.toastColor,
      [`& .${snackbarClasses.icon}`]: {
        color: '#ffffff',
        backgroundColor: '#4caf50',
      },
    },
    /**
     * @variant warning
     */
    [`& .${snackbarClasses.warning}`]: {
      ...baseStyles.toastColor,
      [`& .${snackbarClasses.icon}`]: {
        color: '#081a1a',
        backgroundColor: '#ffffff',
      },
    },
    /**
     * @variant info
     */
    [`& .${snackbarClasses.info}`]: {
      ...baseStyles.toastColor,
      [`& .${snackbarClasses.icon}`]: {
        color: '#ffffff',
        backgroundColor: '#081a1a',
      },
    },
  };
});
