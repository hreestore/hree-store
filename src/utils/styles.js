/**
 * Converts a color channel and alpha value into rgba format
 * @param {string} colorChannel - The color channel (e.g., '255 255 255')
 * @param {number} alpha - The alpha value (0-1)
 * @returns {string} - The rgba color string
 */
export function varAlpha(colorChannel, alpha) {
  return `rgba(${colorChannel.replace('Channel', '')}, ${alpha})`;
}
