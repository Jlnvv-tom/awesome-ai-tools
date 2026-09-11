import { NotFoundView } from '@/app/not-found-view';

/** 中文分支的 404：由 (zh) 布局包裹，保留顶栏与页脚 */
export default function ZhNotFound() {
  return <NotFoundView locale="zh" />;
}
