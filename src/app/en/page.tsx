import { HomeView } from '@/app/home-view';
import { getAllSites } from '@/lib/sites';
import { buildCollectionJsonLd, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

export const revalidate = 3600;

export default function EnHomePage() {
  const sites = getAllSites();

  return (
    <>
      <HomeView locale="en" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCollectionJsonLd(sites, SITE_NAME, SITE_DESCRIPTION)),
        }}
      />
    </>
  );
}
