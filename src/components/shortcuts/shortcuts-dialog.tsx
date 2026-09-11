'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

/** 键盘快捷键总览（? 键唤起） */
export function ShortcutsDialog({
  open,
  onOpenChange,
  locale = DEFAULT_LOCALE,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale?: Locale;
}) {
  const dict = getDictionary(locale).shortcuts;

  const items = [
    { keys: ['⌘', 'K'], description: dict.openSearch },
    { keys: ['↑', '↓'], description: dict.move },
    { keys: ['Enter'], description: dict.open },
    { keys: ['Esc'], description: dict.close },
    { keys: ['?'], description: dict.openThis },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-base font-semibold">{dict.title}</DialogTitle>

        <ul className="divide-y divide-border/60">
          {items.map((shortcut) => (
            <li
              key={shortcut.description}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <span className="flex shrink-0 items-center gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-[11px] text-muted-foreground">{dict.note}</p>
      </DialogContent>
    </Dialog>
  );
}
