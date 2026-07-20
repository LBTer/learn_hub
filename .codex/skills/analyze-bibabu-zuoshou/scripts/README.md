# 本 skill 的视频转写脚本

`transcribe_audio.py` 用于在字幕缺失或质量不足时，把音频/视频转为 16 kHz 单声道 WAV，并使用 `faster-whisper` 生成带时间轴的中文原始转写底稿。

优先使用视频自带字幕；确需转写时，在项目根目录运行：

```bash
uv run python .codex/skills/analyze-bibabu-zuoshou/scripts/transcribe_audio.py <音频或视频> -o <临时底稿路径> --wav <临时WAV路径> --model small --language zh --print
```

输出仅是整理文字稿的过程底稿，不是逐字稿或最终事实来源。音频、WAV 和原始底稿应放在临时目录，完成正式文字稿后逐个删除，不提交到知识库。
