import { Barlow_Condensed, Figtree } from "next/font/google";

/** Condensed industrial display face for headlines. */
export const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

/** Clean body sans (variable font). */
export const sansFont = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const fontVariables = `${displayFont.variable} ${sansFont.variable}`;
