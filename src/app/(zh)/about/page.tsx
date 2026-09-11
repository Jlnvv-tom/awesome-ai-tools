import type { Metadata } from 'next';

import { AboutView } from '@/app/about-view';
import { getDictionary } from '@/i18n/dictionaries';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const dict = getDictionary('zh').about;
  return buildMetadata({ title: dict.title, description: dict.description, path: '/about' });
}

export default function AboutPage() {
  return <AboutView locale="zh" />;
}
