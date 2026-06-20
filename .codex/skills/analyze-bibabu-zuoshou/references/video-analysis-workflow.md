# 视频分析工具与执行流程

本文件记录“比巴卜作手”单期视频从链接到图文笔记的完整操作。命令中的 `<BVID>`、`<CID>`、日期和路径应替换为本期实际值。

## 1. 确认仓库状态

先运行 `git status -sb`，记录工作区已有改动。只修改本任务涉及的 skill、人物专题、图片和必要导航，不覆盖或回退无关改动。

## 2. 获取并核验 B 站元数据

从链接提取 BV 号，查询：

```text
https://api.bilibili.com/x/web-interface/view?bvid=<BVID>
https://api.bilibili.com/x/player/v2?bvid=<BVID>&cid=<CID>
```

记录标题、简介、UP 主、发布时间、视频时长、分 P、`cid`、字幕列表和原视频链接。不要仅凭用户所说的“今天”归档，以接口发布时间和视频对应的交易日为准；两者不一致时明确说明。

可使用 `curl` 或 Python 标准库 `urllib` 请求接口。公开接口不可用时再用浏览器核验页面；需要登录态时优先使用 Chrome 工具。

## 3. 获取字幕或视频

接口返回字幕时优先下载字幕 JSON，保留每句起止时间。没有字幕时查询播放地址：

```text
https://api.bilibili.com/x/player/playurl?bvid=<BVID>&cid=<CID>&qn=16&fnval=0
```

下载请求应带常见浏览器 `User-Agent` 和视频页 `Referer`，主地址失败时依次尝试 `backup_url`。将视频暂存在 `/tmp/<BVID>.mp4`，不要提交完整视频或音频；整理完成后必须删除。

## 4. 使用 Whisper 转写

缺少可靠字幕时使用：

```bash
uv run --with faster-whisper python <transcribe-script.py>
```

默认使用 `small` 模型、`language="zh"`、CPU `compute_type="int8"`、VAD 和 `beam_size=5`。将未经整理的带时间戳转写暂存为 `/tmp/<BVID>.txt`。财经词识别不足时升级模型。

未经整理的自动转写只是检索索引，不是最终事实来源。股票名和专有词必须结合画面复核；随后将其整理为仓库中的可读时间轴文字稿。

## 5. 建立观点时间轴

使用 `sed` 分段阅读、`rg` 搜索股票名和题材词。先形成内部时间轴和“全部股票提及清单”，再整理文字稿和总结。至少标记：

- 指数、量能、情绪和赚钱效应。
- 每个题材板块的观点起止时间。
- 每一只被提到的股票、出现时间、原始语境、市场角色、强弱原因和风险。
- 次日预案、触发条件与否定条件。
- 心态、仓位和方法论表述。

严格区分主播原观点、可验证事实和分析者延展。整理时尽量保留作者的表达顺序、常用措辞、语气强弱、犹豫、自我修正、类比和例子，不能为了压缩篇幅改变判断强度。

## 6. 核实名词和个股

证据优先级：

1. 视频画面中清晰可见的名称或代码。
2. B 站官方元数据或视频自带字幕。
3. 同段前后文、市场逻辑和重复提及。
4. Whisper 转写。

逐段扫描画面和转写，不能只搜索预先知道的核心股。所有明确提到的股票都进入清单，包括一带而过、负面评价、对比对象、跟风股和作者不看好的股票。

无法确认时保留时间点、发音线索与上下文，并标注“名称待核实”，不要凭发音强行补全或静默省略。必要时使用行情信息或公开搜索交叉核验，但不能据此改写主播观点。

## 7. 提取并筛选关键帧

使用 PyAV 定位时间点，Pillow 保存 JPEG：

```bash
uv run --with av --with pillow python <frame-script.py>
```

图片保存到：

```text
docs/public/images/trading/bibabu/YYYY-MM-DD/
```

以四位秒数命名，例如 `0125.jpg`。每期通常保留 6 至 10 张，覆盖市场总览、主要板块、重点个股、次日计划和风险条件。

按观点选择截图，不做机械等间隔截帧。将候选帧制作成 `/tmp` 下的联系表，使用图像查看工具检查清晰度、字幕遮挡、相关性和重复度，再确定最终图片。

## 8. 编写每日文档

写入：

```text
docs/trading/experts/bibabu-zuoshou/trading-days/YYYY-MM-DD.md
```

先写：

```text
docs/trading/experts/bibabu-zuoshou/transcripts/YYYY-MM-DD.md
```

文字稿必须保存到本项目上述路径，不能只留在 `/tmp` 或其他本地目录。文字稿应覆盖全片有效内容，按自然议题和个股切换标注时间点；保留作者的论述顺序与语气，并在末尾附“本期全部股票提及表”。同一股票多次出现时记录关键时间点及观点变化。

再写交易日总结。结构遵循主 skill，具体分析中的每个板块应回答：

- 主播怎么看。
- 依据和盘面现象是什么。
- 全部提及个股有哪些，各自扮演什么角色；其中哪些才是作者认定的核心或重点。
- 次日观察点、触发条件和风险是什么。

“视频关键点”按时间顺序组织，每项包含时间戳、截图和尽量贴近作者说法及语气的解释。同步更新文字稿索引、交易日索引和 `docs/.vitepress/config.mts` 中“比巴卜作手”侧边栏目录。每新增一期都必须在对应模块下按日期倒序加入入口；文件改名、日期纠正或路径迁移时必须替换旧链接。不能仅因模块索引已更新或站点能够成功构建，就认为目录同步已经完成。

## 9. 清理本期临时文件

确认项目中的文字稿、总结和最终关键帧均已保存后，列出本期创建的临时文件清单，并逐个删除明确路径，例如：

```bash
rm /tmp/<BVID>.mp4
rm /tmp/<BVID>.txt
rm /tmp/<BVID>-contact-sheet.jpg
```

音频、候选帧和其他中间文件也应逐个删除。禁止使用通配符、递归删除或批量删除目录；如果无法确认某个文件是否属于本期，不要删除。清理后检查清单，确保本期临时视频、音频、原始自动转写、候选帧和联系表均不存在。

## 10. 校验

构建前先用 `rg` 检查本期日期或 BVID 是否同时出现在文章、模块索引和 VitePress 侧边栏中，并确认旧日期、旧路径没有残留。站点构建只能验证链接页面可生成，不能替代目录收录检查。

先确认文档引用的图片都存在，再运行：

```bash
python3 /Users/luohaoyuan/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/analyze-bibabu-zuoshou
python3 /Users/luohaoyuan/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/luohaoyuan/.codex/skills/analyze-bibabu-zuoshou
npm run docs:build
git diff --check
git status -sb
```

修复由本次改动引起的问题。若错误来自工作区已有改动，明确记录，不擅自回退。

## 11. 提交和发布

仅在用户明确要求时提交和发布。逐个确认并暂存本次视频、skill 同步和必要导航文件，随后按仓库既有流程推送和发布。
