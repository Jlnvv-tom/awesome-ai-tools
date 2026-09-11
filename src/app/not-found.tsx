import { NotFoundView } from '@/app/not-found-view';

/**
 * 根级 404（未匹配任何语言分支时）：
 * 内容与语言分支一致，但不含顶栏与页脚（根布局只提供外壳）。
 */
export default function NotFound() {
  return <NotFoundView locale="zh" />;
}
