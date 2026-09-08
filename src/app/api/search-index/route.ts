import { SEARCH_INDEX } from '@/data/search-index.generated';

/** 搜索索引以静态资源形式输出，客户端按需拉取，不进入首屏 JS */
export const dynamic = 'force-static';

export function GET() {
  return Response.json(SEARCH_INDEX, {
    headers: { 'cache-control': 'public, max-age=3600, s-maxage=86400' },
  });
}
