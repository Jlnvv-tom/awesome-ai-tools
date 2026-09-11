/**
 * 品牌色工具：WCAG 相对亮度与色系归类。
 *
 * 用途：判断一个图标所属品牌的明暗倾向，供图标容器决定是否需要「对比垫板」——
 * 浅色模式下的白色图标（Azure、Copilot）与深色模式下的黑色图标都会融进背景，
 * 只有外加一层反向底色的垫板才能保证任意主题下都可见。
 */

/** 色系归类：light 需要深色垫板，dark 需要浅色垫板，normal 保持原样 */
export type Tone = 'light' | 'dark' | 'normal';

/** 相对亮度阈值（0 黑 ~ 1 白），取值参考常见品牌色的分布边界 */
const LIGHT_THRESHOLD = 0.8;
const DARK_THRESHOLD = 0.15;

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** hex → RGB；支持 3 位与 6 位写法，非法输入返回 null 由调用方兜底 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const matched = HEX_PATTERN.exec(hex.trim());
  if (!matched) return null;

  const raw = matched[1];
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => char + char)
          .join('')
      : raw;

  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

/** sRGB 分量线性化（WCAG 2.1） */
function linearize(value: number): number {
  const ratio = value / 255;
  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
}

/** 相对亮度（0 纯黑 ~ 1 纯白），非法颜色返回 NaN */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return Number.NaN;

  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b);
}

/** 按相对亮度归类色系；无法解析时保守归为 normal（不加垫板） */
export function colorTone(hex: string): Tone {
  const luminance = relativeLuminance(hex);
  if (Number.isNaN(luminance)) return 'normal';
  if (luminance >= LIGHT_THRESHOLD) return 'light';
  if (luminance <= DARK_THRESHOLD) return 'dark';
  return 'normal';
}
