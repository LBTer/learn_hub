#!/usr/bin/env python3
"""Acquire course evidence, transcribe audio and extract frames; never delete files."""
from __future__ import annotations

import argparse
import importlib.util
import json
import math
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

UID = 473168952
API = 'https://api.bilibili.com/'


def save_json(path, data):
    with Path(path).open('x', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def request_json(url, referer):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': referer})
    with urllib.request.urlopen(req, timeout=25) as response:
        return json.load(response)


def api_data(endpoint, referer):
    result = request_json(API + endpoint, referer)
    if result.get('code') != 0 or not isinstance(result.get('data'), dict):
        raise ValueError(f'B站接口失败，code={result.get("code")}；不能据此判断没有字幕')
    return result['data']


def run(command):
    # Do not persist media URLs, extractor responses or credentials in logs.
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode:
        raise RuntimeError(f'{Path(command[0]).name} 执行失败（退出码 {result.returncode}）；未保存可能含签名地址的错误输出')
    return result.stdout


def probe(path):
    return json.loads(run(['ffprobe', '-v', 'error', '-show_entries',
                          'format=duration,size:stream=codec_type,width,height', '-of', 'json', str(path)]))


def validate_media(info, expected):
    actual = float(info['format']['duration'])
    types = {s['codec_type'] for s in info['streams']}
    if not {'video', 'audio'} <= types:
        raise ValueError('下载结果缺少视频或音轨')
    if not math.isfinite(actual) or abs(actual - expected) > max(3, expected * .01):
        raise ValueError(f'时长不匹配：页面 {expected}s，文件 {actual}s；可能不完整')
    return actual


def select_page(data, page):
    if data.get('owner', {}).get('mid') != UID:
        raise ValueError('UP主UID不是奇衡；停止取材')
    pages = data.get('pages', [])
    if page < 1 or page > len(pages):
        raise ValueError('分P编号超出范围')
    return pages[page - 1]


def fetch(args):
    match = re.search(r'BV[0-9A-Za-z]{10}', args.source)
    if not match:
        raise ValueError('需要BVID或包含BVID的视频链接')
    bvid = match.group()
    url = f'https://www.bilibili.com/video/{bvid}/?p={args.page}'
    data = api_data(f'x/web-interface/view?bvid={bvid}', url)
    page = select_page(data, args.page)
    folder = Path(args.output).expanduser().resolve() if args.output else Path(tempfile.mkdtemp(prefix=f'qiheng-{bvid}-'))
    folder.mkdir(parents=True, exist_ok=True)
    if any(folder.iterdir()):
        raise ValueError('取材目录必须为空，避免覆盖已有底稿')
    metadata = {'bvid': bvid, 'cid': page['cid'], 'page': args.page, 'title': data['title'],
                'part': page.get('part'), 'uid': UID, 'published_unix': data['pubdate'],
                'duration': page['duration'], 'source': url}
    save_json(folder / 'source.json', metadata)
    print(f'取材目录：{folder}', flush=True)
    # An API error is kept distinct from an empty subtitle list; ASR can still proceed.
    try:
        player = api_data(f'x/player/v2?bvid={bvid}&cid={page["cid"]}', url)
        available = player.get('subtitle', {}).get('subtitles', [])
        tracks = [t for t in available if str(t.get('lan', '')).startswith(('zh', 'ai-zh'))]
        tracks.sort(key=lambda t: str(t.get('lan', '')).startswith('ai-'))
        if tracks:
            track = tracks[0]
            subtitle_url = track['subtitle_url']
            if subtitle_url.startswith('//'):
                subtitle_url = 'https:' + subtitle_url
            raw = request_json(subtitle_url, url)
            segments = [{'start': float(x['from']), 'end': float(x['to']), 'text': x['content']}
                        for x in raw['body']]
            if not segments:
                raise ValueError('字幕文件为空')
            save_json(folder / 'subtitles.json', segments)
            subtitle_status = {'status': 'downloaded', 'language': track['lan'], 'segments': len(segments),
                               'first': segments[0]['start'], 'last': segments[-1]['end']}
        else:
            subtitle_status = {'status': 'no_chinese_track', 'track_count': len(available)}
    except Exception as exc:
        subtitle_status = {'status': 'unavailable', 'error_type': type(exc).__name__}
    save_json(folder / 'subtitle-status.json', subtitle_status)
    print('字幕状态：' + subtitle_status['status'], flush=True)
    # yt-dlp chooses available streams dynamically. -k retains intermediates: no automatic deletion.
    run([sys.executable, '-m', 'yt_dlp', '--no-playlist', '--socket-timeout', '20', '--retries', '1',
         '--fragment-retries', '1', '--keep-video', '--no-progress', '--quiet',
         '-f', 'bv[height<=480]+ba/b[height<=480]', '--merge-output-format', 'mp4',
         '-o', str(folder / 'video.%(ext)s'), url])
    media = folder / 'video.mp4'
    info = probe(media)
    actual = validate_media(info, float(page['duration']))
    save_json(folder / 'media-check.json', {'verified_duration': actual, 'probe': info})
    save_json(folder / 'files.json', {'files': [str(p) for p in sorted(folder.iterdir()) if p.is_file()]})
    print(f'完整音视频核验通过：{actual:.3f}s。所有文件保留，未自动清理。')


def shared_module():
    path = Path(__file__).resolve().parents[4] / 'scripts/transcribe_audio.py'
    spec = importlib.util.spec_from_file_location('shared_transcribe', path)
    if spec is None or spec.loader is None:
        raise ValueError('未找到项目 scripts/transcribe_audio.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def seconds(value):
    parts = value.split(':')
    if len(parts) > 3:
        raise argparse.ArgumentTypeError('时间使用秒、MM:SS或HH:MM:SS')
    try:
        values = [float(x) for x in parts]
        if any(not math.isfinite(x) or x < 0 for x in values) or any(x >= 60 for x in values[1:]):
            raise ValueError()
        return sum(x * 60**i for i, x in enumerate(reversed(values)))
    except ValueError as exc:
        raise argparse.ArgumentTypeError('无效时间') from exc


def transcribe(args):
    from faster_whisper import WhisperModel
    folder = Path(args.output).expanduser().resolve()
    folder.mkdir(parents=True, exist_ok=True)
    paths = [folder / n for n in ['audio.wav', 'raw.md', 'segments.json', 'transcription.json']]
    if any(p.exists() for p in paths):
        raise ValueError('转写输出已存在；请指定新的输出目录')
    source = Path(args.input).expanduser().resolve()
    if not source.is_file():
        raise ValueError('输入文件不存在')
    shared = shared_module()
    if args.start is not None or args.duration is not None:
        command = ['ffmpeg', '-v', 'error', '-n', '-ss', str(args.start or 0), '-i', str(source)]
        if args.duration is not None:
            if args.duration <= 0:
                raise ValueError('片段时长必须大于0')
            command += ['-t', str(args.duration)]
        run(command + ['-ar', '16000', '-ac', '1', str(paths[0])])
    else:
        shared.run_ffmpeg(source, paths[0], 16000)
    model = WhisperModel(args.model, device='cpu', compute_type='int8')
    stream, info = model.transcribe(str(paths[0]), language='zh', vad_filter=True, beam_size=5,
                                   condition_on_previous_text=False, repetition_penalty=1.2)
    segments = []
    offset = args.start or 0
    with paths[1].open('x', encoding='utf-8') as f:
        f.write('# 原始自动转写底稿\n\n未经逐句校听，不是正式文字稿。\n\n')
        for seg in stream:
            row = {'start': seg.start + offset, 'end': seg.end + offset, 'text': seg.text.strip()}
            if not row['text']:
                continue
            segments.append(row)
            f.write(f'- [{shared.format_time(row["start"])} - {shared.format_time(row["end"])}] {row["text"]}\n')
            f.flush()
            if len(segments) % 100 == 0:
                print(f'已转写 {len(segments)} 段，至 {shared.format_time(row["end"])}', flush=True)
    if not segments:
        raise ValueError('未识别出语音；保留输入及中间文件供检查')
    save_json(paths[2], segments)
    save_json(paths[3], {'input': str(source), 'model': args.model, 'language': info.language,
                        'condition_on_previous_text': False, 'repetition_penalty': 1.2,
                        'offset': offset, 'count': len(segments), 'first': segments[0]['start'],
                        'last': segments[-1]['end'], 'files': [str(p) for p in paths]})
    print(f'转写完成：{len(segments)} 段。尚需全文阅读与人工核验。')


def frames(args):
    import av
    folder = Path(args.output).expanduser().resolve()
    folder.mkdir(parents=True, exist_ok=True)
    times = sorted(set(args.at))
    names = [folder / f'{round(t * 1000):08d}ms.png' for t in times]
    if len(set(names)) != len(names):
        raise ValueError('截图时间间隔小于1毫秒，文件名会冲突')
    manifest = folder / 'frames.json'
    if manifest.exists() or any(p.exists() for p in names):
        raise ValueError('截帧输出已存在；请使用新目录或不同时间')
    duration = float(probe(args.input)['format']['duration'])
    if any(t >= duration for t in times):
        raise ValueError('截图时间超出视频时长')
    records = []
    for t, path in zip(times, names):
        with av.open(args.input) as container:
            stream = container.streams.video[0]
            container.seek(int(t / stream.time_base), stream=stream, backward=True)
            for frame in container.decode(stream):
                if frame.time is not None and frame.time >= t:
                    frame.to_image().save(path)
                    records.append({'requested': t, 'actual': frame.time, 'file': str(path),
                                    'width': frame.width, 'height': frame.height})
                    break
            else:
                raise ValueError(f'未找到 {t}s 对应帧')
    save_json(manifest, records)
    print(f'已提取 {len(records)} 帧至 {folder}；逐图查看后才可入库。')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('fetch', help='公开接口字幕与完整视频获取；不读取登录凭证')
    p.add_argument('source'); p.add_argument('--page', type=int, default=1); p.add_argument('-o', '--output')
    p.set_defaults(func=fetch)
    p = sub.add_parser('transcribe', help='全片或短段转写，时间自动加回偏移')
    p.add_argument('input'); p.add_argument('-o', '--output', required=True)
    p.add_argument('--model', default='small'); p.add_argument('--start', type=seconds); p.add_argument('--duration', type=seconds)
    p.set_defaults(func=transcribe)
    p = sub.add_parser('frames', help='按指定时间提取无播放器遮挡的原始帧')
    p.add_argument('input'); p.add_argument('--at', nargs='+', type=seconds, required=True)
    p.add_argument('-o', '--output', required=True); p.set_defaults(func=frames)
    args = parser.parse_args()
    try:
        args.func(args)
    except Exception as exc:
        # urllib errors can include signed URLs; only our controlled exceptions are printed.
        message = str(exc) if type(exc) in (ValueError, RuntimeError) else type(exc).__name__
        parser.exit(1, f'失败：{message}\n已有文件保留，未执行删除。\n')


if __name__ == '__main__':
    main()
