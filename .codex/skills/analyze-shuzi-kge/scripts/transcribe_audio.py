#!/usr/bin/env python3
"""Convert audio to wav and transcribe it with faster-whisper."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def format_time(seconds: float) -> str:
    total = int(round(seconds))
    hours, remainder = divmod(total, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def run_ffmpeg(input_path: Path, wav_path: Path, sample_rate: int) -> None:
    wav_path.parent.mkdir(parents=True, exist_ok=True)
    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-ar",
        str(sample_rate),
        "-ac",
        "1",
        str(wav_path),
    ]
    subprocess.run(command, check=True)


def transcribe(args: argparse.Namespace) -> None:
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise SystemExit(
            "Missing dependency: faster_whisper. Run with the project uv environment "
            "or install faster-whisper before using this script."
        ) from exc

    input_path = Path(args.input).expanduser().resolve()
    if not input_path.is_file():
        raise SystemExit(f"Input audio does not exist: {input_path}")

    output_path = Path(args.output).expanduser().resolve()
    wav_path = (
        Path(args.wav).expanduser().resolve()
        if args.wav
        else output_path.with_suffix(".wav")
    )

    run_ffmpeg(input_path, wav_path, args.sample_rate)

    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)
    segments, info = model.transcribe(
        str(wav_path),
        language=args.language,
        vad_filter=not args.no_vad,
        beam_size=args.beam_size,
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        handle.write(f"# 音频转写底稿\n\n")
        handle.write(f"- 输入文件：`{input_path}`\n")
        handle.write(f"- WAV 文件：`{wav_path}`\n")
        handle.write(f"- 模型：`{args.model}`\n")
        handle.write(f"- 识别语言：`{info.language}`\n")
        handle.write(f"- 语言置信度：`{info.language_probability:.4f}`\n\n")
        handle.write("## 时间轴\n\n")
        for segment in segments:
            text = segment.text.strip()
            if not text:
                continue
            start = format_time(segment.start)
            end = format_time(segment.end)
            line = f"- [{start} - {end}] {text}\n"
            handle.write(line)
            if args.print:
                print(line, end="")

    print(f"Wrote transcript: {output_path}")
    print(f"Wrote wav: {wav_path}")


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert an audio file to 16 kHz mono wav and transcribe it."
    )
    parser.add_argument("input", help="Input audio/video file, such as .m4s, .m4a, .mp3, .mp4")
    parser.add_argument("-o", "--output", required=True, help="Transcript output path")
    parser.add_argument("--wav", help="Intermediate wav output path")
    parser.add_argument("--model", default="small", help="faster-whisper model name")
    parser.add_argument("--language", default="zh", help="Recognition language")
    parser.add_argument("--device", default="cpu", help="Whisper device")
    parser.add_argument("--compute-type", default="int8", help="Whisper compute type")
    parser.add_argument("--beam-size", type=int, default=5, help="Beam size")
    parser.add_argument("--sample-rate", type=int, default=16000, help="Wav sample rate")
    parser.add_argument("--no-vad", action="store_true", help="Disable VAD filtering")
    parser.add_argument("--print", action="store_true", help="Print segments while writing")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    transcribe(parse_args(argv or sys.argv[1:]))


if __name__ == "__main__":
    main()
