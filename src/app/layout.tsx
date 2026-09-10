import type { Metadata } from 'next';
import './globals.css';
import { CurrentContextProvider } from '@/context/CurrentContext';
import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-TOOLIP2026';

export const metadata: Metadata = {
  metadataBase: new URL('https://toolip.app'),
  title: {
    default: 'Toolip — 32+ Free Client-Side Productivity Utilities & Developer Tools',
    template: '%s | Toolip',
  },
  description:
    'Toolip is a 100% private, client-side web utility suite. Convert PDFs, format JSON, split bills, compress images, and generate invoices with zero server uploads and total privacy.',
  keywords: [
    'online utilities',
    'free developer tools',
    'client-side pdf converter',
    'json formatter online',
    'bill splitter calculator',
    'privacy-first web tools',
    'toolip'
  ],
  authors: [{ name: 'Toolip Team', url: 'https://toolip.app' }],
  creator: 'Toolip',
  publisher: 'Toolip',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://toolip.app',
    siteName: 'Toolip',
    title: 'Toolip — 32+ Free Client-Side Productivity Utilities',
    description:
      '32 fast, private everyday utilities for PDFs, images, calculators, and developer tasks. 100% client-side, zero server uploads.',
    images: [
      {
        url: 'https://toolip.app/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Toolip Utilities Platform',
      },
    ],
  },
  icons: {
    icon: '/images/Tooliplogo.svg',
    shortcut: '/images/Tooliplogo.svg',
    apple: '/images/Tooliplogo.svg',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toolip — 32+ Free Client-Side Productivity Utilities',
    description:
      'Fast, private everyday utilities for PDFs, images, calculators, and developer tasks.',
    images: ['https://toolip.app/images/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Toolip',
    url: 'https://toolip.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://toolip.app/tools/{search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Google Analytics Tag */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="text-gray-100 antialiased min-h-screen selection:bg-vice-pink selection:text-white">
        <CurrentContextProvider>{children}</CurrentContextProvider>
      </body>
    </html>
  );
}
