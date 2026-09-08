import { describe, expect, it } from 'vitest';

import { normalizeColor, normalizeGroup, normalizeParam, normalizeUrl } from './normalize';

describe('normalizeColor', () => {
  it('保留合法 6 位色值并转小写', () => {
    expect(normalizeColor('#D97757')).toBe('#d97757');
  });

  it('展开 3 位简写', () => {
    expect(normalizeColor('#FFF')).toBe('#ffffff');
    expect(normalizeColor('#03f')).toBe('#0033ff');
  });

  it('非法值回退到品牌主色', () => {
    expect(normalizeColor('red')).toBe('#6e56f8');
    expect(normalizeColor(undefined)).toBe('#6e56f8');
  });
});

describe('normalizeUrl', () => {
  it('保留正常地址', () => {
    expect(normalizeUrl('https://deepai.org')).toBe('https://deepai.org');
  });

  it('修正多写 h 的地址', () => {
    expect(normalizeUrl('hhttps://deepai.org')).toBe('https://deepai.org');
  });

  it('无法修正时返回空字符串', () => {
    expect(normalizeUrl('deepai.org')).toBe('');
  });
});

describe('normalizeGroup', () => {
  it('未知分组回退为 application', () => {
    expect(normalizeGroup('model')).toBe('model');
    expect(normalizeGroup('unknown')).toBe('application');
  });
});

describe('normalizeParam', () => {
  it('缺失字段补 false', () => {
    const param = normalizeParam({ hasColor: true });
    expect(param.hasColor).toBe(true);
    expect(param.hasText).toBe(false);
    expect(Object.keys(param)).toHaveLength(8);
  });
});
