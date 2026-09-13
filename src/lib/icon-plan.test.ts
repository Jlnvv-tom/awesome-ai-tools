import { describe, expect, it } from 'vitest';

import { expectedRenderMode, iconTileClass, resolveIconPlan } from '@/lib/icon-plan';

const OPENAI = { iconId: 'OpenAI', name: 'OpenAI', color: '#000000', hasColor: false };
const COPILOT = { iconId: 'Copilot', name: 'Copilot', color: '#ffffff', hasColor: true };

describe('resolveIconPlan', () => {
  it('无彩色变体时一律走 mask，不再请求必定 404 的 color 变体', () => {
    const plan = resolveIconPlan({ ...OPENAI, style: 'color' });

    expect(plan.sources).toHaveLength(2);
    expect(plan.sources.every((source) => source.mode === 'mask')).toBe(true);
    expect(plan.sources.some((source) => source.url.includes('-color'))).toBe(false);
  });

  it('有彩色变体时先尝试两个 CDN 的 color，再回退 mono', () => {
    const plan = resolveIconPlan({ ...COPILOT, style: 'color' });

    expect(plan.sources).toHaveLength(4);
    expect(plan.sources.slice(0, 2).map((source) => source.mode)).toEqual(['img', 'img']);
    expect(plan.sources.slice(2).map((source) => source.mode)).toEqual(['mask', 'mask']);
    expect(plan.sources[0].url).toContain('unpkg.com');
    expect(plan.sources[1].url).toContain('raw.githubusercontent.com');
  });

  it('单色风格下即使存在彩色变体也只用 mask', () => {
    const plan = resolveIconPlan({ ...COPILOT, style: 'mono' });

    expect(plan.sources).toHaveLength(2);
    expect(plan.sources.every((source) => source.mode === 'mask')).toBe(true);
  });

  it('mono 候选使用 kebab 后的 CDN slug', () => {
    const plan = resolveIconPlan({ ...OPENAI, style: 'mono' });

    expect(plan.sources[0].url).toBe(
      'https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openai.svg',
    );
  });

  it('兜底图是带品牌色的首字母 data URI', () => {
    const plan = resolveIconPlan({ ...OPENAI, color: '#6e56f8', style: 'mono' });

    expect(plan.fallbackUrl.startsWith('data:image/svg+xml')).toBe(true);
    expect(decodeURIComponent(plan.fallbackUrl)).toContain('#6e56f8');
  });
});

describe('iconTileClass', () => {
  it('mask 渲染跟随主题，不需要垫板', () => {
    expect(iconTileClass({ color: '#ffffff', mode: 'mask' })).toBe('bg-muted/40');
  });

  it('白色品牌色在浅色模式换深色垫板', () => {
    expect(iconTileClass({ color: '#ffffff', mode: 'img' })).toBe(
      'bg-foreground/85 dark:bg-muted/40',
    );
  });

  it('黑色品牌色在深色模式换浅色垫板', () => {
    expect(iconTileClass({ color: '#000000', mode: 'img' })).toBe(
      'bg-muted/40 dark:bg-primary-foreground/90',
    );
  });

  it('常规品牌色与兜底渲染保持默认底色', () => {
    expect(iconTileClass({ color: '#d97757', mode: 'img' })).toBe('bg-muted/40');
    expect(iconTileClass({ color: '#ffffff', mode: 'fallback' })).toBe('bg-muted/40');
  });
});

describe('expectedRenderMode', () => {
  it('取首个候选的模式，避免加载过程中垫板闪烁', () => {
    expect(expectedRenderMode(resolveIconPlan({ ...OPENAI, style: 'color' }))).toBe('mask');
    expect(expectedRenderMode(resolveIconPlan({ ...COPILOT, style: 'color' }))).toBe('img');
  });

  it('无候选时返回 fallback', () => {
    expect(expectedRenderMode({ sources: [], fallbackUrl: '' })).toBe('fallback');
  });
});

describe('resolveIconPlan · 自主收录来源', () => {
  const CATALOG = {
    iconId: 'metaso',
    name: 'Metaso',
    color: '#6e56f8',
    style: 'color' as const,
    hasColor: false,
  };

  it('favicon 来源只使用本地图标一个候选', () => {
    const plan = resolveIconPlan({
      ...CATALOG,
      iconSource: 'favicon',
      faviconUrl: '/icons/metaso.png',
    });

    expect(plan.sources).toEqual([{ url: '/icons/metaso.png', mode: 'img' }]);
    expect(expectedRenderMode(plan)).toBe('img');
  });

  it('favicon 来源在单色风格下仍保持原图（不参与单色化）', () => {
    const plan = resolveIconPlan({
      ...CATALOG,
      style: 'mono',
      iconSource: 'favicon',
      faviconUrl: '/icons/metaso.svg',
    });

    expect(plan.sources[0].mode).toBe('img');
  });

  it('initial 来源没有候选，直接用品牌色首字母块', () => {
    const plan = resolveIconPlan({ ...CATALOG, color: '#123456', iconSource: 'initial' });

    expect(plan.sources).toHaveLength(0);
    expect(expectedRenderMode(plan)).toBe('fallback');
    expect(decodeURIComponent(plan.fallbackUrl)).toContain('#123456');
  });

  it('声明 favicon 来源但缺少路径时退回图标库逻辑（防御分支）', () => {
    const plan = resolveIconPlan({
      ...OPENAI,
      style: 'color',
      iconSource: 'favicon',
      faviconUrl: undefined,
    });

    expect(plan.sources.length).toBeGreaterThan(0);
    expect(plan.sources.every((source) => source.mode === 'mask')).toBe(true);
  });
});
