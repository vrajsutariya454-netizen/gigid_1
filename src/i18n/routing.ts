import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "hi", "ta", "bn"],
  defaultLocale: "en",
});
