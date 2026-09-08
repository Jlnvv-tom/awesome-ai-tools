import { SiteCard } from '@/components/site/site-card';
import type { Site } from '@/types/site';

export function SiteGrid({ sites, showTags = true }: { sites: Site[]; showTags?: boolean }) {
  if (sites.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} showTags={showTags} />
      ))}
    </div>
  );
}
