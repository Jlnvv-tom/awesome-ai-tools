import { SEARCH_INDEX } from '@/data/search-index.generated';

/**
 * 搜索索引以静态资源形式输出，客户端按需拉取，不进入首屏 JS。
 *
 * 无查询参数，因此保持 `force-static`：构建期直接生成静态响应，
 * Cloudflare Pages 作为静态资源托管，无需 Edge 函数
 * （注意 `force-static` 与 `runtime = 'edge'` 互斥，二者只能取其一）。
 */
export const dynamic = 'force-static';

export function GET() {
  return Response.json(SEARCH_INDEX, {
    headers: {
      'cache-control': 'public, max-age=3600, s-maxage=86400',
      'access-control-allow-origin': '*',
    },
  });
}
