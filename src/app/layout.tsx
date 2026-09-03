import type { Metadata } from 'next';
import './globals.css';
import { CurrentContextProvider } from '@/context/CurrentContext';

export const metadata: Metadata = {
  title: 'Toolip - 19 Everyday Internet Utilities & Developer Tools',
  description:
    'Free online utility tools: PDF merger, image compressor, QR code generator, loan EMI calculator, word counter, password generator, age calculator, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAF8F5] text-gray-900 antialiased min-h-screen">
        <CurrentContextProvider>{children}</CurrentContextProvider>
      </body>
    </html>
  );
}
