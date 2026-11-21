#!/usr/bin/env python3
"""Reject incomplete or preview media before boss墨 transcription."""
import argparse
import json
import subprocess


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('video')
    p.add_argument('--expected-seconds', required=True, type=float)
    args = p.parse_args()
    if args.expected_seconds <= 0:
        p.error('Expected duration must be positive')
    probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                            'format=duration', '-of', 'json', args.video],
                           capture_output=True, text=True, check=True)
    duration = float(json.loads(probe.stdout)['format']['duration'])
    tolerance = max(2, args.expected_seconds * .01)
    if abs(duration - args.expected_seconds) > tolerance:
        raise SystemExit(f'INCOMPLETE: media {duration:.3f}s, metadata {args.expected_seconds:.3f}s; stop before full analysis')
    print(f'Complete media: {duration:.3f}s (metadata {args.expected_seconds:.3f}s)')


if __name__ == '__main__':
    main()
