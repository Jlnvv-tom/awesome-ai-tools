# ADR-0008：图标主题适配采用 mask + currentColor

- 状态：Accepted
- 日期：2026-09-12
- 相关：[ADR-0001](./0001-icon-rendering.md)（CDN 静态 SVG）、[docs/spec/10-data-model.md](../spec/10-data-model.md)

## 背景

参考 [lobehub.com/icons](https://lobehub.com/icons) 的深浅色表现，其图标在深色模式下自动变白。
抓取上游静态资源核实（`@lobehub/icons-static-svg`）：

```
openai.svg        → <svg fill="currentColor" ...>   // mono 变体以 currentColor 着色
openai-color.svg  → 404 Not found                   // OpenAI 根本没有彩色变体
```

官网把图标内联为 React SVG，`currentColor` 能跟随 CSS `color`（浅色近黑 / 深色近白）；
品牌固定色（Claude `#D97757`、Microsoft `#00A4EF`）则是写死的 hex，不随主题变化。

本站按 ADR-0001 以 `<img>` 引用 CDN SVG，而 `<img>` 内的 SVG 是**独立文档**，
`currentColor` 继承不到页面颜色，只会回退成纯黑。由此产生三类实际缺陷：

| 现象                                 | 规模                                                  | 原因                                           |
| ------------------------------------ | ----------------------------------------------------- | ---------------------------------------------- |
| 深色模式下「黑图标贴黑底」几乎不可见 | 105 条（`hasColor: false`，含 OpenAI、Anthropic）     | mono 变体被渲染成黑色，不随主题翻转            |
| 浅色模式下「白图标贴白底」几乎不可见 | 65 条（品牌色 `#ffffff`，含 Azure、Copilot、Civitai） | 彩色变体本身是白色图案                         |
| 每个图标 2 次无效请求 + 加载闪烁     | 四 处调用点未传 `hasColor`（默认 true）               | 对无彩色变体的条目请求必定 404 的 `-color.svg` |

## 决策

1. **单色图标改用 mask + `currentColor` 渲染**：`background-color: currentColor` + `mask-image: url(...)`，
   同时输出 `-webkit-mask-image`（Safari）。颜色由 `--foreground` 驱动，与参考站效果一致，
   并可随主题在 200ms 内过渡。
2. **彩色图标继续用 `<img>`**：保留品牌原色，避免品牌色被 `currentColor` 污染。
3. **容器自适应垫板**：按品牌色的 WCAG 相对亮度归类（`light` / `dark` / `normal`），
   只对「不受主题控制的 img 渲染」加反向底色垫板，品牌色辉光保留。
4. **`Site.hasColor` 由服务端派生**：写入派生字段而非客户端查表，避免把 322 条图标元数据打进 bundle。
5. **提供「彩色 / 单色」风格开关**：偏好经既有 Provider 单一源下发（复用 `use-stored-state`）。

## 理由

- **效果对齐参考站**：mask 与内联 SVG 同属「颜色受 CSS 控制」的渲染方式，是唯一能在保留
  ADR-0001 CDN 策略的前提下复刻该效果的做法；
- **零新增依赖**：不引入 `@lobehub/icons` 组件包（322 个组件进 bundle，并依赖 antd 系生态）；
- **请求数下降**：不再请求必定 404 的彩色变体，105 条条目由 3 次请求降为 1 次；
- **关注点分离**：渲染决策抽为纯函数 `resolveIconPlan()`，组件只负责渲染，可单测。

## 关键实现约束

| 约束                                          | 说明                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| mask 没有 load/error 事件                     | 同层挂载视觉隐藏的探测 `<img>` 感知失败；与 mask 同一 URL，命中浏览器缓存，**零额外请求** |
| 客户端禁止 import `ICON_META` / `getIconMeta` | 会把 322 条元数据打进 bundle；`hasColor` 必须经 props 下传                                |
| 垫板按「计划的首个渲染模式」计算              | 若跟随当前实际模式，CDN 降级会引起底色闪烁                                                |
| 风格切换后候选数量变化（4 → 2）               | 候选下标钳位到最后一项，避免误落到兜底首字块                                              |
| `body` 未设 `text-foreground`                 | mask 外壳需显式声明 `text-foreground`，否则 `currentColor` 解析为浏览器默认黑             |

## 备选方案

| 方案                          | 否决原因                                                              |
| ----------------------------- | --------------------------------------------------------------------- |
| `<img>` + `dark:invert`       | 补丁式：依赖「mono 是纯黑」这一隐含前提，上游一旦改为非纯色会整体失真 |
| `@lobehub/icons` npm 组件包   | bundle 膨胀 + 引入 antd 系依赖，直接推翻 ADR-0001                     |
| 全站统一浅色垫板              | 视觉与参考站不一致，且弱化玻璃拟态的设计语言                          |
| 给每个图标补充品牌形象 Avatar | 需人工维护 322 条数据与配色，成本过高                                 |

## 代价与后续观察

- `mask-image` 在极旧浏览器（如 IE）不可用：这些浏览器本就不在支持范围内，且会退回到空白垫板而非破图；
- 垫板依赖品牌色元数据质量：若上游把某个白色 logo 的主色标为深色，需调整亮度阈值或加人工覆盖；
- 探测 `<img>` 是一层额外的 DOM 节点：每个图标 +1 节点，未观测到可测量的性能影响。
