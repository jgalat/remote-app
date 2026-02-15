import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { loadPreferences } from "~/store/preferences";
import en from "./locales/en";
import ru from "./locales/ru";
import es from "./locales/es";
import fr from "./locales/fr";
import hu from "./locales/hu";
import sv from "./locales/sv";
import pt from "./locales/pt";

const { language } = loadPreferences();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    es: { translation: es },
    fr: { translation: fr },
    hu: { translation: hu },
    sv: { translation: sv },
    pt: { translation: pt },
  },
  lng: language,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
