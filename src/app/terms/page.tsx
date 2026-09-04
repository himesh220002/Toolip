import React from 'react';
import { Metadata } from 'next';
import { TermsAndPrivacyContent } from '@/components/TermsAndPrivacyContent';

export const metadata: Metadata = {
  title: 'Terms of Service — Toolip | Everyday Utilities & Productivity Tools',
  description: 'Toolip Terms of Service: Read our terms of use, content ownership, license guidelines, and open source client-side architecture specifications.',
};

export default function TermsPage() {
  return <TermsAndPrivacyContent initialTab="terms" />;
}
