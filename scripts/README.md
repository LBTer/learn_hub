# scripts

运行本目录中的脚本时，优先使用项目的 `uv` 环境，不要直接调用系统 Python：

```bash
uv run python scripts/transcribe_audio.py <音频文件>
```

如果需要进入虚拟环境，也可以先执行 `uv sync`，再使用 `.venv/bin/python` 运行脚本。
# R2 image uploads

The upload command reads Cloudflare R2 settings from the repository's `.env` file.
It never deletes local or remote files.

```bash
# Verify credentials and bucket access.
npm run images:upload -- --check

# Preview the complete migration without contacting R2.
npm run images:upload -- --all --dry-run

# Upload every image, then replace matching /images/... links in Markdown.
npm run images:upload -- --all --rewrite

# Upload images created by one analysis and rewrite only their matching links.
npm run images:upload -- docs/public/images/trading/author/date --rewrite
```

Unchanged objects are skipped using SHA-256 metadata. Use `--force` only when an
object must be uploaded again. Pass `/images/trading/...` as an alternative to a
repository-relative path when integrating the command into analysis workflows.
The default concurrency is 3 and each R2 request retries transient network errors
up to 8 attempts; use `--concurrency=1` on an especially unstable connection.
