'use client';

import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

export function Iconify({ icon, width = 20, className, ...other }) {
  return <Icon icon={icon} width={width} className={className} {...other} />;
}
