import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-6xl font-bold text-primary/40">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">页面不存在</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        你访问的工具或分类可能已被移除，或者链接拼写有误。
      </p>
      <Button asChild className="mt-2">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
