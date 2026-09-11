import type { Metadata } from 'next';

import { FavoritesView } from '@/app/favorites-view';
import { getDictionary } from '@/i18n/dictionaries';
import { getAllSites } from '@/lib/sites';

export const metadata: Metadata = {
  title: getDictionary('zh').favoritesPage.title,
  description: getDictionary('zh').favoritesPage.description,
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return <FavoritesView sites={getAllSites()} locale="zh" />;
}
