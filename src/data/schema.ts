import { z } from 'zod';

/**
 * 运行时数据校验（SDD 的 Schema 层）。
 *
 * 与 `src/types/site.ts` 一一对应，且必须与 `docs/spec/10-data-model.md` 保持一致。
 * 修改任一处，都要同步另外两处。
 */

export const HEX_COLOR = /^#[0-9a-f]{6}$/;
export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const TRACKING_PARAMS = ['utm_', 'ref=', 'ref_', 'aff', 'spm', 'from=', 'share_'];

export const IconGroupSchema = z.enum(['model', 'provider', 'application']);

export const IconVariantFlagsSchema = z.object({
  hasAvatar: z.boolean(),
  hasBrand: z.boolean(),
  hasBrandColor: z.boolean(),
  hasColor: z.boolean(),
  hasCombine: z.boolean(),
  hasText: z.boolean(),
  hasTextCn: z.boolean(),
  hasTextColor: z.boolean(),
});

export const IconMetaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  fullTitle: z.string().min(1),
  color: z.string().regex(HEX_COLOR, '品牌色必须是小写 #rrggbb'),
  group: IconGroupSchema,
  url: z.string().url(),
  docsUrl: z.string(),
  param: IconVariantFlagsSchema,
});

export const CategorySchema = z.object({
  slug: z.string().regex(SLUG),
  name: z.string().min(1).max(20),
  nameEn: z.string().min(1).max(40),
  description: z.string().min(4).max(60),
  icon: z.string().min(1),
  color: z.string().regex(HEX_COLOR),
  order: z.number().int().min(0),
  keywords: z.array(z.string().min(1)),
});

export const SiteSchema = z.object({
  id: z.string().regex(SLUG),
  iconId: z.string().min(1),
  name: z.string().min(1).max(60),
  nameCn: z.string().max(30).optional(),
  url: z
    .string()
    .url()
    .refine((value) => value.startsWith('https://'), {
      message: '官网地址必须使用 https',
    }),
  category: z.string().regex(SLUG),
  tags: z.array(z.string().min(1)).max(8),
  description: z.string().min(10).max(80),
  featured: z.boolean(),
  order: z.number().int().min(0).max(9999),
  color: z.string().regex(HEX_COLOR),
  curated: z.boolean(),
  addedAt: z.string().regex(ISO_DATE, '收录日期必须是 YYYY-MM-DD'),
});

export const SiteOverrideSchema = z
  .object({
    iconId: z.string().min(1),
    name: z.string().min(1).max(60).optional(),
    nameCn: z.string().max(30).optional(),
    url: z
      .string()
      .url()
      .refine((value) => value.startsWith('https://'), { message: '官网地址必须使用 https' })
      .optional(),
    category: z.string().regex(SLUG).optional(),
    tags: z.array(z.string().min(1)).max(8).optional(),
    description: z.string().min(10).max(80).optional(),
    featured: z.boolean().optional(),
    order: z.number().int().min(0).max(9999).optional(),
    visible: z.boolean().optional(),
    addedAt: z.string().regex(ISO_DATE, '收录日期必须是 YYYY-MM-DD').optional(),
  })
  .strict();

export const CategoriesFileSchema = z.array(CategorySchema);
export const TagsFileSchema = z.array(z.string().min(1));
export const SiteOverridesFileSchema = z.array(SiteOverrideSchema);

/** 检测 URL 中是否携带追踪参数（返回命中的参数名） */
export function findTrackingParams(url: string): string[] {
  let search = '';
  try {
    search = new URL(url).search.toLowerCase();
  } catch {
    return [];
  }
  return TRACKING_PARAMS.filter((param) => search.includes(param.toLowerCase()));
}

export type IconMetaInput = z.infer<typeof IconMetaSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type SiteInput = z.infer<typeof SiteSchema>;
export type SiteOverrideInput = z.infer<typeof SiteOverrideSchema>;
