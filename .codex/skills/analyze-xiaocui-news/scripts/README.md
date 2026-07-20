# 本 skill 的视频转写脚本

`transcribe_audio.py` 在 YouTube 无可用字幕时，把音频/视频转为 16 kHz 单声道 WAV，并使用 `faster-whisper` 生成带时间轴的中文原始转写底稿。

优先使用官方或创作者字幕；确需转写时，在项目根目录运行：

```bash
uv run python .codex/skills/analyze-xiaocui-news/scripts/transcribe_audio.py <音频或视频> -o <临时底稿路径> --wav <临时WAV路径> --model small --language zh --print
```

底稿只用于整理正式文字稿，不能直接生成交易日总结或冒充主播原话。音频、WAV 和原始底稿应放在临时目录，任务完成后逐个删除，不提交到知识库。
