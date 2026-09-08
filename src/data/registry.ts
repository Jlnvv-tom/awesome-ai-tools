/**
 * 数据注册表：把仓库根目录 `data/` 下的 JSON 以类型安全的方式暴露给应用与脚本。
 *
 * 约定：
 * - `data/categories.json` / `data/tags.json` 为受控词表；
 * - `data/sites/*.json` 为人工维护的站点覆盖项，按分类分片，新增分片需在此登记。
 */
import categoriesJson from '@data/categories.json';
import tagsJson from '@data/tags.json';

import agentSites from '@data/sites/agent.json';
import chatSites from '@data/sites/chat.json';
import codeSites from '@data/sites/code.json';
import imageSites from '@data/sites/image.json';
import infraSites from '@data/sites/infra.json';
import modelSites from '@data/sites/model.json';
import openSourceSites from '@data/sites/opensource.json';
import searchSites from '@data/sites/search.json';
import videoSites from '@data/sites/video.json';
import writingSites from '@data/sites/writing.json';

import type { Category, SiteOverride } from '@/types/site';

export const CATEGORIES = categoriesJson as Category[];

export const TAGS = tagsJson as string[];

export const SITE_OVERRIDES: SiteOverride[] = [
  ...chatSites,
  ...codeSites,
  ...imageSites,
  ...videoSites,
  ...agentSites,
  ...searchSites,
  ...writingSites,
  ...openSourceSites,
  ...infraSites,
  ...modelSites,
] as SiteOverride[];

/** 数据分片的来源文件名，便于错误提示与校验报告定位 */
export const SITE_OVERRIDE_SOURCES: Record<string, string> = {
  chat: 'data/sites/chat.json',
  code: 'data/sites/code.json',
  image: 'data/sites/image.json',
  video: 'data/sites/video.json',
  agent: 'data/sites/agent.json',
  search: 'data/sites/search.json',
  writing: 'data/sites/writing.json',
  opensource: 'data/sites/opensource.json',
  infra: 'data/sites/infra.json',
  model: 'data/sites/model.json',
};
