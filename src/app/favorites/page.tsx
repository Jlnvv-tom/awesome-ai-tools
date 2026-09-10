import type { Metadata } from 'next';

import { FavoritesView } from '@/app/favorites/favorites-view';
import { getAllSites } from '@/lib/sites';

/** 收藏内容因人而异且仅存本地，不参与索引 */
export const metadata: Metadata = {
  title: '我的收藏',
  description: '本地保存的收藏工具，仅在本浏览器可见。',
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return <FavoritesView sites={getAllSites()} />;
}
