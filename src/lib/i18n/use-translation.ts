import { useAppStore } from "../store/app-store";
import { translations, TranslationKey } from "./translations";

export function useTranslation() {
  const { language } = useAppStore();
  
  // Basic translation function
  const t = (key: TranslationKey, params: Record<string, string> = {}) => {
    // Get translations for current language, fallback to English
    const languageTranslations = translations[language] || translations.en;
    let translation = (languageTranslations as any)[key] || (translations.en as any)[key] || key;
    
    // Replace parameters {name} -> params.name
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(`{${paramKey}}`, value);
    });
    
    return translation;
  };

  return { t, language };
}
