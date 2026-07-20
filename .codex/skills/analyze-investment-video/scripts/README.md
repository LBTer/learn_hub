# 本 skill 的视频转写脚本

`transcribe_audio.py` 用于字幕缺失或质量不足时的本地语音转写：先调用 `ffmpeg` 生成 16 kHz 单声道 WAV，再用 `faster-whisper` 输出带时间轴的中文原始转写底稿。

优先使用视频自带字幕；确需转写时，在项目根目录运行：

```bash
uv run python .codex/skills/analyze-investment-video/scripts/transcribe_audio.py <音频或视频> -o <临时底稿路径> --wav <临时WAV路径> --model small --language zh --print
```

输出仅供整理正式文字稿，不得直接当作作者逐字原话或最终事实来源。音频、WAV 和原始底稿应放在临时目录，完成任务后逐个删除，不提交到知识库。
