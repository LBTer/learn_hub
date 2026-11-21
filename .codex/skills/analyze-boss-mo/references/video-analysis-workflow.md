# boss墨独立执行流程

## 1. 工作区及最新视频

先记录 `git status --short`，不覆盖其他任务改动。读取本 skill 和相关 reference。

在项目根目录：

```bash
uv run yt-dlp --flat-playlist --dump-single-json --playlist-end 5 https://space.bilibili.com/25270495/video
```

对候选 BVID 调用公开接口 `https://api.bilibili.com/x/web-interface/view?bvid=<BVID>`，核对 owner.mid 为 25270495，并比较 pubdate。记录检索时间及可见范围；不能声称检查了隐藏或不可访问投稿。按北京时间记录发布时刻，和视频交易日分别标注。

`scripts/check-new-videos.py` 仅检查指定日期，不能把“当天没更新”等同无最新一期；默认公开请求。`--chrome-cookies` 只在用户明确授权后使用。元数据失败或只读到部分列表时说明限制，不将失败当“无视频”。

## 2. 完整媒体与字幕

用 `https://api.bilibili.com/x/player/v2?bvid=<BVID>&cid=<CID>` 查询字幕；有字幕先保存原始 JSON，并对照开头、中段、结尾音画检查话题及时间轴。字幕链接来自官方接口也不保证内容匹配；若内容无关、时间超过片长或时间轴偏移，不用它制作原稿，改为完整音频转写。无可靠字幕时下载完整媒体：

```bash
uv run yt-dlp --no-playlist -f worst -o /tmp/boss-mo-<BVID>.mp4 https://www.bilibili.com/video/<BVID>
```

下载后先校验实际时长：

```bash
uv run python .codex/skills/analyze-boss-mo/scripts/verify-media.py /tmp/boss-mo-<BVID>.mp4 --expected-seconds <元数据时长秒数>
```

校验失败停止完整稿流程。接口 timelength 可能是全片时长，但 durl.length 与实际媒体只有预览；rights.elec=0 或 is_chargeable_season=false 也不能保证完整可访问。不要先凭这些字段认定公开完整视频。有清晰数字核读需要时选更高分辨率。可用 playurl 接口，下载带 User-Agent 与视频 Referer；主地址失败再尝试备份。登录态读取须有用户授权，不输出或保存凭证。已有授权时可传 `--cookies-from-browser chrome`；合并音视频使用 `-f 'bestvideo[height<=720]+bestaudio/best' --merge-output-format mp4`，不要用 `best[height<=720]/best` 假定存在合流格式。授权在本次视频处理内持续有效，遇格式问题可直接修复重试，不重复询问。

## 3. 原始提取与整理

```bash
uv run python .codex/skills/analyze-boss-mo/scripts/transcribe_audio.py /tmp/boss-mo-<BVID>.mp4 -o /tmp/boss-mo-<BVID>-raw.txt --wav /tmp/boss-mo-<BVID>.wav --model small --language zh
```

Apple Silicon本机已具备MLX和模型时，可用本目录同一脚本加速复核：

```bash
uv run python .codex/skills/analyze-boss-mo/scripts/transcribe_audio.py /tmp/boss-mo-<BVID>.mp4 -o /tmp/boss-mo-<BVID>-review.txt --wav /tmp/boss-mo-<BVID>.wav --backend mlx --model mlx-community/whisper-large-v3-turbo --language zh
```

不要求每次运行两遍；首次转写质量充分时直接整理，有价位或分数歧义才复核。MLX也可能错认分数，不能因模型较大就覆盖清晰原画。

完整读取原始稿后分段整理，不直接摘要。ASR 识别的价格、周期、方向、指数与交易术语必须对照图表；有歧义回听片段或用更高模型复核。不把画面观察池里的对象当作者提及。按 futures-analysis.md 完成品种表和价位条件表；“未说明”“待核”不能由推理悄悄补齐。

稿件覆盖到视频结束；无有效信息的尾部可注明。正式文字稿落盘冻结后，才创建总结。总结只用冻结稿，外部规则核对放单独说明并附官方来源。

## 4. 关键帧

```bash
uv run python .codex/skills/analyze-boss-mo/scripts/extract-frames.py /tmp/boss-mo-<BVID>.mp4 --times 30 120 240 --output-dir docs/public/images/trading/boss-mo/YYYY-MM-DD-BVID --contact-sheet /tmp/boss-mo-<BVID>-contact.jpg
```

时间按实际议题选，示例不是固定时间。用图像工具检查联系表和关键帧，核对图表符号、周期、日期、刻度与画面标注；不清晰时重新选择清晰度/时刻，不能靠缩略图猜数。每张图片注明时间点及支持的观点，短片不凑数量。

项目使用 R2 图片：本 skill 独立上传脚本为 `scripts/upload-images-to-r2.mjs`，路径使用项目根目录；本期明确图片目录作为参数，禁止 --all。该脚本依赖项目的 AWS SDK 与 .env 配置，不输出凭证。上传完成后仅替换本期正文的图片引用，避免扫描改写其他文章。

```bash
node .codex/skills/analyze-boss-mo/scripts/upload-images-to-r2.mjs docs/public/images/trading/boss-mo/YYYY-MM-DD-BVID
```

最终正文使用返回的 R2 URL。媒体与原始提取稿只在临时目录，图片按项目资源策略保留本地忽略副本，不提交二进制资源。

## 5. 文档与导航

默认 `transcripts/YYYY-MM-DD-BVID.md` 和 `trading-days/YYYY-MM-DD-BVID.md`，先稿后总结。加入模块索引并在 config.mts 的 boss墨 父块下新增日期链接，检查其他作者块没有本期链接。人物首页只改介绍和入口；有证据再更新 expert-profile.md。未建立的会员栏目不虚构。

## 6. 验证及清理

```bash
uv run python .codex/skills/analyze-boss-mo/scripts/quick_validate.py .codex/skills/analyze-boss-mo
npm run docs:build
git diff --check
```

另检查本期的原视频链接、文字稿互链、品种/价位表、图片时间、R2 地址和所有导航收录。构建不等于内容核对通过。

完成正式文件后列出临时文件，每次只删除一个已知明确路径。禁止循环、通配符、递归或批量删除；如需批量清理请用户手动处理。不自行提交、推送或发布站点。
