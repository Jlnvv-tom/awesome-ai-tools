import { HomeView } from '@/app/home-view';
import { getAllSites } from '@/lib/sites';
import { buildCollectionJsonLd, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

/** 中文首页为静态生成，每小时增量更新一次 */
export const revalidate = 3600;

export default function HomePage() {
  const sites = getAllSites();

  return (
    <>
      <HomeView locale="zh" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCollectionJsonLd(sites, SITE_NAME, SITE_DESCRIPTION)),
        }}
      />
    </>
  );
}
