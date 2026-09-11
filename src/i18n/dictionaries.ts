import type { Locale } from './config';

/**
 * 界面文案字典。
 *
 * 英文结构由中文推导（`satisfies Record<Locale, typeof zh>`），
 * 缺失或多余的 key 会在 typecheck 阶段报错，保证双语不漂移。
 */
const zh = {
  common: {
    all: '全部',
    viewAll: '查看全部',
    loading: '加载中',
    clear: '清除筛选',
  },
  header: {
    search: '搜索工具',
    searchAria: '搜索 AI 工具',
    favorites: '我的收藏',
    favoritesWithCount: (count: number) => `我的收藏，共 ${count} 个`,
    switchLanguage: 'Switch to English',
  },
  hero: {
    syncedAt: (date: string) => `图标数据源自 LobeHub Icons · 同步于 ${date}`,
    titleLead: '发现好用的',
    titleHighlight: 'AI 工具',
    titleTail: '一个入口直达全部官网',
    description:
      '收录全球主流 AI 模型、应用与云服务平台，按场景分类整理，支持关键词即时检索与社区共建，帮你从工具海洋里快速找到真正好用的那一个。',
    stats: {
      tools: '收录工具',
      curated: '人工维护',
      categories: '分类',
      tags: '标签',
    },
  },
  explorer: {
    placeholder: '搜索工具名称或关键词，例如：编程、图像、Agent…',
    ariaLabel: '筛选 AI 工具',
    clearSearch: '清空搜索',
    all: '全部',
    hit: '命中',
    hitUnit: '个工具',
    keywordPrefix: '关键词：',
    emptyTitle: '没有匹配的工具，换个关键词或分类试试',
    emptyHint: '也可以到 GitHub 提交收录申请',
    featured: '编辑精选',
    featuredDesc: '社区维护的高频使用工具',
    searchResults: '搜索结果',
    categoryBrowse: '分类浏览',
    total: (count: number) => `共 ${count} 个工具`,
    filteredBy: (tag: string) => `已按「${tag}」筛选`,
    tagEmpty: '该标签下暂无工具，换个标签看看',
    switchView: '切换列表显示方式',
    gridView: '网格视图',
    listView: '列表视图',
  },
  newArrivals: {
    titleWeek: '本周新增',
    titleRecent: '最近收录',
    descWeek: '最近 7 天新收录的工具',
    descRecent: '近期收录的工具，按收录时间排序',
    today: '今天收录',
    yesterday: '昨天收录',
    daysAgo: (days: number) => `${days} 天前收录`,
    weeksAgo: (weeks: number) => `${weeks} 周前收录`,
    onDate: (day: string) => `${day} 收录`,
  },
  myFavorites: {
    title: '我的常用',
    description: '按你在本浏览器的访问与收藏排序，仅自己可见',
  },
  card: {
    viewDetails: (name: string) => `查看 ${name} 详情`,
  },
  favorite: {
    add: (name: string) => `收藏 ${name}`,
    remove: (name: string) => `取消收藏 ${name}`,
    addTitle: '收藏',
    removeTitle: '取消收藏',
  },
  theme: {
    toLight: '切换到亮色模式',
    toDark: '切换到暗色模式',
  },
  outbound: {
    openSite: (name: string) => `在新窗口打开 ${name} 官网`,
    goSite: '前往官网',
  },
  meta: {
    pricing: {
      free: '免费',
      freemium: '免费增值',
      paid: '付费',
      unknown: '定价待补充',
    },
    openSource: {
      yes: '开源',
      no: '闭源',
      unknown: '开源待补充',
    },
    chinese: {
      yes: '支持中文',
      no: '暂不支持中文',
      unknown: '中文待补充',
    },
  },
  detail: {
    home: '首页',
    featured: '编辑精选',
    reportIssue: '信息有误？提交更正',
    issueTitle: (name: string) => `[数据修正] ${name}`,
    dataSource: '数据来源',
    dataSourceBody:
      '图标与品牌信息来自 LobeHub Icons 开源项目，官网地址取自上游元数据并经过社区校验。',
    viewIcon: '查看图标详情',
    group: (group: string) => `上游分组：${group}`,
    color: (color: string) => `品牌色：${color}`,
    curation: '收录状态',
    curatedBody: '该条目已由社区人工维护，分类、中文名与简介均为人工校对结果。',
    derivedBody: '该条目由脚本自动派生，简介与分类为自动归类结果，欢迎提交 PR 补充中文名与简介。',
    contributeGuide: '查看贡献指南',
    related: '相关推荐',
    backTo: (name: string) => `返回${name}`,
    notFound: '工具不存在',
    titleSuffix: '官网',
  },
  category: {
    home: '首页',
    notFound: '分类不存在',
    metaDescription: (description: string) =>
      `${description}，共收录该分类下的 AI 工具官网，支持标签筛选与一键直达。`,
    nameEn: (nameEn: string) => `英文分类名 ${nameEn}`,
    otherCategories: '看看其他分类',
  },
  about: {
    title: '关于本站',
    description: '了解 Awesome AI Tool 的数据来源、开源协议、SDD 规范驱动开发流程与贡献方式。',
    intro:
      'Awesome AI Tool 是一个社区驱动的 AI 工具导航站，收录全球主流 AI 模型、应用与云服务平台，按场景分类整理，全部条目均可一键直达官网，无需注册。',
    snapshot: '当前数据快照',
    icons: {
      source: '数据来源',
      body: '站点与品牌图标来自 LobeHub 开源的 lobe-icons 项目，官网地址取自其元数据并经过社区校验。',
      sdd: '规范驱动开发',
      sddBody:
        '项目采用 SDD：先写 docs/spec 规范与 Zod schema，再实现代码，数据变更必须通过校验门禁。',
      contribute: '人人可贡献',
      contributeBody:
        '新增或修正一个工具只需改一个 JSON 文件，提交 PR 后由 CI 自动校验数据与生成产物。',
      license: '开放协议',
      licenseBody: '代码以 MIT 协议开源，数据同理；品牌图标与商标归各自权利主体所有。',
    },
    iconSource: (source: string, syncedAt: string) =>
      `图标数据源：${source} · 同步时间：${syncedAt}`,
    star: '在 GitHub 上 Star',
    guide: '阅读贡献指南',
  },
  notFound: {
    title: '页面不存在',
    description: '你访问的工具或分类可能已被移除，或者链接拼写有误。',
    backHome: '返回首页',
  },
  footer: {
    submitTool: '提交新工具',
    contributeGuide: '贡献指南',
    roadmap: '路线图',
    siteDesc: (total: number) =>
      `已收录 ${total} 个 AI 工具官网，图标与品牌数据来自 LobeHub Icons，项目完全开源并欢迎社区共建。`,
    about: '关于本站',
    copyright: '基于 MIT 协议开源 · 图标版权归各自品牌方所有',
    github: 'GitHub 仓库',
    rss: 'RSS 订阅',
  },
  search: {
    placeholder: '搜索工具名称、标签或简介…',
    ariaLabel: '搜索 AI 工具',
    dialogTitle: '搜索 AI 工具',
    loading: '正在加载索引…',
    onlyFavorites: '只看收藏',
    favoriteEmpty: '还没有收藏任何工具',
    favoriteEmptyWithQuery: '收藏中没有匹配该关键词的工具',
    favoriteHint: '点击工具卡片右上角的心形即可收藏',
    noResult: (query: string) => `没有匹配「${query}」的工具`,
    noResultHint: '换个关键词试试，或到 GitHub 提交收录申请',
    startTyping: '输入关键词开始搜索，支持名称、中文名、标签与简介',
    hintKeys: '↑↓ 选择 · Enter 打开 · Esc 关闭',
    toolsCount: (count: number) => `${count} 个工具可检索`,
  },
  shortcuts: {
    title: '键盘快捷键',
    openSearch: '打开全局搜索（Windows 为 Ctrl + K）',
    move: '在搜索结果中上下移动',
    open: '打开当前选中的工具',
    close: '关闭弹窗或搜索面板',
    openThis: '打开本快捷键总览',
    note: '快捷键在输入框内不会触发，避免影响正常输入。',
  },
  contributorsPage: {
    title: '贡献看板',
    description: '数据来自 git 提交历史，统计口径与仓库实时一致。',
    contributors: '贡献者',
    commits: (count: number) => `${count} 次提交`,
    dataCommits: (count: number) => `其中数据贡献 ${count} 次`,
    lastCommit: (day: string) => `最近提交 ${day}`,
    progressTitle: '维护进度',
    progressDesc: (maintained: number, total: number) =>
      `已人工维护 ${maintained} / ${total} 条，欢迎认领剩余条目`,
    pending: (count: number) => `${count} 条待认领`,
    rate: (rate: number) => `完成率 ${rate}%`,
    claimGuide: '认领方式：在 Issue 中回复分类，补全中文名与简介后提 PR。',
    empty: '暂无提交记录',
  },
  favoritesPage: {
    title: '我的收藏',
    description: '收藏仅保存在本浏览器，无需登录，也不会上传。',
    empty: '还没有收藏任何工具，点击卡片右上角的心形即可收藏',
    goHome: '去首页逛逛',
    clear: '清空收藏',
    confirmClear: '确认清空',
    cancel: '取消',
    count: (count: number) => `共 ${count} 个收藏`,
  },
};

