import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { translations } from "@/lib/i18n/translations";

// Convert flat dot-notation keys into nested objects for next-intl
function flatToNested(flat: Record<string, string>): Record<string, any> {
  const nested: Record<string, any> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let current = nested;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return nested;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const flat = translations[locale as keyof typeof translations] || translations.en;

  return {
    locale,
    messages: flatToNested(flat),
  };
});
