/**
 * 全站数据契约（SDD 核心）
 *
 * 本文件是「规范驱动开发」的唯一事实来源：
 * - 所有数据结构必须先在此定义，再由 `src/data/schema.ts` 用 Zod 复刻为运行时校验；
 * - 任何字段变更都必须同步更新 `docs/spec/10-data-model.md` 并走 Spec Change 流程。
 */

/** 图标上游分组（与 @lobehub/icons toc 保持一致） */
export type IconGroup = 'model' | 'provider' | 'application';

/** 图标支持的变体标记 */
export interface IconVariantFlags {
  hasAvatar: boolean;
  hasBrand: boolean;
  hasBrandColor: boolean;
  hasColor: boolean;
  hasCombine: boolean;
  hasText: boolean;
  hasTextCn: boolean;
  hasTextColor: boolean;
}

/**
 * 图标元数据：由 `scripts/sync-icons.ts` 从 @lobehub/icons 生成，禁止手改。
 */
export interface IconMeta {
  /** PascalCase 唯一标识，如 `OpenAI`，同时是 CDN slug 的来源 */
  id: string;
  /** 短名 */
  title: string;
  /** 完整展示名，如 `Firefly (Adobe)` */
  fullTitle: string;
  /** 品牌主色（hex，小写） */
  color: string;
  /** 上游分组 */
  group: IconGroup;
  /** 官网地址（来自 toc.desc） */
  url: string;
  /** lobehub.com/icons 文档路径 */
  docsUrl: string;
  /** 可用变体 */
  param: IconVariantFlags;
}

/** 分类定义（人工维护于 data/categories.json） */
export interface Category {
  /** URL slug，如 `chat` */
  slug: string;
  /** 中文名 */
  name: string;
  /** 英文名 */
  nameEn: string;
  /** 一句话描述 */
  description: string;
  /** lucide 图标名 */
  icon: string;
  /** 主题色（hex） */
  color: string;
  /** 排序权重，越小越靠前 */
  order: number;
  /** 命中关键词（小写），用于把图标自动归类 */
  keywords: string[];
}

/** 站点条目：最终渲染与检索使用的完整对象 */
export interface Site {
  /** 唯一 id，等于图标 id 的 kebab 形式，如 `openai` */
  id: string;
  /** 关联的图标 id（IconMeta.id） */
  iconId: string;
  /** 展示名 */
  name: string;
  /** 中文名（可选） */
  nameCn?: string;
  /** 官网地址 */
  url: string;
  /** 所属分类 slug */
  category: string;
  /** 标签（受控词表，来自 data/tags.json） */
  tags: string[];
  /** 一句话简介（≤ 80 字） */
  description: string;
  /** 是否推荐（首页精选） */
  featured: boolean;
  /** 排序权重，越小越靠前 */
  order: number;
  /** 品牌色（来自图标元数据，可覆盖） */
  color: string;
  /** 数据是否由人工维护（false 表示由脚本自动派生） */
  curated: boolean;
}

/** 人工维护的站点覆盖项：字段全部可选，与自动派生结果做浅合并 */
export interface SiteOverride {
  iconId: string;
  name?: string;
  nameCn?: string;
  url?: string;
  category?: string;
  tags?: string[];
  description?: string;
  featured?: boolean;
  order?: number;
  /** 设为 false 可从导航中隐藏该条目 */
  visible?: boolean;
}

/** 首页统计信息 */
export interface SiteStats {
  total: number;
  curated: number;
  categories: number;
  tags: number;
}

/** 搜索索引条目（体积敏感，尽量精简） */
export interface SearchDoc {
  id: string;
  name: string;
  nameCn?: string;
  category: string;
  tags: string[];
  description: string;
}
