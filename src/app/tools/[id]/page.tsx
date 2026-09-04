import React from 'react';
import { Metadata } from 'next';
import { INITIAL_TOOLS } from '@/lib/toolsData';
import { getToolSeoData, DEFAULT_SITE_CONFIG } from '@/lib/seoData';
import { ToolDetailClient } from '@/components/ToolDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return INITIAL_TOOLS.map((tool) => ({
    id: tool.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const toolId = resolvedParams.id;
  const tool = INITIAL_TOOLS.find((t) => t.id === toolId);

  if (!tool) {
    return {
      title: 'Tool Not Found — Toolip',
      description: 'The requested utility tool was not found on Toolip.',
    };
  }

  const seoData = getToolSeoData(tool.id, tool.title, tool.description, tool.category);
  const canonicalUrl = `${DEFAULT_SITE_CONFIG.baseUrl}/tools/${tool.id}`;

  return {
    title: seoData.metaTitle,
    description: seoData.metaDescription,
    keywords: [seoData.primaryKeyword, ...seoData.supportingKeywords, ...tool.seoKeywords],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoData.metaTitle,
      description: seoData.metaDescription,
      url: canonicalUrl,
      siteName: DEFAULT_SITE_CONFIG.name,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.metaTitle,
      description: seoData.metaDescription,
    },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const toolId = resolvedParams.id;
  const initialTool = INITIAL_TOOLS.find((t) => t.id === toolId);

  return <ToolDetailClient toolId={toolId} initialTool={initialTool} />;
}
