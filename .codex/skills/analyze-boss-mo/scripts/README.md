# boss墨独立脚本

- `check-new-videos.py`：按北京时间日期检查投稿，默认公开请求；读取失败必须报告。
- `verify-media.py`：对比实际与元数据时长，阻止预览被误写为全片。
- `transcribe_audio.py`：通过 ffmpeg 和 faster-whisper 保存带时间轴的原始提取稿。
- `extract-frames.py`：PyAV 按时间截图，Pillow 输出联系表。
- `upload-images-to-r2.mjs`：本目录独立维护的 R2 上传实现，读取项目配置和 AWS SDK；仅指定本期图片目录，不使用 --all 或跨文档改写。
- `quick_validate.py`：检查 skill 元数据。

具体命令见本 skill 的 `references/video-analysis-workflow.md`。下载后必须先比较实际媒体与元数据时长，30 秒预览不进入全片分析流程。所有 Python 命令优先 `uv run python`；脚本不导入其他作者 skill。
