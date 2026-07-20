# 袁帅马视频分析工具与执行流程

本文件记录单期视频从链接到文字稿和日常分析笔记的完整操作。命令中的 `<BVID>`、`<CID>`、日期和路径应替换为本期实际值。

## 1. 确认仓库状态

先运行 `git status -sb`，记录工作区已有改动。只修改本任务涉及的 skill、人物专题、图片和必要导航，不覆盖或回退无关改动。

## 2. 获取并核验 B 站元数据

从链接提取 BV 号，查询：

```text
https://api.bilibili.com/x/web-interface/view?bvid=<BVID>
https://api.bilibili.com/x/player/v2?bvid=<BVID>&cid=<CID>
```

记录标题、简介、UP 主、发布时间、视频时长、分 P、`cid`、字幕列表、原视频链接、充电状态和合集信息。不要仅凭用户所说的“今天”归档，以接口发布时间为准；视频分析明显对应其他历史区间时，在文档中单独注明。

公开接口不可用时再用浏览器核验页面。需要登录态时优先使用 Chrome 中现有 B 站登录会话；不得读取、输出或保存 Cookie、密码、令牌等登录凭证。

## 3. 获取字幕或视频

接口返回字幕时优先下载字幕 JSON，保留每句起止时间。没有字幕时查询播放地址：

```text
https://api.bilibili.com/x/player/playurl?bvid=<BVID>&cid=<CID>&qn=16&fnval=0
```

下载请求应带常见浏览器 `User-Agent` 和视频页 `Referer`，主地址失败时依次尝试 `backup_url`。将视频暂存在 `/tmp/<BVID>.mp4`，不要提交完整视频或音频；整理完成后必须逐个删除临时文件。

## 4. 使用 Whisper 转写

缺少可靠字幕时使用本地转写：

```bash
uv run --with faster-whisper python <transcribe-script.py>
```

默认使用中文模型配置、VAD 和合理的 beam size。财经词、股票名或口音识别不足时，可以升级模型或结合画面复核。

未经整理的自动转写只是底稿，不是最终事实来源。股票名、代码、价格、日期和图表位置必须结合画面复核。

## 5. 提取并整理文字稿

先形成原始提取稿，再建立内部时间轴和“全部标的与图表信息表”，最后制作整理文字稿。此阶段不得创建或预写日常分析笔记。

至少标记：

- 核心个股和辅助个股。
- 作者讲解的历史区间和趋势阶段。
- 每个关键走势位置：平台、突破、回踩、洗盘、拉升、放量、缩量、压力、支撑、趋势线、均线或筹码区。
- 作者判断的主力行为。
- 后续参与条件、等待信号、失效条件和风险。
- 简要提到的其他个股及其参与条件。
- 可迁移的方法论和限制。

整理时尽量保留作者表达顺序、常用说法、语气强弱、犹豫、自我修正、类比和例子，不能为了压缩篇幅改变判断强度。

## 6. 核实股票名与图表信息

证据优先级：

1. 视频画面中清晰可见的名称、代码、日期、价格或图表标注。
2. B 站官方元数据或视频自带字幕。
3. 同段前后文、作者重复提及和市场常识。
4. Whisper 转写。

逐段扫描画面和文字稿，不能只搜索预先知道的核心股。所有明确提到的股票都进入清单，包括一带而过、对比对象、作者不看好的股票和简要观察票。

无法确认时保留时间点、发音线索、画面上下文和“待核”标记，不凭发音强行补全或静默省略。必要时可使用公开行情信息核实股票名、代码、图表日期和价格区间，但不能据此改写作者观点。

## 7. 冻结文字稿

完成核实后检查：

- 开场、收尾和全部有效议题已覆盖。
- 核心个股的历史走势解析完整。
- 简要个股没有遗漏。
- 后续参与条件和风险边界已记录。
- 长篇观点和教学点保留了足够篇幅。
- “本期全部标的与图表信息表”已完成。

将整理文字稿写入正式路径后才算冻结：

```text
docs/trading/experts/yuanshuaima/transcripts/YYYY-MM-DD-BVID.md
```

冻结前禁止创建或预写分析笔记。冻结后若文字稿发生实质修订，必须同步复查分析笔记。

## 8. 生成日常分析

只能以冻结文字稿为唯一内容底稿，写入：

```text
docs/trading/experts/yuanshuaima/daily-analysis/YYYY-MM-DD-BVID.md
```

日常分析应回答：

- 作者本期重点分析哪只股票或哪些股票。
- 作者如何划分历史走势阶段。
- 每个阶段的图表依据和主力行为解释是什么。
- 后续可以怎么参与，前提和失效条件是什么。
- 简要提到的其他个股分别是什么逻辑。
- 哪些方法可以暂时作为单期学习点，哪些必须等待多期验证。

不要补写作者没说过的行情判断；分析者延展必须明确标注。

## 9. 提取并筛选关键帧

使用 PyAV 定位时间点，Pillow 保存 JPEG：

```bash
uv run --with av --with pillow python <frame-script.py>
```

图片保存到：

```text
docs/public/images/trading/yuanshuaima/YYYY-MM-DD-BVID/
```

以四位秒数命名，例如 `0125.jpg`。每期通常保留 6 至 12 张，覆盖核心个股完整推演、关键图表位置、参与条件、风险边界和简要个股。

按观点选择截图，不做机械等间隔截帧。候选帧联系表只放临时目录，人工复核清晰度、字幕遮挡、相关性和重复度后再确定最终图片。

## 10. 更新目录

同步更新：

- `docs/trading/experts/yuanshuaima/index.md`
- `docs/trading/experts/yuanshuaima/daily-analysis/index.md`
- `docs/trading/experts/yuanshuaima/transcripts/index.md`
- `docs/.vitepress/config.mts` 中“袁帅马”的“日常分析”和“视频文字稿”条目。

新增日期必须在模块索引和侧边栏中都出现。站点能够构建不代表目录已同步，必须单独对照检查。

## 11. 清理本期临时文件

确认正式文字稿、日常分析和最终关键帧均已保存后，列出本期创建的临时文件清单，并逐个删除明确路径，例如：

```bash
rm /tmp/<BVID>.mp4
rm /tmp/<BVID>.txt
rm /tmp/<BVID>-contact-sheet.jpg
```

禁止使用通配符、递归删除或批量删除目录；如果无法确认某个文件是否属于本期，不要删除。

## 12. 校验

发布前检查：

```bash
python3 /Users/admin/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/analyze-yuanshuaima
npm run docs:build
git diff --check
git status -sb
```

修复由本次改动引起的问题。若错误来自工作区已有改动，明确记录，不擅自回退。
