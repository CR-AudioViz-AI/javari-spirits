"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// 2026-09-01: next-themes v0.3+ exports its types from the package root and no
// longer ships next-themes/dist/types. Importing the removed subpath fails to
// resolve; React.ComponentProps derives the props from the component itself, so it
// cannot drift when the library reorganises again.
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
