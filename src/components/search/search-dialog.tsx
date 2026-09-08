'use client';

import { ArrowUpRight, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BrandIcon } from '@/components/site/brand-icon';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/cn';
import { loadSearchDocs, searchDocs } from '@/lib/search';
import type { SearchDoc } from '@/types/site';

const CATEGORY_LABELS: Record<string, string> = {
  chat: 'AI 对话助手',
  code: 'AI 编程开发',
  image: '图像与设计',
  video: '视频与音频',
  agent: 'Agent 与自动化',
  search: '搜索与知识',
  writing: '写作与办公',
  opensource: '开源与社区',
  infra: '云平台与基础设施',
  model: '大模型与 API',
};

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || docs) return;
    let cancelled = false;
    loadSearchDocs()
      .then((loaded) => {
        if (!cancelled) setDocs(loaded);
      })
      .catch((cause: Error) => {
        if (!cancelled) setError(cause.message);
      });
    return () => {
      cancelled = true;
    };
  }, [open, docs]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!docs) return [];
    return searchDocs(docs, query, 30);
  }, [docs, query]);

  useEffect(() => setActiveIndex(0), [query]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        results.length ? (index - 1 + results.length) % results.length : 0,
      );
    } else if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      onOpenChange(false);
      window.location.href = `/site/${results[activeIndex].id}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="sr-only">搜索 AI 工具</DialogTitle>

        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索工具名称、标签或简介…"
            aria-label="搜索 AI 工具"
            className="h-7 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {!docs && !error && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {error && <p className="px-3 py-6 text-center text-sm text-destructive">{error}</p>}

          {!error && !docs && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">正在加载索引…</p>
          )}

          {docs && query.trim() && results.length === 0 && (
            <div className="px-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">没有匹配「{query}」的工具</p>
              <p className="mt-1 text-xs text-muted-foreground">
                换个关键词试试，或到 GitHub 提交收录申请
              </p>
            </div>
          )}

          {docs && results.length > 0 && (
            <ul className="space-y-0.5">
              {results.map((doc, index) => (
                <li key={doc.id}>
                  <Link
                    href={`/site/${doc.id}`}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                      index === activeIndex ? 'bg-primary/15' : 'hover:bg-muted',
                    )}
                  >
                    <BrandIcon iconId={doc.id} name={doc.name} color="#6e56f8" size={26} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {doc.nameCn ?? doc.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {CATEGORY_LABELS[doc.category] ?? doc.category}
                        </span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{doc.description}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {docs && !query.trim() && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              输入关键词开始搜索，支持名称、中文名、标签与简介
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-5 py-2.5 text-[11px] text-muted-foreground">
          <span>↑↓ 选择 · Enter 打开 · Esc 关闭</span>
          <span>{docs ? `${docs.length} 个工具可检索` : '加载中'}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
