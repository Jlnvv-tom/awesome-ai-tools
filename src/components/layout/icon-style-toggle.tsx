'use client';

import { Circle, Palette } from 'lucide-react';

import { useIconStyle } from '@/components/personalization-provider';
import { Button } from '@/components/ui/button';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

/**
 * 图标风格切换（顶栏）：彩色（品牌原色）与单色（跟随主题明暗）二选一。
 *
 * 偏好由 `PersonalizationProvider` 统一下发，切换后全站图标立即重渲染，无需刷新。
 */
export function IconStyleToggle({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const dict = getDictionary(locale).iconStyle;
  const { style, toggle, ready } = useIconStyle();
  // 本地偏好未就绪时保持服务端首屏的默认形态（彩色），避免 hydration 不一致
  const isMono = ready && style === 'mono';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isMono ? dict.toColor : dict.toMono}
      onClick={toggle}
    >
      {isMono ? <Circle className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
    </Button>
  );
}
