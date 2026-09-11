'use client';

import { ExternalLink } from 'lucide-react';

import { useUsageStats } from '@/components/personalization-provider';
import { Button } from '@/components/ui/button';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

/**
 * 官网直达按钮：点击时记录一次外链（仅写入浏览器本地存储），用于生成「我的常用」。
 */
export function OutboundLink({
  siteId,
  url,
  name,
  locale = DEFAULT_LOCALE,
}: {
  siteId: string;
  url: string;
  name: string;
  locale?: Locale;
}) {
  const { recordOutbound } = useUsageStats();
  const dict = getDictionary(locale).outbound;

  return (
    <Button asChild size="lg">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={dict.openSite(name)}
        onClick={() => recordOutbound(siteId)}
      >
        <ExternalLink className="h-4 w-4" />
        {dict.goSite}
      </a>
    </Button>
  );
}
