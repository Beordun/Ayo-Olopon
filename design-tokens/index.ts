/**
 * Material 3 (M3) Design System for Games — Ayò Ọlọ́pọ́n Digital
 * Unified Design Tokens Entrypoint
 */

import { m3Colors } from './colors';
import { m3Typography } from './typography';
import { m3Elevation } from './elevation';
import { m3Shapes } from './shapes';
import { m3Motion } from './motion';

export { m3Colors } from './colors';
export { m3Typography } from './typography';
export { m3Elevation } from './elevation';
export { m3Shapes } from './shapes';
export { m3Motion } from './motion';

export const designTokens = {
  colors: m3Colors,
  typography: m3Typography,
  elevation: m3Elevation,
  shapes: m3Shapes,
  motion: m3Motion,
} as const;

export type DesignTokens = typeof designTokens;
export default designTokens;
