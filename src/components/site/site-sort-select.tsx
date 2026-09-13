'use client';

import { ArrowDownWideNarrow, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';
import { SORT_KEYS, type SortKey } from '@/lib/sorting';

export interface SiteSortSelectProps {
  value: SortKey;
  onChange: (next: SortKey) => void;
  /** 无障碍与选项文案（多语言站点由字典传入） */
  labels: { group: string } & Record<SortKey, string>;
  className?: string;
}

/**
 * 排序口径切换。
 *
 * 只提供客观口径：默认权重、最新收录、GitHub Star、名称；
 * 不提供任何评价性/流量类排序（见 docs/adr/0009）。
 */
export function SiteSortSelect({ value, onChange, labels, className }: SiteSortSelectProps) {
  return (
    <div className={cn('relative flex shrink-0 items-center', className)}>
      <ArrowDownWideNarrow
        className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground"
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)}
        aria-label={labels.group}
        className="h-9 cursor-pointer appearance-none rounded-lg border border-border bg-muted/40 py-1.5 pl-8 pr-7 text-xs text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {labels[key]}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
