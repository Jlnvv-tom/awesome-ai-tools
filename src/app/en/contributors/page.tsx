import type { Metadata } from 'next';

import { ContributorsView } from '@/app/contributors-view';
import { getDictionary } from '@/i18n/dictionaries';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const dict = getDictionary('en').contributorsPage;
  return buildMetadata({ title: dict.title, description: dict.description, path: '/contributors' });
}

export default function EnContributorsPage() {
  return <ContributorsView locale="en" />;
}
