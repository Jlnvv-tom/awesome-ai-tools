/**
 * 全站数据契约（SDD 核心）
 *
 * 本文件是「规范驱动开发」的唯一事实来源：
 * - 所有数据结构必须先在此定义，再由 `src/data/schema.ts` 用 Zod 复刻为运行时校验；
 * - 任何字段变更都必须同步更新 `docs/spec/10-data-model.md` 并走 Spec Change 流程。
 */

/** 图标上游分组（与 @lobehub/icons toc 保持一致） */
export type IconGroup = 'model' | 'provider' | 'application';

/** 定价模式；`unknown` 表示尚未补充，不等同于「不确定是否免费」 */
export type PricingState = 'free' | 'freemium' | 'paid' | 'unknown';

/** 三态：是 / 否 / 待补充（避免用 false 表达「未填」） */
export type TriState = 'yes' | 'no' | 'unknown';

/**
 * 图标来源策略，决定渲染候选链（见 `src/lib/icon-plan.ts`）。
 *
 * 引入原因：条目不再只来自 @lobehub/icons 图标库（见 ADR 0009），
 * 自主收录的工具需要走本地 favicon 或首字母块。
 */
export type IconSourceKind = 'lobehub' | 'favicon' | 'initial';

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
  /**
   * 关联的图标 id：lobehub 派生条目为 `IconMeta.id`，自主收录条目为其自身 id。
   * 与 `iconSource` 配合决定图标渲染候选链。
   */
  iconId: string;
  /**
   * 图标来源策略（派生字段，不可覆盖）：
   * - `lobehub`：来自 @lobehub/icons 图标库，走 CDN 多级降级；
   * - `favicon`：来自构建期抓取的本地图标（`public/icons/<id>.<ext>`）；
   * - `initial`：无可用图像，使用品牌色首字母块。
   */
  iconSource: IconSourceKind;
  /** 本地图标的 public 相对路径，仅在 `iconSource === 'favicon'` 时存在（派生） */
  faviconUrl?: string;
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
  /**
   * 是否存在彩色变体（派生自 IconMeta.param.hasColor）。
   *
   * 纯派生字段：不可由人工覆盖，因此不进 SiteOverride / Zod；
   * 客户端不得自行查表获得，须经此处下传，以免把 322 条图标元数据打进 bundle。
   */
  hasColor: boolean;
  /** 数据是否由人工维护（false 表示由脚本自动派生） */
  curated: boolean;
  /** 收录日期（YYYY-MM-DD）：覆盖项 > git 回填映射 > 项目初始化日期 */
  addedAt: string;
  /** 定价模式，unknown 表示待补充 */
  pricing: PricingState;
  /** 是否开源 */
  openSource: TriState;
  /** 是否支持中文 */
  chineseSupport: TriState;
  /** 开源仓库（`owner/repo`），人工维护，用于同步 Star 等客观指标 */
  github?: string;
  /** GitHub Star 数（派生自 `metrics.generated.ts`，无仓库或未同步时缺省） */
  stars?: number;
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
  /** 覆盖自动回填的收录日期（YYYY-MM-DD），新收录条目由贡献者或同步脚本填写 */
  addedAt?: string;
  /** 定价模式 */
  pricing?: PricingState;
  /** 是否开源 */
  openSource?: TriState;
  /** 是否支持中文 */
  chineseSupport?: TriState;
  /** 开源仓库（`owner/repo`），填写后由 `sync:metrics` 同步 Star 数 */
  github?: string;
}

/**
 * 自主收录条目：不在 @lobehub/icons 图标库中的工具，人工维护于 `data/catalog/*.json`。
 *
 * 与 `SiteOverride` 的区别：override 是「补充 lobehub 条目」，以 iconId 关联；
 * CatalogEntry 自成一个完整条目，因此 id 必填、必须全局唯一，且不参与 iconId 关联。
 */
export interface CatalogEntry {
  /** 唯一 id（kebab-case），不得与 lobehub 派生条目的 id 冲突 */
  id: string;
  /** 展示名（英文原名或通用名） */
  name: string;
  /** 中文名（建议填写，缺失会触发 validate:data 警告） */
  nameCn?: string;
  /** 官网地址（https，禁止追踪参数） */
  url: string;
  /** 分类 slug，必须存在于 data/categories.json */
  category: string;
  /** 标签（受控词表），建议 1–4 个 */
  tags: string[];
  /** 一句话简介（10–80 字符，禁止营销话术） */
  description: string;
  /** 品牌主色（小写 hex），用于兜底占位块、容器辉光与对比垫板 */
  color: string;
  /** 是否首页精选 */
  featured?: boolean;
  /** 排序权重 0–9999，越小越靠前 */
  order?: number;
  /** 收录日期（YYYY-MM-DD） */
  addedAt: string;
  /** 定价模式，缺省 unknown */
  pricing?: PricingState;
  /** 是否开源，缺省 unknown */
  openSource?: TriState;
  /** 是否支持中文，缺省 unknown */
  chineseSupport?: TriState;
  /** 开源仓库（`owner/repo`），填写后由 `sync:metrics` 同步 Star 数 */
  github?: string;
  /** 若该工具后来被图标库收录，填入 IconMeta.id 以复用官方图标 */
  iconId?: string;
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
  /** 品牌主色：图标兜底块与容器垫板都依赖它 */
  color: string;
  /** 是否存在彩色变体；false 时不再请求必定 404 的 color 变体 */
  hasColor: boolean;
  /**
   * 上游图标 id，仅在 id 冲突导致它不等于 `id` 时写入，
   * 其余条目省略以控制索引体积（见 scripts/build-search-index.ts）。
   */
  iconId?: string;
  /** 图标来源，仅当不是 `lobehub` 时写入（多数条目省略以控制索引体积） */
  iconSource?: IconSourceKind;
  /** 本地图标路径，仅 `favicon` 来源的条目写入 */
  faviconUrl?: string;
}
