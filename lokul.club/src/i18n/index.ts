import en, { type Dict } from "./en";
import hi from "./hi";
import mr from "./mr";
import kn from "./kn";
import te from "./te";
import ta from "./ta";
import bn from "./bn";

export type Locale = "en" | "hi" | "mr" | "kn" | "te" | "ta" | "bn";

export const DICTS: Record<Locale, Dict> = { en, hi, mr, kn, te, ta, bn };

export type { Dict };
