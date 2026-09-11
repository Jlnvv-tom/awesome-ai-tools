import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { DEFAULT_LOCALE, localePath, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

/** 404 共享视图：中英文分支各自渲染，保证顶栏与页脚一致 */
export function NotFoundView({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const dict = getDictionary(locale).notFound;

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-6xl font-bold text-primary/40">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{dict.title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{dict.description}</p>
      <Button asChild className="mt-2">
        <Link href={localePath(locale)}>{dict.backHome}</Link>
      </Button>
    </div>
  );
}
