import type { LanguageInfo, SupportedLanguage } from '../types/index.ts';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false, enabled: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isRTL: false, enabled: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isRTL: false, enabled: true },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', isRTL: false, enabled: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isRTL: false, enabled: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isRTL: false, enabled: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isRTL: false, enabled: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isRTL: false, enabled: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isRTL: false, enabled: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isRTL: false, enabled: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isRTL: false, enabled: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRTL: true, enabled: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true, enabled: true },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false, enabled: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false, enabled: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false, enabled: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRTL: false, enabled: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', isRTL: false, enabled: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false, enabled: true },
];

export const LANGUAGE_MAP = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((lang) => [lang.code, lang])
) as Record<SupportedLanguage, LanguageInfo>;

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
