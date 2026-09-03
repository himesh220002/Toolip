import type { Metadata } from 'next';
import './globals.css';
import { CurrentContextProvider } from '@/context/CurrentContext';

export const metadata: Metadata = {
  title: 'Toolip — 31 Everyday Utilities & Tools',
  description:
    '31 fast, private everyday utilities for PDFs, images, calculators and office work. All client-side, no tracking — instant in your browser.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gunmetal text-gray-100 antialiased min-h-screen selection:bg-vice-pink selection:text-white">
        <CurrentContextProvider>{children}</CurrentContextProvider>
      </body>
    </html>
  );
}
