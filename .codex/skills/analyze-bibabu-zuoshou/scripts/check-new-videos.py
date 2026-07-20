#!/usr/bin/env python3
"""Check whether Bibabu Zuoshou published videos on a given date.

The script reads the Bilibili space through yt-dlp and can temporarily use the
local Chrome login state via yt-dlp's --cookies-from-browser option. It does not
export or store cookies in this repository.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


DEFAULT_SPACE_URL = "https://space.bilibili.com/3546557003598528/video"
DEFAULT_TIMEZONE = "Asia/Shanghai"


@dataclass(frozen=True)
class Video:
    bvid: str
    title: str
    url: str
    upload_date: str
    upload_time: str | None
    duration: float | None


def run_yt_dlp(args: list[str]) -> str:
    command = ["yt-dlp", *args]
    try:
        completed = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError:
        raise SystemExit("未找到 yt-dlp。请先安装 yt-dlp，或使用已带 yt-dlp 的环境运行。")
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr.strip()
        raise SystemExit(f"yt-dlp 执行失败：\n{stderr}") from exc

    return completed.stdout


def load_recent_entries(space_url: str, limit: int, use_chrome_cookies: bool) -> list[dict[str, Any]]:
    args = [
        "--flat-playlist",
        "--dump-single-json",
        "--playlist-end",
        str(limit),
    ]
    if use_chrome_cookies:
        args.extend(["--cookies-from-browser", "chrome"])
    args.append(space_url)

    data = json.loads(run_yt_dlp(args))
    entries = data.get("entries") or []
    return [entry for entry in entries if entry.get("id") or entry.get("url")]


def load_video_metadata(url: str, use_chrome_cookies: bool) -> dict[str, Any]:
    fields = "%(.{id,title,timestamp,upload_date,webpage_url,duration,uploader,uploader_id})j"
    args = ["--skip-download", "--no-playlist", "--print", fields]
    if use_chrome_cookies:
        args.extend(["--cookies-from-browser", "chrome"])
    args.append(url)

    output = run_yt_dlp(args).strip()
    if not output:
        return {}
    return json.loads(output.splitlines()[-1])


def warn(message: str) -> None:
    print(message, file=sys.stderr)


def normalize_upload_date(metadata: dict[str, Any], timezone: ZoneInfo) -> tuple[str, str | None]:
    timestamp = metadata.get("timestamp")
    if timestamp:
        uploaded_at = datetime.fromtimestamp(int(timestamp), timezone)
        return uploaded_at.strftime("%Y-%m-%d"), uploaded_at.strftime("%Y-%m-%d %H:%M:%S %Z")

    upload_date = metadata.get("upload_date")
    if upload_date and len(str(upload_date)) == 8:
        raw = str(upload_date)
        return f"{raw[:4]}-{raw[4:6]}-{raw[6:8]}", None

    return "unknown", None


def collect_videos(args: argparse.Namespace) -> list[Video]:
    timezone = ZoneInfo(args.timezone)
    entries = load_recent_entries(args.space_url, args.limit, not args.no_chrome_cookies)
    videos: list[Video] = []

    for entry in entries:
        url = entry.get("url") or f"https://www.bilibili.com/video/{entry['id']}"
        try:
            metadata = load_video_metadata(url, not args.no_chrome_cookies)
        except SystemExit as exc:
            warn(f"跳过单条视频元数据读取失败：{url}\n{exc}")
            continue
        upload_date, upload_time = normalize_upload_date(metadata, timezone)
        if upload_date != args.date:
            continue

        bvid = str(metadata.get("id") or entry.get("id") or Path(url).name)
        videos.append(
            Video(
                bvid=bvid,
                title=str(metadata.get("title") or entry.get("title") or ""),
                url=str(metadata.get("webpage_url") or url),
                upload_date=upload_date,
                upload_time=upload_time,
                duration=metadata.get("duration"),
            )
        )

    return videos


def print_markdown(videos: list[Video], date: str) -> None:
    if not videos:
        print(f"{date} 暂未发现比巴卜作手新视频。")
        return

    print(f"{date} 发现 {len(videos)} 个比巴卜作手新视频：")
    for video in videos:
        duration = f"，时长 {int(video.duration // 60)}:{int(video.duration % 60):02d}" if video.duration else ""
        upload_time = f"，发布时间 {video.upload_time}" if video.upload_time else ""
        print(f"- {video.title} ({video.bvid}{upload_time}{duration})")
        print(f"  {video.url}")


def parse_args() -> argparse.Namespace:
    today = datetime.now(ZoneInfo(DEFAULT_TIMEZONE)).strftime("%Y-%m-%d")
    parser = argparse.ArgumentParser(description="检查比巴卜作手当天是否有新视频，并输出视频链接。")
    parser.add_argument("--date", default=today, help=f"要检查的日期，格式 YYYY-MM-DD，默认今天：{today}")
    parser.add_argument("--limit", type=int, default=8, help="检查空间最近 N 个投稿，默认 8。")
    parser.add_argument("--space-url", default=DEFAULT_SPACE_URL, help="B 站空间投稿页 URL。")
    parser.add_argument("--timezone", default=DEFAULT_TIMEZONE, help=f"日期判断时区，默认 {DEFAULT_TIMEZONE}。")
    parser.add_argument("--json", action="store_true", help="以 JSON 输出结果。")
    parser.add_argument(
        "--no-chrome-cookies",
        action="store_true",
        help="不读取 Chrome 登录态，仅使用公开接口。",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    videos = collect_videos(args)

    if args.json:
        print(json.dumps([video.__dict__ for video in videos], ensure_ascii=False, indent=2))
    else:
        print_markdown(videos, args.date)

    return 0


if __name__ == "__main__":
    sys.exit(main())
