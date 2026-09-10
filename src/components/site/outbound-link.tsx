'use client';

import { ExternalLink } from 'lucide-react';

import { useUsageStats } from '@/components/personalization-provider';
import { Button } from '@/components/ui/button';

/**
 * 官网直达按钮：点击时记录一次外链（仅写入浏览器本地存储），用于生成「我的常用」。
 */
export function OutboundLink({ siteId, url, name }: { siteId: string; url: string; name: string }) {
  const { recordOutbound } = useUsageStats();

  return (
    <Button asChild size="lg">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`在新窗口打开 ${name} 官网`}
        onClick={() => recordOutbound(siteId)}
      >
        <ExternalLink className="h-4 w-4" />
        前往官网
      </a>
    </Button>
  );
}
