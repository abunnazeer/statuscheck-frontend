import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InfoPage from '@/components/site/InfoPage';
import { sitePages } from '@/lib/site-pages';

interface SiteRouteProps {
  params: {
    slug: string;
  };
}

export function generateMetadata({ params }: SiteRouteProps): Metadata {
  const page = sitePages[params.slug];

  if (!page) {
    return {
      title: 'Page Not Found - StatusCheck',
    };
  }

  return {
    title: `${page.title} - StatusCheck`,
    description: page.subtitle,
  };
}

export default function SiteRoutePage({ params }: SiteRouteProps) {
  const page = sitePages[params.slug];

  if (!page) {
    notFound();
  }

  return (
    <InfoPage
      title={page.title}
      subtitle={page.subtitle}
      lastUpdated={page.lastUpdated}
      sections={page.sections}
      cta={page.cta}
    />
  );
}
