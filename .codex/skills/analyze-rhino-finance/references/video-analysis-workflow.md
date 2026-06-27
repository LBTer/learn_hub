# 视野环球财经视频分析工作流

## 1. 确认仓库状态

先运行 `git status -sb`，记录工作区已有改动。只修改本任务涉及的 skill、人物专题、文档、图片和必要导航，不覆盖或回退无关改动。

## 2. 获取 YouTube 元数据

优先使用：

```bash
uv run yt-dlp --dump-single-json --no-warnings --skip-download "<URL>"
```

若 YouTube 触发登录或机器人校验，在用户明确允许后使用：

```bash
uv run yt-dlp --cookies-from-browser chrome --dump-single-json --no-warnings --skip-download "<URL>"
```

不得输出、读取或保存 cookie、token、密码。只记录标题、频道、发布日期、时长、链接、标签、简介、字幕、章节、可见性、频道 ID 和账号名。

## 3. 获取字幕或音频

优先顺序：

1. YouTube 官方字幕或创作者字幕。
2. 使用 `yt-dlp` 下载音频后本地转写。
3. 只有命令行失败且用户明确同意时，才使用浏览器页面操作。

字幕、音频、自动转写和候选帧只放在临时目录，不提交到仓库。

## 4. 原始提取稿与整理文字稿

先保存原始提取稿，保持原始顺序、说法、语气、重复、自我修正和条件句。随后逐段整理成可读时间轴文字稿。

整理时至少标记：

- 大盘与风险状态。
- ETF、板块和风格切换。
- 每个 ticker 或指数出现时间。
- 支撑、压力、均线、趋势线、破位、横盘、修复等技术位置。
- 操作条件、观察条件、减仓/避险条件。
- 投资心理、仓位、纪律和方法论。

## 5. 核实全部标的

读取 `references/ticker-verification.md`。建立“本期全部标的提及表”，覆盖全部股票、ETF、指数和重要资产代码。无法确认时保留上下文并标记“待核”，不要凭发音硬猜。

## 6. 文字稿冻结

检查文字稿是否覆盖：

- 开场和收尾。
- 标题提到的全部标的。
- 视频实际提到的全部标的。
- 长篇观点和转折。
- 操作条件与风险条件。
- 后续观察与交易计划。

通过后写入正式路径并冻结。冻结前不得创建或预写复盘正文。

## 7. 生成美股盘后复盘

只使用冻结文字稿作为底稿。复盘应回答：

- Rhino 如何判断大盘风险。
- 哪些板块或 ETF 相对强/弱。
- 核心个股分别扮演什么角色。
- 交易计划的条件是什么。
- 哪些判断需要下一交易日验证。

外部信息只能用于核实标的身份、事实背景和明显识别错误；分析延展必须单独标注。

## 8. 更新目录

每期新增后同步更新：

- `docs/trading/experts/rhino-finance/index.md`
- `docs/trading/experts/rhino-finance/market-reviews/index.md`
- `docs/trading/experts/rhino-finance/transcripts/index.md`
- `docs/.vitepress/config.mts`

会员内容同步更新 `member-notes/` 和 `member-transcripts/` 索引。

## 9. 校验

发布前至少检查：

```bash
python3 /Users/admin/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/analyze-rhino-finance
npm run docs:build
git diff --check
git status -sb
```

若错误来自工作区已有改动，明确记录，不擅自回退。

## 10. 清理临时文件

确认正式产物全部保存后，逐个删除本次创建的明确临时文件路径。禁止使用通配符、递归删除或批量删除目录。
