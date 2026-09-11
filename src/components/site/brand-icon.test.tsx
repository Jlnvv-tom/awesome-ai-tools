import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BrandIcon } from '@/components/site/brand-icon';
import { SiteIconTile } from '@/components/site/site-icon-tile';

/** OpenAI 没有彩色变体（上游 `openai-color.svg` 404），必须走 mask 渲染 */
const OPENAI = { iconId: 'OpenAI', name: 'OpenAI', color: '#000000', hasColor: false };
/** Copilot 有彩色变体，品牌色为纯白，必须走 img 渲染并加深色垫板 */
const COPILOT = { iconId: 'Copilot', name: 'Copilot', color: '#ffffff', hasColor: true };

describe('BrandIcon', () => {
  it('无彩色变体时渲染 mask + currentColor，而不是纯黑图片', () => {
    const { container } = render(<BrandIcon {...OPENAI} size={26} />);
    const mask = container.querySelector('span > span') as HTMLElement;

    expect(mask).not.toBeNull();
    // CSS 关键字大小写不敏感，jsdom 会规范化为小写
    expect(mask.style.backgroundColor).toMatch(/^currentcolor$/i);
    // 颜色来源：外壳显式声明文字色令牌 —— body 未设 text-foreground，缺少它会退回浏览器默认黑
    expect(container.firstElementChild?.className).toContain('text-foreground');
    // 注：jsdom 不实现 mask-image 属性，因此 mask 的 URL 由下方的隐藏探测图断言兜底
    expect(mask.className).toContain('transition-colors');
  });

  it('有彩色变体时直接渲染品牌原色图片', () => {
    const { container } = render(<BrandIcon {...COPILOT} size={26} />);
    const img = container.querySelector('img') as HTMLImageElement;

    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toContain('copilot-color.svg');
  });

  it('mask 分支挂载隐藏探测图，用于感知 CDN 失败（同 URL 走缓存）', () => {
    const { container } = render(<BrandIcon {...OPENAI} size={26} />);
    const probe = Array.from(container.querySelectorAll('img')).find((node) =>
      node.className.includes('opacity-0'),
    );

    expect(probe).toBeDefined();
    expect(probe?.getAttribute('src')).toContain('/icons/openai.svg');
  });

  it('装饰性图标不进入无障碍树', () => {
    const { container } = render(<BrandIcon {...COPILOT} size={26} />);

    expect(container.querySelector('img')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
  });
});

describe('SiteIconTile', () => {
  it('白色品牌色的图片渲染换成深色垫板', () => {
    const { container } = render(<SiteIconTile {...COPILOT} size="md" />);
    const tile = container.firstElementChild as HTMLElement;

    expect(tile.className).toContain('bg-foreground/85');
    expect(tile.style.boxShadow).toContain('#ffffff');
  });

  it('跟随主题的 mask 渲染不需要额外垫板', () => {
    const { container } = render(<SiteIconTile {...OPENAI} size="md" />);
    const tile = container.firstElementChild as HTMLElement;

    expect(tile.className).toContain('bg-muted/40');
    expect(tile.className).not.toContain('bg-foreground');
  });

  it('卡片档位 44px、列表档位 40px、详情页档位 80px', () => {
    const sizes = { sm: 'h-10', md: 'h-11', lg: 'h-20' } as const;

    for (const [size, expected] of Object.entries(sizes)) {
      const { container } = render(<SiteIconTile {...OPENAI} size={size as keyof typeof sizes} />);
      expect(container.firstElementChild?.className).toContain(expected);
    }
  });
});
