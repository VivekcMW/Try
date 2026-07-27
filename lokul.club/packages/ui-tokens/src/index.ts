/**
 * @lokul/ui-tokens
 *
 * Single source of truth for Lokul design tokens.
 * Consumed by:
 *   - web  : tailwind.config (or globals.css) via CSS custom properties
 *   - mobile: NativeWind tailwind.config + StyleSheet helpers
 */

export { colors, brand, accent, gray, semantic, surface } from "./colors";
export type { Colors } from "./colors";

export { spacing } from "./spacing";
export type { Spacing, SpacingKey } from "./spacing";

export { typography, textPresets, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } from "./typography";
export type { Typography, TextPreset } from "./typography";

export { radius, shadows } from "./shape";
export type { RadiusKey, ShadowKey } from "./shape";

/** Convenience: the complete token set as a single object */
import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography, textPresets } from "./typography";
import { radius, shadows } from "./shape";

export const tokens = {
  colors,
  spacing,
  typography,
  textPresets,
  radius,
  shadows,
} as const;

export type Tokens = typeof tokens;