const en: typeof zh = {
  common: {
    all: 'All',
    viewAll: 'View all',
    loading: 'Loading',
    clear: 'Clear filter',
  },
  header: {
    search: 'Search tools',
    searchAria: 'Search AI tools',
    favorites: 'My favorites',
    favoritesWithCount: (count: number) => `My favorites, ${count} saved`,
    switchLanguage: '切换到中文',
  },
  hero: {
    syncedAt: (date: string) => `Icons from LobeHub Icons · synced ${date}`,
    titleLead: 'Discover the best',
    titleHighlight: 'AI tools',
    titleTail: 'One entry point to every official site',
    description:
      'A curated directory of mainstream AI models, apps and cloud platforms, organised by scenario with instant keyword search and community contributions — so you can find the right tool fast.',
    stats: {
      tools: 'Tools',
      curated: 'Curated',
      categories: 'Categories',
      tags: 'Tags',
    },
  },
  explorer: {
    placeholder: 'Search by name or keyword, e.g. coding, image, agent…',
    ariaLabel: 'Filter AI tools',
    clearSearch: 'Clear search',
    all: 'All',
    hit: 'Matched',
    hitUnit: 'tools',
    keywordPrefix: 'keyword: ',
    emptyTitle: 'No tools match, try another keyword or category',
    emptyHint: 'Or submit a listing request on GitHub',
    featured: 'Editors’ picks',
    featuredDesc: 'Frequently used tools maintained by the community',
    searchResults: 'Search results',
    categoryBrowse: 'Browse by category',
    total: (count: number) => `${count} tools`,
    filteredBy: (tag: string) => `filtered by “${tag}”`,
    tagEmpty: 'No tools under this tag, try another one',
    switchView: 'Switch layout',
    gridView: 'Grid view',
    listView: 'List view',
  },
  newArrivals: {
    titleWeek: 'New this week',
    titleRecent: 'Recently added',
    descWeek: 'Tools added in the last 7 days',
    descRecent: 'Recently added tools, sorted by date',
    today: 'Added today',
    yesterday: 'Added yesterday',
    daysAgo: (days: number) => `Added ${days} days ago`,
    weeksAgo: (weeks: number) => `Added ${weeks} weeks ago`,
    onDate: (day: string) => `Added ${day}`,
  },
  myFavorites: {
    title: 'My most used',
    description: 'Ranked by your visits and favorites in this browser, private to you',
  },
  card: {
    viewDetails: (name: string) => `View details of ${name}`,
  },
  favorite: {
    add: (name: string) => `Save ${name}`,
    remove: (name: string) => `Remove ${name}`,
    addTitle: 'Save',
    removeTitle: 'Remove',
  },
  theme: {
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
  },
  outbound: {
    openSite: (name: string) => `Open ${name} official site in a new tab`,
    goSite: 'Visit site',
  },
  meta: {
    pricing: {
      free: 'Free',
      freemium: 'Freemium',
      paid: 'Paid',
      unknown: 'Pricing unknown',
    },
    openSource: {
      yes: 'Open source',
      no: 'Closed source',
      unknown: 'Open source unknown',
    },
    chinese: {
      yes: 'Chinese supported',
      no: 'No Chinese support',
      unknown: 'Chinese support unknown',
    },
  },
  detail: {
    home: 'Home',
    featured: 'Editor’s pick',
    reportIssue: 'Something wrong? Report it',
    issueTitle: (name: string) => `[Data fix] ${name}`,
    dataSource: 'Data sources',
    dataSourceBody:
      'Icons and brand data come from the open-source LobeHub Icons project; official URLs come from upstream metadata and are verified by the community.',
    viewIcon: 'View icon details',
    group: (group: string) => `Upstream group: ${group}`,
    color: (color: string) => `Brand color: ${color}`,
    curation: 'Curation status',
    curatedBody:
      'This entry is maintained by the community: category, name and description are reviewed by hand.',
    derivedBody:
      'This entry is generated by script; its description and category come from automatic classification — PRs welcome.',
    contributeGuide: 'Read the contributing guide',
    related: 'Related tools',
    backTo: (name: string) => `Back to ${name}`,
    notFound: 'Tool not found',
    titleSuffix: 'official site',
  },
  category: {
    home: 'Home',
    notFound: 'Category not found',
    metaDescription: (description: string) =>
      `${description} — every AI tool in this category with tag filters and direct links.`,
    nameEn: (nameEn: string) => `English name: ${nameEn}`,
    otherCategories: 'Explore other categories',
  },
  about: {
    title: 'About',
    description:
      'Learn about the data sources, open-source licence, spec-driven workflow and how to contribute.',
    intro:
      'Awesome AI Tool is a community-driven directory of mainstream AI models, apps and cloud platforms, organised by scenario, with one-click access to every official site — no sign-up required.',
    snapshot: 'Current data snapshot',
    icons: {
      source: 'Data sources',
      body: 'Sites and brand icons come from the open-source lobe-icons project; URLs come from its metadata and are community-verified.',
      sdd: 'Spec-driven development',
      sddBody:
        'The project follows SDD: specs in docs/spec and Zod schemas come first, code follows, and every data change must pass validation gates.',
      contribute: 'Anyone can contribute',
      contributeBody:
        'Adding or fixing a tool means editing one JSON file; CI validates the data and generated artefacts for every PR.',
      license: 'Open licence',
      licenseBody:
        'Code is MIT licensed, data likewise; brand icons and trademarks belong to their respective owners.',
    },
    iconSource: (source: string, syncedAt: string) => `Icon source: ${source} · synced ${syncedAt}`,
    star: 'Star on GitHub',
    guide: 'Read the contributing guide',
  },
  notFound: {
    title: 'Page not found',
    description:
      'The tool or category you are looking for may have been removed, or the link is wrong.',
    backHome: 'Back home',
  },
  footer: {
    submitTool: 'Submit a tool',
    contributeGuide: 'Contributing guide',
    roadmap: 'Roadmap',
    siteDesc: (total: number) =>
      `${total} AI tool sites indexed, icons and brand data from LobeHub Icons, fully open source and community-driven.`,
    about: 'About',
    copyright: 'Released under the MIT licence · icons belong to their respective brands',
    github: 'GitHub repository',
    rss: 'RSS feed',
  },
  search: {
    placeholder: 'Search by name, tag or description…',
    ariaLabel: 'Search AI tools',
    dialogTitle: 'Search AI tools',
    loading: 'Loading index…',
    onlyFavorites: 'Saved only',
    favoriteEmpty: 'No saved tools yet',
    favoriteEmptyWithQuery: 'No saved tools match this keyword',
    favoriteHint: 'Tap the heart on a card to save a tool',
    noResult: (query: string) => `No tools match “${query}”`,
    noResultHint: 'Try another keyword, or submit a listing request on GitHub',
    startTyping: 'Start typing to search by name, Chinese name, tag or description',
    hintKeys: '↑↓ to move · Enter to open · Esc to close',
    toolsCount: (count: number) => `${count} tools searchable`,
  },
  shortcuts: {
    title: 'Keyboard shortcuts',
    openSearch: 'Open global search (Ctrl + K on Windows)',
    move: 'Move through search results',
    open: 'Open the selected tool',
    close: 'Close dialog or search panel',
    openThis: 'Open this shortcut overview',
    note: 'Shortcuts do not fire while typing in an input field.',
  },
  contributorsPage: {
    title: 'Contributors',
    description: 'Data comes from the git history and always matches the repository.',
    contributors: 'Contributors',
    commits: (count: number) => `${count} commits`,
    dataCommits: (count: number) => `${count} of them touched data`,
    lastCommit: (day: string) => `Last commit ${day}`,
    progressTitle: 'Curation progress',
    progressDesc: (maintained: number, total: number) =>
      `${maintained} of ${total} entries are hand-maintained — claim the rest`,
    pending: (count: number) => `${count} unclaimed`,
    rate: (rate: number) => `${rate}% complete`,
    claimGuide: 'To claim: reply in the tracking issue with a category, then open a PR.',
    empty: 'No commits yet',
  },
  favoritesPage: {
    title: 'My favorites',
    description: 'Favorites are stored in this browser only — no login, no upload.',
    empty: 'No favorites yet, tap the heart on a card to save one',
    goHome: 'Explore the directory',
    clear: 'Clear favorites',
    confirmClear: 'Confirm clear',
    cancel: 'Cancel',
    count: (count: number) => `${count} saved`,
  },
};

export const dictionaries = { zh, en } satisfies Record<Locale, typeof zh>;

export type Dictionary = typeof zh;

/** 取指定语言的字典 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
