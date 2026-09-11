'use client';

import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SearchDialog } from '@/components/search/search-dialog';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';

interface SearchContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch 必须在 SearchProvider 内使用');
  return context;
}

/** 全局搜索：提供 ⌘K / Ctrl+K 唤起能力，并在打开时才加载索引 */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Provider 位于根布局，无法接收 locale 参数，按路径前缀判断语言
  const locale: Locale = pathname?.startsWith('/en') ? 'en' : DEFAULT_LOCALE;

  const toggle = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  const value = useMemo<SearchContextValue>(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchDialog open={open} onOpenChange={setOpen} locale={locale} />
    </SearchContext.Provider>
  );
}
