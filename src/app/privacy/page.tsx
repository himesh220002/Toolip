import React from 'react';
import { Metadata } from 'next';
import { TermsAndPrivacyContent } from '@/components/TermsAndPrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy — Toolip | 100% Client-Side Privacy Guarantee',
  description: 'Toolip Privacy Policy: Learn how all tools run 100% locally in your browser with zero server uploads, zero tracking cookies, and complete local cache control.',
};

export default function PrivacyPage() {
  return <TermsAndPrivacyContent initialTab="privacy" />;
}
