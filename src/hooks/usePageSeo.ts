import { useEffect } from 'react';

export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: string;
}

export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'https://contril-ai.vercel.app';
};

export const PAGE_SEO_METADATA: Record<string, PageSeoConfig> = {
  home: {
    title: 'Contril — AI Chief of Staff | Autonomous Inbox & Task Intelligence',
    description: 'Contril is an autonomous AI Chief of Staff that synthesizes executive morning briefings, drafts context-aware email replies, and automates daily workflows across Android and Web.',
    canonicalPath: '/',
    ogType: 'website'
  },
  download: {
    title: 'Download Contril — Native Android APK & Web Chief of Staff',
    description: 'Download the native Contril Android application built with Kotlin & Jetpack Compose. Access autonomous overnight inbox triage, price comparisons, and executive briefings.',
    canonicalPath: '/download',
    ogType: 'website'
  },
  'download/android': {
    title: 'Download Contril for Android — Official Release APK (v0.2.0)',
    description: 'Get the latest verified Contril for Android APK build. Experience 100% native Jetpack Compose UI, high-priority notification triage, and offline-first local intelligence.',
    canonicalPath: '/download',
    ogType: 'website'
  },
  about: {
    title: 'About Contril — Autonomous Executive Intelligence',
    description: 'Learn how Contril transforms executive workflows with autonomous intelligence, transparent action approvals, and proactive context synthesis across personal workspace tools.',
    canonicalPath: '/about',
    ogType: 'website'
  },
  features: {
    title: 'Contril Architecture & Features — Zero-Friction Chief of Staff',
    description: 'Explore Contril features: AI Inbox triage, Google Workspace integration, 30-day auto-purge activity auditing, real-time retail price comparison, and executive briefings.',
    canonicalPath: '/features',
    ogType: 'website'
  },
  privacy: {
    title: 'Privacy Policy — Contril AI Chief of Staff',
    description: 'Read Contril privacy policy and data governance practices. Disclosing Google API Limited Use compliance, Gemini AI processing, and 30-day retention policies.',
    canonicalPath: '/privacy',
    ogType: 'website'
  },
  terms: {
    title: 'Terms of Service — Contril AI Chief of Staff',
    description: 'Review the Terms of Service for Contril AI Chief of Staff, covering tiered subscription plans, 24-hour review process, refund policy, and AI output disclaimers.',
    canonicalPath: '/terms',
    ogType: 'website'
  }
};

export function usePageSeo(route: string) {
  useEffect(() => {
    const config = PAGE_SEO_METADATA[route] || PAGE_SEO_METADATA.home;
    const fullCanonicalUrl = `${getBaseUrl()}${config.canonicalPath || '/'}`;

    // 1. Update Title
    document.title = config.title;

    // 2. Update or Create Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', config.description);

    // 3. Update or Create Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 4. Update OpenGraph Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', config.title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', config.description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', fullCanonicalUrl);

    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', config.title);

    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', config.description);

  }, [route]);
}
