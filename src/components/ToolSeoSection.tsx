'use client';

import React, { useState } from 'react';
import { Shield, CheckCircle2, ChevronDown, ChevronUp, BookOpen, HelpCircle, Sparkles, Check } from 'lucide-react';
import { ToolSeoInfo } from '@/lib/seoData';

interface Props {
  seoData: ToolSeoInfo;
  toolTitle: string;
}

export const ToolSeoSection: React.FC<Props> = ({ seoData, toolTitle }) => {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Generate Schema.org JSON-LD structured data for FAQPage
  const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seoData.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // Generate Schema.org JSON-LD structured data for WebApplication
  const webAppSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: toolTitle,
    url: `https://toolip.app/tools/${seoData.id}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires HTML5 and JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'Toolip',
      url: 'https://toolip.app',
    },
  };

  return (
    <section className="mt-12 space-y-10 pt-8 border-t border-white/10">
      {/* Embed JSON-LD Structured Data Scripts for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchemaData) }}
      />

      {/* 600+ Word Detailed Article Section */}
      <div className="relative clip-chamfer p-[1.5px] bg-gradient-to-br from-halo-cyan/30 via-white/5 to-vice-pink/20">
        <div className="relative clip-chamfer bg-gradient-to-br from-gunmetal-800 via-gunmetal-900 to-[#060913] p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-halo-cyan uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>Comprehensive User Guide & Technical Overview</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide uppercase">
            {seoData.articleContent.heading}
          </h2>

          {/* Article Paragraphs */}
          <div className="space-y-4 text-sm sm:text-[15px] font-sans text-gray-300 leading-relaxed">
            {seoData.articleContent.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Key Use Cases Grid */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="font-tech text-base font-bold text-halo-cyan flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-halo-cyan" /> Key Practical Use Cases
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {seoData.articleContent.useCases.map((useCase, idx) => (
                <div
                  key={idx}
                  className="p-3.5 clip-chamfer bg-black/40 border border-white/10 text-xs font-mono text-gray-300 space-y-1"
                >
                  <div className="text-emerald-400 font-bold">Use Case #{idx + 1}</div>
                  <div>{useCase}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="font-tech text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> How to Use {toolTitle} Step-by-Step
            </h3>
            <ol className="space-y-2">
              {seoData.articleContent.howToSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 clip-chamfer-sm bg-white/[0.03] border border-white/10 font-mono text-xs text-gray-200"
                >
                  <span className="h-5 w-5 rounded bg-halo-cyan text-gunmetal-900 font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Privacy Guarantee Badge */}
          <div className="p-4 clip-chamfer bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs font-mono text-emerald-300">
            <Shield className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <strong>100% Client-Side Privacy Guarantee:</strong> All processing, calculations, and conversions for {toolTitle} are executed locally inside your web browser. No files, code, or personal data are ever uploaded to any remote server.
            </div>
          </div>
        </div>
      </div>

      {/* SEO FAQ Section with JSON-LD Structured Data */}
      <div className="clip-chamfer bg-gunmetal-800/60 border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-halo-cyan uppercase tracking-wider">
            <HelpCircle className="h-4 w-4" />
            <span>Frequently Asked Questions (FAQ)</span>
          </div>
          <span className="font-mono text-[10px] text-white/40">{seoData.faqs.length} Answers</span>
        </div>

        <div className="space-y-3">
          {seoData.faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={idx}
                className="clip-chamfer-sm border border-white/10 overflow-hidden transition-all bg-black/30"
              >
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left font-tech text-sm sm:text-base font-bold text-white hover:text-halo-cyan transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-halo-cyan font-mono text-xs">Q{idx + 1}.</span>
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-halo-cyan shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/40 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 font-sans text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 bg-white/[0.02]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
