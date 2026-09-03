"use client";

import { LocaleProvider } from "@/lib/LocaleContext";
import { ThemeProvider } from "@/lib/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
