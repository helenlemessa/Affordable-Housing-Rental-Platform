import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const LanguageSwitcher = ({ mobile = false }) => {
  const { i18n } = useTranslation();

  // Set initial language from localStorage or browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang)
      .then(() => {
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang; // For accessibility
      })
      .catch((err) => {
        console.error('Language change failed:', err);
      });
  };

  // Language options configuration for cleaner code
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'am', label: 'አማ' }
  ];

  return (
    <div className={`flex gap-2 ${mobile ? 'justify-center' : ''}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-2 py-1 rounded transition-colors duration-200 ${
            i18n.language === lang.code 
              ? 'bg-blue-100 text-blue-600 font-medium' 
              : 'hover:bg-gray-100'
          }`}
          aria-label={`Switch to ${lang.code === 'en' ? 'English' : 'Amharic'}`}
          lang={lang.code}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;