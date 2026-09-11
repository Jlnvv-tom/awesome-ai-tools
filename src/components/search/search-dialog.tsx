'use client';

import { ArrowUpRight, Heart, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useFavorites } from '@/components/personalization-provider';
import { BrandIcon } from '@/components/site/brand-icon';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CATEGORIES } from '@/data/registry';
import { DEFAULT_LOCALE, localePath, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/cn';
import { loadSearchDocs, searchDocs } from '@/lib/search';
import { getCategoryName } from '@/lib/sites';
import type { SearchDoc } from '@/types/site';

export function SearchDialog({
  open,
  onOpenChange,
  locale = DEFAULT_LOCALE,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale?: Locale;
}) {
  const dict = getDictionary(locale).search;

  /** 分类 slug → 当前语言分类名 */
  const categoryLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of CATEGORIES) map.set(category.slug, getCategoryName(category, locale));
    return map;
  }, [locale]);
  const [query, setQuery] = useState('');
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { has, count } = useFavorites();

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
    const matched = searchDocs(docs, query, 30);
    return onlyFavorites ? matched.filter((doc) => has(doc.id)) : matched;
  }, [docs, query, onlyFavorites, has]);

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
      window.location.href = localePath(locale, `/site/${results[activeIndex].id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="sr-only">{dict.dialogTitle}</DialogTitle>

        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={dict.placeholder}
            aria-label={dict.ariaLabel}
            className="h-7 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {!docs && !error && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {error && <p className="px-3 py-6 text-center text-sm text-destructive">{error}</p>}

          {!error && !docs && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{dict.loading}</p>
          )}

          {docs && onlyFavorites && results.length === 0 && (
            <div className="px-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {query.trim() ? dict.favoriteEmptyWithQuery : dict.favoriteEmpty}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{dict.favoriteHint}</p>
            </div>
          )}

          {docs && !onlyFavorites && query.trim() && results.length === 0 && (
            <div className="px-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">{dict.noResult(query)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{dict.noResultHint}</p>
            </div>
          )}

          {docs && results.length > 0 && (
            <ul className="space-y-0.5">
              {results.map((doc, index) => (
                <li key={doc.id}>
                  <Link
                    href={localePath(locale, `/site/${doc.id}`)}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                      index === activeIndex ? 'bg-primary/15' : 'hover:bg-muted',
                    )}
                  >
                    <BrandIcon iconId={doc.id} name={doc.name} color="#6e56f8" size={26} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {locale === 'en' ? doc.name : (doc.nameCn ?? doc.name)}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {categoryLabels.get(doc.category) ?? doc.category}
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
              {dict.startTyping}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-2.5 text-[11px] text-muted-foreground">
          <span>{dict.hintKeys}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOnlyFavorites((value) => !value)}
              aria-pressed={onlyFavorites}
              className={cn(
                'flex items-center gap-1 rounded-full border px-2 py-0.5 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                onlyFavorites
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-border hover:bg-muted hover:text-foreground',
              )}
            >
              <Heart className={cn('h-3 w-3', onlyFavorites && 'fill-current')} />
              {dict.onlyFavorites}
              {count > 0 ? ` ${count}` : ''}
            </button>
            <span>{docs ? dict.toolsCount(docs.length) : dict.loading}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
