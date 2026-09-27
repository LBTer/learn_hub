# 本 skill 的视频转写脚本

`transcribe_audio.py` 在 YouTube 字幕缺失或质量不足时，将音频/视频转为 16 kHz 单声道 WAV，并用 `faster-whisper` 生成带时间轴的中文原始转写底稿。

优先使用官方或创作者字幕；确需转写时，在项目根目录运行：

```bash
uv run python .codex/skills/analyze-rhino-finance/scripts/transcribe_audio.py <音频或视频> -o <临时底稿路径> --wav <临时WAV路径> --model small --language zh --print
```

底稿只用于整理文字稿和核对 ticker，不是逐字稿或最终事实来源。音频、WAV 和原始底稿应放在临时目录，任务完成后逐个删除，不提交到知识库。

新视频检查会从当前 Chrome 登录态读取频道 `/videos` 页中可见的公开与会员视频。定时任务可使用：

```bash
uv run .codex/skills/analyze-rhino-finance/scripts/check-new-videos.py --lookback-days 7 --limit 30 --json
```

结果中的 `video_type` 用 YouTube `availability` 分类；`member` 只说明当前账号可见的会员限制。按视频 ID 核对是否已处理，勿仅凭标题或日期去重。脚本只发现视频，不下载会员内容，也不保存 Cookie。
