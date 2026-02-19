"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
];

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Translate is loaded
    const checkGoogleTranslate = () => {
      if (typeof window !== 'undefined' && (window as any).google?.translate) {
        setIsLoaded(true);
      }
    };
    
    checkGoogleTranslate();
    const interval = setInterval(checkGoogleTranslate, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (langCode: string) => {
    if (typeof window === 'undefined') return;
    
    // Get the Google Translate select element
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
      setCurrentLang(langCode);
    }
  };

  const getCurrentLanguage = () => {
    return LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">{getCurrentLanguage().flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
            {currentLang === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
