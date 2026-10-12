'use client';

// Simple Markdown component - renders content as prose
export function Markdown({ children, className, ...other }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: children || '' }}
      {...other}
    />
  );
}
