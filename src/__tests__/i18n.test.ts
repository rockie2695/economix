import { describe, it, expect } from "vitest";
import { t, translations, type Locale, type TranslationKey } from "@/lib/i18n";

describe("i18n translations", () => {
  const locales: Locale[] = ["en", "zh-TW"];

  it("should have identical key sets for all locales", () => {
    const enKeys = Object.keys(translations.en).sort();
    const zhTWKeys = Object.keys(translations["zh-TW"]).sort();

    expect(enKeys).toEqual(zhTWKeys);
  });

  it("should return a string for every translation key in every locale", () => {
    for (const locale of locales) {
      const keys = Object.keys(translations[locale]) as TranslationKey[];
      for (const key of keys) {
        const result = t(locale, key);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      }
    }
  });

  it("should return the key itself for unknown keys", () => {
    const result = t("en", "nonexistent_key" as TranslationKey);
    expect(result).toBe("nonexistent_key");
  });

  it("should translate appTitle correctly", () => {
    expect(t("en", "appTitle")).toBe("Economix");
    expect(t("zh-TW", "appTitle")).toBe("經濟指標");
  });

  it("should translate country names correctly", () => {
    expect(t("en", "country_US")).toBe("United States");
    expect(t("zh-TW", "country_US")).toBe("美國");
    expect(t("en", "country_Japan")).toBe("Japan");
    expect(t("zh-TW", "country_Japan")).toBe("日本");
  });
});
