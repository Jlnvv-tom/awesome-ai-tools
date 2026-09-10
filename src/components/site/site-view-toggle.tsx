'use client';

import { LayoutGrid, Rows3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { ViewMode } from '@/lib/view-mode';

export interface SiteViewToggleProps {
  view: ViewMode;
  onChange: (next: ViewMode) => void;
  className?: string;
}

/** 网格 / 列表视图切换（首页、分类页、收藏页共用） */
export function SiteViewToggle({ view, onChange, className }: SiteViewToggleProps) {
  return (
    <div
      className={cn('flex shrink-0 items-center gap-1', className)}
      role="group"
      aria-label="切换列表显示方式"
    >
      <Button
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onChange('grid')}
        aria-pressed={view === 'grid'}
        aria-label="网格视图"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onChange('list')}
        aria-pressed={view === 'list'}
        aria-label="列表视图"
      >
        <Rows3 className="h-4 w-4" />
      </Button>
    </div>
  );
}
