import { NotFoundView } from '@/app/not-found-view';

/** 英文分支的 404：由 en 布局包裹，保留顶栏与页脚 */
export default function EnNotFound() {
  return <NotFoundView locale="en" />;
}
