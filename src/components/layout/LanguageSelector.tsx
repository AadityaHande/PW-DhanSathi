'use client';

import { Languages } from "lucide-react";

/**
 * Placeholder for the Google Translate element.
 * The actual widget will be rendered here by Google's script.
 */
export default function LanguageSelector() {
  return (
    <div className="flex items-center">
      <Languages className="h-5 w-5 text-muted-foreground mr-2" />
      <div id="google_translate_element" className="google-translate-widget"></div>
    </div>
  );
}
