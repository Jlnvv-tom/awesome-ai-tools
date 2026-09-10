'use client';

import { useEffect, useRef } from 'react';

import { useUsageStats } from '@/components/personalization-provider';

/**
 * 详情页访问埋点：进入页面时记录一次（仅写入浏览器本地存储）。
 *
 * 用 ref 持有最新回调，保证 effect 只随 `siteId` 执行，避免统计更新触发重复写入。
 */
export function VisitTracker({ siteId }: { siteId: string }) {
  const { recordVisit } = useUsageStats();
  const recordRef = useRef(recordVisit);
  recordRef.current = recordVisit;

  useEffect(() => {
    recordRef.current(siteId);
  }, [siteId]);

  return null;
}
