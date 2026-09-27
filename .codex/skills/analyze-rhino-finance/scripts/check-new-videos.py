#!/usr/bin/env python3
"""Check recent RhinoFinance public and members-only videos.

The script reads the YouTube channel through yt-dlp and can temporarily use the
local Chrome login state via yt-dlp's --cookies-from-browser option. It does not
export or store cookies in this repository.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


DEFAULT_CHANNEL_URL = "https://www.youtube.com/@RhinoFinance/videos"
DEFAULT_TIMEZONE = "Asia/Shanghai"
DEFAULT_YT_DLP_TIMEOUT = 90


@dataclass(frozen=True)
class Video:
    video_id: str
    title: str
    url: str
    upload_date: str
    upload_time: str | None
    duration: float | None
    availability: str | None
    live_status: str | None
    video_type: str


def run_yt_dlp(args: list[str], timeout: int, label: str) -> str:
    command = ["yt-dlp", *args]
    try:
        completed = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except FileNotFoundError:
        raise SystemExit("未找到 yt-dlp。请先安装 yt-dlp，或使用已带 yt-dlp 的环境运行。")
    except subprocess.TimeoutExpired as exc:
        stderr = (exc.stderr or "").strip()
        detail = f"\n{stderr}" if stderr else ""
        raise SystemExit(f"yt-dlp 执行超时（{label}，{timeout} 秒）：{detail}") from exc
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr.strip()
        raise SystemExit(f"yt-dlp 执行失败（{label}）：\n{stderr}") from exc

    return completed.stdout


def load_recent_entries(channel_url: str, limit: int, use_chrome_cookies: bool, timeout: int) -> list[dict[str, Any]]:
    args = [
        "--flat-playlist",
        "--dump-single-json",
        "--playlist-end",
        str(limit),
    ]
    if use_chrome_cookies:
        args.extend(["--cookies-from-browser", "chrome"])
    args.append(channel_url)

    warn(f"读取频道最近 {limit} 条视频列表：{channel_url}")
    data = json.loads(run_yt_dlp(args, timeout, "频道列表"))
    entries = data.get("entries") or []
    return [entry for entry in entries if entry.get("id") or entry.get("url")]


def load_video_metadata(url: str, use_chrome_cookies: bool, timeout: int) -> dict[str, Any]:
    fields = "%(.{id,title,timestamp,upload_date,release_timestamp,webpage_url,duration,uploader,uploader_id,availability,live_status})j"
    args = ["--skip-download", "--no-playlist", "--print", fields]
    if use_chrome_cookies:
        args.extend(["--cookies-from-browser", "chrome"])
    args.append(url)

    warn(f"读取单条视频元数据：{url}")
    output = run_yt_dlp(args, timeout, f"单条视频元数据 {url}").strip()
    if not output:
        return {}
    return json.loads(output.splitlines()[-1])


def warn(message: str) -> None:
    print(message, file=sys.stderr)


def normalize_upload_date(metadata: dict[str, Any], timezone: ZoneInfo) -> tuple[str, str | None]:
    timestamp = metadata.get("timestamp") or metadata.get("release_timestamp")
    if timestamp:
        uploaded_at = datetime.fromtimestamp(int(timestamp), timezone)
        return uploaded_at.strftime("%Y-%m-%d"), uploaded_at.strftime("%Y-%m-%d %H:%M:%S %Z")

    upload_date = metadata.get("upload_date")
    if upload_date and len(str(upload_date)) == 8:
        raw = str(upload_date)
        return f"{raw[:4]}-{raw[4:6]}-{raw[6:8]}", None

    return "unknown", None


def entry_url(entry: dict[str, Any]) -> str:
    url = str(entry.get("url") or entry.get("id") or "")
    if url.startswith("http"):
        return url
    if len(url) == 11:
        return f"https://www.youtube.com/watch?v={url}"
    return f"https://www.youtube.com/watch?v={Path(url).name}"


def collect_videos(args: argparse.Namespace) -> list[Video]:
    timezone = ZoneInfo(args.timezone)
    try:
        end_date = date.fromisoformat(args.date)
    except ValueError as exc:
        raise SystemExit("--date 必须为 YYYY-MM-DD。") from exc
    if args.lookback_days < 1:
        raise SystemExit("--lookback-days 必须至少为 1。")
    start_date = end_date - timedelta(days=args.lookback_days - 1)
    channel_url = args.channel_url or DEFAULT_CHANNEL_URL
    use_chrome_cookies = not args.no_chrome_cookies
    if use_chrome_cookies:
        warn("将通过 yt-dlp 临时读取 Chrome 登录态（--cookies-from-browser chrome），不导出或保存 Cookie。")
    else:
        warn("未使用 Chrome 登录态，仅检查公开页面。")

    entries: list[dict[str, Any]] = []
    seen_entry_ids: set[str] = set()
    for entry in load_recent_entries(channel_url, args.limit, use_chrome_cookies, args.yt_dlp_timeout):
        entry_id = str(entry.get("id") or entry.get("url") or "")
        if entry_id in seen_entry_ids:
            continue
        seen_entry_ids.add(entry_id)
        entries.append(entry)

    videos: list[Video] = []
    seen_ids: set[str] = set()

    for entry in entries:
        url = entry_url(entry)
        try:
            metadata = load_video_metadata(url, use_chrome_cookies, args.yt_dlp_timeout)
        except SystemExit as exc:
            warn(f"跳过单条视频元数据读取失败：{url}\n{exc}")
            continue
        upload_date, upload_time = normalize_upload_date(metadata, timezone)
        if upload_date == "unknown" or not start_date <= date.fromisoformat(upload_date) <= end_date:
            continue

        video_id = str(metadata.get("id") or entry.get("id") or Path(url).name)
        if video_id in seen_ids:
            continue
        seen_ids.add(video_id)
        videos.append(
            Video(
                video_id=video_id,
                title=str(metadata.get("title") or entry.get("title") or ""),
                url=str(metadata.get("webpage_url") or url),
                upload_date=upload_date,
                upload_time=upload_time,
                duration=metadata.get("duration"),
                availability=metadata.get("availability"),
                live_status=metadata.get("live_status"),
                video_type=(
                    "member"
                    if metadata.get("availability") in {"subscriber_only", "premium_only"}
                    else "public" if metadata.get("availability") == "public" else "unknown"
                ),
            )
        )

    return videos


def format_duration(duration: float | None) -> str:
    if not duration:
        return ""
    return f"，时长 {int(duration // 60)}:{int(duration % 60):02d}"


def print_markdown(videos: list[Video], date_range: str) -> None:
    if not videos:
        print(f"{date_range} 暂未发现视野环球财经 / RhinoFinance 新视频。")
        return

    print(f"{date_range} 发现 {len(videos)} 个视野环球财经 / RhinoFinance 视频：")
    for video in videos:
        upload_time = f"，发布时间 {video.upload_time}" if video.upload_time else ""
        availability = f"，可见性 {video.availability}" if video.availability else ""
        live_status = f"，直播状态 {video.live_status}" if video.live_status else ""
        print(f"- [{video.video_type}] {video.title} ({video.video_id}{upload_time}{format_duration(video.duration)}{availability}{live_status})")
        print(f"  {video.url}")


def parse_args() -> argparse.Namespace:
    today = datetime.now(ZoneInfo(DEFAULT_TIMEZONE)).strftime("%Y-%m-%d")
    parser = argparse.ArgumentParser(description="检查视野环球财经 / RhinoFinance 的公开视频与会员视频，并输出视频链接。")
    parser.add_argument("--date", default=today, help=f"窗口结束日期，格式 YYYY-MM-DD，默认今天：{today}")
    parser.add_argument("--lookback-days", type=int, default=1, help="包含结束日的回看天数，默认 1；定时任务建议 7。")
    parser.add_argument("--limit", type=int, default=10, help="检查频道最近 N 个视频，默认 10；跨周检查建议 30。")
    parser.add_argument(
        "--channel-url",
        default=DEFAULT_CHANNEL_URL,
        help="YouTube 频道视频页 URL，默认检查含公开和会员内容的 /videos。",
    )
    parser.add_argument("--timezone", default=DEFAULT_TIMEZONE, help=f"日期判断时区，默认 {DEFAULT_TIMEZONE}。")
    parser.add_argument(
        "--yt-dlp-timeout",
        type=int,
        default=DEFAULT_YT_DLP_TIMEOUT,
        help=f"单次 yt-dlp 调用超时时间，单位秒，默认 {DEFAULT_YT_DLP_TIMEOUT}。",
    )
    parser.add_argument("--json", action="store_true", help="以 JSON 输出结果。")
    parser.add_argument(
        "--no-chrome-cookies",
        action="store_true",
        help="不读取 Chrome 登录态，仅使用公开页面。",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    videos = collect_videos(args)

    if args.json:
        print(json.dumps([video.__dict__ for video in videos], ensure_ascii=False, indent=2))
    else:
        end_date = date.fromisoformat(args.date)
        start_date = end_date - timedelta(days=args.lookback_days - 1)
        date_range = str(end_date) if start_date == end_date else f"{start_date}—{end_date}"
        print_markdown(videos, date_range)

    return 0


if __name__ == "__main__":
    sys.exit(main())
