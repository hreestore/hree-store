import { useCallback, useState } from 'react';

export function usePopover() {
  const [anchorEl, setAnchorEl] = useState(null);

  const onOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const onClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);

  return {
    open,
    anchorEl,
    onOpen,
    onClose,
    setAnchorEl,
  };
}
