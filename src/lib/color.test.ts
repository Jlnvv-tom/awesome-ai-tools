import { describe, expect, it } from 'vitest';

import { colorTone, hexToRgb, relativeLuminance } from '@/lib/color';

describe('hexToRgb', () => {
  it('解析 6 位 hex', () => {
    expect(hexToRgb('#6e56f8')).toEqual({ r: 110, g: 86, b: 248 });
  });

  it('把 3 位缩写展开为完整分量', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('忽略大小写与井号前缀', () => {
    expect(hexToRgb('D97757')).toEqual({ r: 217, g: 119, b: 87 });
  });

  it('非法输入返回 null', () => {
    expect(hexToRgb('rebeccapurple')).toBeNull();
    expect(hexToRgb('')).toBeNull();
    expect(hexToRgb('#12345')).toBeNull();
  });
});

describe('relativeLuminance', () => {
  it('黑与白取到两极', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });

  it('越接近白亮度越高', () => {
    const light = relativeLuminance('#e8e8e8');
    const mid = relativeLuminance('#999999');
    const dark = relativeLuminance('#333333');
    expect(light).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(dark);
  });

  it('非法颜色返回 NaN', () => {
    expect(relativeLuminance('nope')).toBeNaN();
  });
});

describe('colorTone', () => {
  it('白色品牌色归为 light（浅色模式需要深色垫板）', () => {
    expect(colorTone('#ffffff')).toBe('light');
    expect(colorTone('#f5f5f7')).toBe('light');
  });

  it('黑色品牌色归为 dark（深色模式需要浅色垫板）', () => {
    expect(colorTone('#000000')).toBe('dark');
    expect(colorTone('#333333')).toBe('dark');
  });

  it('常见品牌色归为 normal（无需垫板）', () => {
    expect(colorTone('#d97757')).toBe('normal');
    expect(colorTone('#00a4ef')).toBe('normal');
    expect(colorTone('#999999')).toBe('normal');
  });

  it('无法解析时保守归为 normal', () => {
    expect(colorTone('nope')).toBe('normal');
  });
});
