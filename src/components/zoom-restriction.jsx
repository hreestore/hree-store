'use client';

import { useEffect } from 'react';

export default function ZoomRestriction() {
  useEffect(() => {
    // Prevent iOS Safari gesture zoom (pinch/rotate)
    const handleGesture = (e) => {
      e.preventDefault();
    };

    // Prevent multi-touch pinch zoom
    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent double-tap to zoom
    let lastTouchEnd = 0;
    const handleTouchEnd = (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        const tag = e.target?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    };

    // Prevent Ctrl/Cmd + Mouse Wheel zoom
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    // Prevent Ctrl/Cmd + (+ / - / 0) keyboard zoom shortcuts
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '+' ||
          e.key === '-' ||
          e.key === '=' ||
          e.key === '_' ||
          e.key === '0' ||
          e.keyCode === 187 ||
          e.keyCode === 189 ||
          e.keyCode === 48 ||
          e.keyCode === 96 ||
          e.keyCode === 107 ||
          e.keyCode === 109)
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('gesturestart', handleGesture, { passive: false });
    document.addEventListener('gesturechange', handleGesture, { passive: false });
    document.addEventListener('gestureend', handleGesture, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
      document.removeEventListener('gestureend', handleGesture);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
