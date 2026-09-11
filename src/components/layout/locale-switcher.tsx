'use client';

import { Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { localePath, type Locale } from '@/i18n/config';

/**
 * 语言切换入口：在当前路径的中文 / 英文版本之间跳转。
 *
 * 中文位于根路径，英文位于 `/en` 前缀，因此只需去掉或加上 `/en`。
 */
export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? '/';
  const target: Locale = locale === 'zh' ? 'en' : 'zh';
  const rest = pathname.replace(/^\/en(?=\/|$)/, '') || '/';

  return (
    <Button variant="ghost" size="icon" asChild aria-label={label}>
      <Link href={localePath(target, rest)}>
        <Globe className="h-4 w-4" />
      </Link>
    </Button>
  );
}
