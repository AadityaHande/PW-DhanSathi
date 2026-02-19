import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'DhanSathi | AI-Powered Financial Management',
  description: 'A micro-savings goal tracker with AI-powered insights to help you achieve your financial goals on the Algorand blockchain.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0f1511',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DhanSathi" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
          <InstallPrompt />
        </Providers>
        
        {/* Google Translate */}
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="lazyOnload"
        />
        <Script id="google-translate-init" strategy="lazyOnload">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,bn,te,ta,mr,gu,kn,ml,pa,ur',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
              
              // Also initialize mobile element if exists
              if (document.getElementById('google_translate_element_mobile')) {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,hi,bn,te,ta,mr,gu,kn,ml,pa,ur',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false
                }, 'google_translate_element_mobile');
              }
            }
          `}
        </Script>
      </body>
    </html>
  );
}
