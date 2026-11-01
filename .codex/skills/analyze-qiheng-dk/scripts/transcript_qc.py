#!/usr/bin/env python3
"""Mechanical quality checks for Qiheng timeline transcripts."""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path


TIMED_HEADING_RE = re.compile(
    r"^#{2,6}\s+.*?(?P<time>\d{1,2}:\d{2}(?::\d{2})?)\b(?P<title>.*)$"
)
HEADING_RE = re.compile(r"^#{2,6}\s+(?P<title>.+?)\s*$")
STOP_SECTION_RE = re.compile(
    r"^(整理者总结|整理者小结|听辨待核|事实核验(?:与边界)?|"
    r"核验与编辑补注|精品笔记|相关导航|导航)\b"
)
CAVEAT_MARKERS = (
    "不等于",
    "不能证明",
    "未核实",
    "未经核实",
    "不代表",
    "未证明",
    "不作为事实",
)


@dataclass(frozen=True)
class TimedHeading:
    seconds: int
    label: str
    title: str
    line_number: int


def parse_timestamp(value: str) -> int:
    parts = value.split(":")
    if len(parts) == 2:
        minutes, seconds = (int(part) for part in parts)
        if seconds >= 60:
            raise ValueError(f"秒数超出范围：{value}")
        return minutes * 60 + seconds
    if len(parts) == 3:
        hours, minutes, seconds = (int(part) for part in parts)
        if minutes >= 60 or seconds >= 60:
            raise ValueError(f"时间超出范围：{value}")
        return hours * 3600 + minutes * 60 + seconds
    raise ValueError(f"无法识别时间：{value}")


def format_timestamp(seconds: int) -> str:
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def scan_transcript(text: str) -> tuple[list[TimedHeading], str]:
    headings: list[TimedHeading] = []
    body_lines: list[str] = []
    timeline_started = False

    for line_number, line in enumerate(text.splitlines(), start=1):
        timed_match = TIMED_HEADING_RE.match(line)
        if timed_match:
            timeline_started = True
            label = timed_match.group("time")
            headings.append(
                TimedHeading(
                    seconds=parse_timestamp(label),
                    label=label,
                    title=timed_match.group("title").strip(" ：:-—"),
                    line_number=line_number,
                )
            )
            body_lines.append(line)
            continue

        heading_match = HEADING_RE.match(line)
        if timeline_started and heading_match:
            title = heading_match.group("title").strip()
            if STOP_SECTION_RE.match(title):
                break

        if timeline_started:
            body_lines.append(line)

    return headings, "\n".join(body_lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="检查奇衡文字稿的时间轴覆盖和编辑性风险。"
    )
    parser.add_argument("markdown", type=Path, help="要检查的 Markdown 文字稿")
    parser.add_argument(
        "--duration",
        help="视频总时长，格式 MM:SS 或 HH:MM:SS；提供后检查结尾覆盖",
    )
    parser.add_argument(
        "--max-gap",
        type=int,
        default=180,
        help="相邻时间标题允许的最大秒数，默认 180",
    )
    parser.add_argument(
        "--start-tolerance",
        type=int,
        default=120,
        help="首个时间标题距视频开头允许的最大秒数，默认 120",
    )
    parser.add_argument(
        "--end-tolerance",
        type=int,
        default=180,
        help="最后时间标题距视频结尾允许的最大秒数，默认 180",
    )
    parser.add_argument(
        "--max-caveats",
        type=int,
        default=3,
        help="课程正文中编辑性边界词的警告阈值，默认 3",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if args.max_gap <= 0 or args.start_tolerance < 0 or args.end_tolerance < 0:
        print("ERROR: 时间阈值必须为非负数，max-gap 必须大于 0。")
        return 2
    if args.max_caveats < 0:
        print("ERROR: max-caveats 不能为负数。")
        return 2
    if not args.markdown.is_file():
        print(f"ERROR: 文件不存在：{args.markdown}")
        return 2

    try:
        text = args.markdown.read_text(encoding="utf-8")
        headings, course_body = scan_transcript(text)
        duration = parse_timestamp(args.duration) if args.duration else None
    except (OSError, UnicodeError, ValueError) as exc:
        print(f"ERROR: {exc}")
        return 2

    errors: list[str] = []
    warnings: list[str] = []

    if not headings:
        errors.append("没有找到含“02:10”等时间标记的二级至六级标题。")
    else:
        first = headings[0]
        if first.seconds > args.start_tolerance:
            errors.append(
                f"首个时间标题在 {first.label}（第 {first.line_number} 行），"
                f"晚于允许的 {format_timestamp(args.start_tolerance)}。"
            )

        for previous, current in zip(headings, headings[1:]):
            if current.seconds < previous.seconds:
                errors.append(
                    f"时间轴倒退：第 {previous.line_number} 行 {previous.label} → "
                    f"第 {current.line_number} 行 {current.label}。"
                )
                continue
            gap = current.seconds - previous.seconds
            if gap > args.max_gap:
                errors.append(
                    f"时间空档 {format_timestamp(gap)}：{previous.label} → {current.label} "
                    f"（第 {previous.line_number}—{current.line_number} 行），请回读该区间。"
                )

        if duration is not None:
            last = headings[-1]
            if last.seconds > duration:
                errors.append(
                    f"最后时间标题 {last.label} 超出视频总时长 "
                    f"{format_timestamp(duration)}。"
                )
            else:
                tail_gap = duration - last.seconds
                if tail_gap > args.end_tolerance:
                    errors.append(
                        f"最后时间标题 {last.label} 距视频结尾仍有 "
                        f"{format_timestamp(tail_gap)}，请检查结尾覆盖。"
                    )

    caveat_counts = {
        marker: course_body.count(marker)
        for marker in CAVEAT_MARKERS
        if marker in course_body
    }
    caveat_total = sum(caveat_counts.values())
    if caveat_total > args.max_caveats:
        details = "、".join(f"{marker}×{count}" for marker, count in caveat_counts.items())
        warnings.append(
            f"课程正文出现 {caveat_total} 处编辑性边界词（{details}）。"
            "请确认它们是作者原有表达；整理者核验应集中到文末。"
        )

    print(f"文件：{args.markdown}")
    print(f"时间标题：{len(headings)}")
    if headings:
        print(f"时间范围：{headings[0].label} → {headings[-1].label}")
        if duration is not None:
            print(f"视频时长：{format_timestamp(duration)}")

    for message in warnings:
        print(f"WARN: {message}")
    for message in errors:
        print(f"ERROR: {message}")

    if errors:
        print(f"结果：未通过（{len(errors)} 个错误，{len(warnings)} 个警告）")
        return 1
    print(f"结果：通过（{len(warnings)} 个警告）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
