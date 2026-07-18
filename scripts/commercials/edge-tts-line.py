#!/usr/bin/env python3
"""Synthesize one commercial VO line via Microsoft Edge neural TTS (free, no API key)."""
from __future__ import annotations

import argparse
import asyncio
import sys

import edge_tts


async def synthesize(text: str, out: str, voice: str, rate: str, pitch: str) -> None:
    communicate = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch)
    await communicate.save(out)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--voice", default="en-US-ChristopherNeural")
    parser.add_argument("--rate", default="-12%")
    parser.add_argument("--pitch", default="-2Hz")
    args = parser.parse_args()
    try:
        asyncio.run(synthesize(args.text, args.out, args.voice, args.rate, args.pitch))
    except Exception as exc:  # noqa: BLE001 — surface to Node caller
        print(f"edge-tts failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
