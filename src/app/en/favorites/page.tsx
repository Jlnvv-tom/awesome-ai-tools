import type { Metadata } from 'next';

import { FavoritesView } from '@/app/favorites-view';
import { getDictionary } from '@/i18n/dictionaries';
import { getAllSites } from '@/lib/sites';

export const metadata: Metadata = {
  title: getDictionary('en').favoritesPage.title,
  description: getDictionary('en').favoritesPage.description,
  robots: { index: false, follow: true },
};

export default function EnFavoritesPage() {
  return <FavoritesView sites={getAllSites()} locale="en" />;
}
