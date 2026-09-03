"use client";

import { LocaleProvider } from "@/lib/LocaleContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
