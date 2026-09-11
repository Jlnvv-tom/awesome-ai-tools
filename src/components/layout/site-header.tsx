'use client';

import { Github, Heart, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { IconStyleToggle } from '@/components/layout/icon-style-toggle';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useFavorites } from '@/components/personalization-provider';
import { useSearch } from '@/components/search/search-provider';
import { Button } from '@/components/ui/button';
import { DEFAULT_LOCALE, localePath, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/cn';

export interface NavItem {
  slug: string;
  name: string;
  count: number;
}

export function SiteHeader({
  navItems,
  locale = DEFAULT_LOCALE,
}: {
  navItems: NavItem[];
  locale?: Locale;
}) {
  const dict = getDictionary(locale).header;
  const { setOpen } = useSearch();
  const { count, ready } = useFavorites();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 h-16 transition-all duration-300 ease-out',
        scrolled
          ? 'border-b border-border/60 bg-background/70 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href={localePath(locale)} className="flex items-center gap-2.5" aria-label="返回首页">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="hidden text-base font-semibold tracking-tight sm:inline">
            Awesome<span className="gradient-text"> AI Tool</span>
          </span>
        </Link>

        <nav className="scrollbar-none hidden flex-1 items-center gap-1 overflow-x-auto md:flex">
          {navItems.map((item) => (
            <Link
              key={item.slug}
              href={localePath(locale, `/category/${item.slug}`)}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 pr-2 sm:inline-flex"
            onClick={() => setOpen(true)}
            aria-label={dict.searchAria}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-muted-foreground">{dict.search}</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setOpen(true)}
            aria-label={dict.searchAria}
          >
            <Search className="h-4 w-4" />
          </Button>
          <LocaleSwitcher locale={locale} label={dict.switchLanguage} />
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link
              href={localePath(locale, '/favorites')}
              aria-label={ready && count > 0 ? dict.favoritesWithCount(count) : dict.favorites}
            >
              <Heart className={cn('h-4 w-4', ready && count > 0 && 'fill-current text-primary')} />
              {ready && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] text-primary-foreground">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          </Button>
          <IconStyleToggle locale={locale} />
          <ThemeToggle locale={locale} />
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/Jlnvv-tom/awesome-ai-tools"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="在 GitHub 上查看本项目"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
