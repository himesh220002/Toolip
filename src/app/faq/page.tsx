import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HelpCircle, ArrowLeft, Shield, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) — Toolip Platform',
  description: 'Find answers to common questions about Toolip 100% client-side security, zero data retention, local storage persistence, and free productivity tools.',
};

const MAIN_FAQS = [
  {
    q: 'What is Toolip and how does it work?',
    a: 'Toolip is a suite of 31+ free client-side web utility applications. Processing occurs natively inside your web browser using HTML5, WebAssembly, and JavaScript APIs without sending data to external servers.',
  },
  {
    q: 'Does Toolip upload my files or private inputs to any server?',
    a: 'No. Toolip has a 100% client-side zero-telemetry guarantee. Your PDFs, image scans, notes, financial data, and checklists remain strictly on your local computer or mobile device.',
  },
  {
    q: 'How does local storage cache persistence work?',
    a: 'To prevent losing your active work when refreshing or closing browser tabs, Toolip saves active drafts to your browser\'s native localStorage. You can clear this cache at any time using the "Reset" button on any tool.',
  },
  {
    q: 'Are Toolip tools completely free?',
    a: 'Yes, 100% free with zero mandatory account sign-ups, subscriptions, or paywalls.',
  },
  {
    q: 'Can I use Toolip on mobile devices?',
    a: 'Yes! Toolip is built to be fully responsive across mobile phones, tablets, laptops, and desktop monitors.',
  },
  {
    q: 'How do I request a new tool or report an issue?',
    a: 'You can submit feedback or new tool ideas directly through our Contact Us page or by emailing support@toolip.app.',
  },
];

export default function FaqPage() {
  const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: MAIN_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-gunmetal text-white selection:bg-halo-cyan selection:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
      />
      <div className="h-[2px] w-full bg-gradient-to-r from-halo-cyan via-vice-pink to-vice-orange" />
      <Navbar />

      <main className="flex-1 max-w-[1180px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div className="relative clip-chamfer p-[1.5px] bg-gradient-to-br from-halo-cyan/40 via-white/10 to-vice-pink/30 shadow-halo">
          <div className="relative clip-chamfer bg-gradient-to-br from-gunmetal-800 via-gunmetal-900 to-[#05070F] p-6 sm:p-10 space-y-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex items-center gap-1 text-xs font-mono text-halo-cyan hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Home
              </Link>
              <span className="text-white/20">•</span>
              <span className="px-2 py-0.5 bg-halo-cyan/10 border border-halo-cyan/30 text-halo-cyan clip-chamfer-sm font-mono text-[9px] font-bold uppercase">
                Platform Knowledge Base
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl tracking-wide uppercase text-white leading-none">
              Frequently Asked Questions
            </h1>
            <p className="font-tech text-base text-white/70 max-w-2xl leading-relaxed">
              Everything you need to know about Toolip client-side technology, privacy guarantees, and usage.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {MAIN_FAQS.map((faq, idx) => (
            <div key={idx} className="clip-chamfer bg-gunmetal-800/40 border border-white/10 p-6 space-y-2">
              <h3 className="font-tech text-lg font-bold text-halo-cyan flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-halo-cyan shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="font-sans text-sm text-gray-300 leading-relaxed pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
