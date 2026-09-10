'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['⌘', 'K'], description: '打开全局搜索（Windows 为 Ctrl + K）' },
  { keys: ['↑', '↓'], description: '在搜索结果中上下移动' },
  { keys: ['Enter'], description: '打开当前选中的工具' },
  { keys: ['Esc'], description: '关闭弹窗或搜索面板' },
  { keys: ['?'], description: '打开本快捷键总览' },
];

/** 键盘快捷键总览（? 键唤起） */
export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-base font-semibold">键盘快捷键</DialogTitle>

        <ul className="divide-y divide-border/60">
          {SHORTCUTS.map((shortcut) => (
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

        <p className="text-[11px] text-muted-foreground">
          快捷键在输入框内不会触发，避免影响正常输入。
        </p>
      </DialogContent>
    </Dialog>
  );
}
