#!/usr/bin/env python3
"""Extract exact-time video frames and an optional contact sheet for boss墨."""
import argparse
from pathlib import Path
import av
from PIL import Image, ImageDraw


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('video')
    p.add_argument('--times', type=float, nargs='+', required=True)
    p.add_argument('--output-dir', type=Path, required=True)
    p.add_argument('--contact-sheet', type=Path)
    args = p.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    cards = []
    with av.open(args.video) as container:
        stream = container.streams.video[0]
        duration = float(container.duration / av.time_base) if container.duration else None
        for second in args.times:
            if second < 0 or (duration is not None and second >= duration):
                raise SystemExit(f'Time {second} outside video duration {duration}')
            container.seek(int(second / stream.time_base), stream=stream, backward=True)
            selected = None
            for frame in container.decode(stream):
                if frame.time is not None and frame.time >= second:
                    selected = frame
                    break
            if selected is None:
                raise SystemExit(f'No frame at {second}')
            im = selected.to_image().convert('RGB')
            path = args.output_dir / f'{int(second):04d}.jpg'
            im.save(path, quality=92)
            print(f'{second:.2f}s -> {path} (actual {selected.time:.3f}s)')
            im.thumbnail((480, 270))
            card = Image.new('RGB', (480, 298), 'white')
            card.paste(im, (0, 0))
            ImageDraw.Draw(card).text((8, 278), f'{second:.1f}s', fill='black')
            cards.append(card)
    if args.contact_sheet:
        columns = min(2, len(cards))
        sheet = Image.new('RGB', (480 * columns, 298 * ((len(cards)+columns-1)//columns)), '#ddd')
        for i, card in enumerate(cards):
            sheet.paste(card, ((i % columns)*480, (i//columns)*298))
        args.contact_sheet.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(args.contact_sheet, quality=90)


if __name__ == '__main__':
    main()
