import type { Metadata } from 'next';

import type { Category, Site } from '@/types/site';

export const SITE_NAME = 'Awesome AI Tool';
export const SITE_TAGLINE = '收录 300+ AI 工具官网的开源导航站';
export const SITE_DESCRIPTION =
  '基于 LobeHub Icons 构建的 AI 工具导航站，收录全球主流 AI 模型、应用与云服务平台，支持分类浏览、即时搜索与社区共建。';

/** 站点根地址，部署到 Vercel 时可用 VERCEL_URL / NEXT_PUBLIC_SITE_URL 覆盖 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (!raw) return 'https://awesome-ai-tool.vercel.app';
  return raw.startsWith('http') ? raw : `https://${raw}`;
}

export function buildMetadata(options: {
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  const { title, description = SITE_DESCRIPTION, path = '/' } = options;
  const url = new URL(path, getSiteUrl()).toString();

  return {
    title: title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · ${SITE_TAGLINE}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: title ?? SITE_NAME,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: title ?? SITE_NAME,
      description,
    },
  };
}

/** 站点详情页结构化数据（SoftwareApplication） */
export function buildSiteJsonLd(site: Site, category?: Category) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: site.nameCn ?? site.name,
    applicationCategory: category?.nameEn ?? 'AIApplication',
    operatingSystem: 'Web',
    url: site.url,
    description: site.description,
    keywords: site.tags.join(', '),
  };
}

/** 首页 / 分类页结构化数据（CollectionPage + ItemList） */
export function buildCollectionJsonLd(items: Site[], name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.slice(0, 60).map((site, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: site.nameCn ?? site.name,
        url: site.url,
      })),
    },
  };
}
