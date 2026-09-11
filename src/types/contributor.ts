/** 贡献者统计（由 scripts/build-contributors.ts 生成，见 contributors.generated.ts） */
export interface Contributor {
  /** 展示用户名（取自 git 提交者姓名，不含邮箱） */
  name: string;
  /** 提交总数 */
  commits: number;
  /** 涉及 data/ 目录的提交数（数据贡献） */
  dataCommits: number;
  /** 首次提交日期 YYYY-MM-DD */
  firstCommit: string;
  /** 最近提交日期 YYYY-MM-DD */
  lastCommit: string;
}
