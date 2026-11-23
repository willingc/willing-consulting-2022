#!/usr/bin/env python3
"""Generate small WebP thumbnails for listing cards (home, blog, about).

Listing cards show each page's front-matter `image` at about 250-330 CSS px
wide and 150 px tall, cropped with `object-fit: cover` (centered). Serving the
full-size originals there wastes a lot of bandwidth, so this script writes a
center-cropped, resized WebP copy of each image to `thumbs/` (mirroring the
original path) and records them in `thumbs/manifest.json`.

`_post-render-thumbnails.ts` then points the listing cards at these files
after each Quarto build. Front matter is unchanged, so social-preview images
and each post's header image keep using the originals.

Run locally (macOS) after adding or changing a post's `image`, then commit
the new files under `thumbs/`:

    python3 _scripts/make_thumbnails.py

Requires `sips` (built into macOS) and `cwebp` (`brew install webp`).
A thumbnail is skipped if it would not be at least 25% smaller than the
original; those cards keep using the original image.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
THUMBS = ROOT / "thumbs"
MANIFEST = THUMBS / "manifest.json"

# Pages whose front-matter `image` appears as a listing card.
SOURCES = ["blog/posts/*.qmd", "about/*.qmd"]

ASPECT = 1.6       # width / height; the narrowest card shape (desktop grid)
MAX_WIDTH = 880    # ~330 CSS px card on a phone at 2.6x pixel density
QUALITY = 72
MIN_SAVING = 0.25  # keep a thumbnail only if it is at least 25% smaller


def front_matter_image(qmd: Path) -> Path | None:
    text = qmd.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    m = re.search(r"^image:\s*['\"]?([^'\"\n]+?)['\"]?\s*$", text[:end], re.M)
    if not m or m.group(1).startswith(("http://", "https://")):
        return None
    return (qmd.parent / m.group(1)).resolve()


def image_size(path: Path) -> tuple[int, int]:
    out = subprocess.run(
        ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    w = int(re.search(r"pixelWidth: (\d+)", out).group(1))
    h = int(re.search(r"pixelHeight: (\d+)", out).group(1))
    return w, h


def center_crop(w: int, h: int) -> tuple[int, int, int, int]:
    if w / h > ASPECT:  # too wide: trim the sides
        cw, ch = round(h * ASPECT), h
    else:               # too tall: trim top and bottom
        cw, ch = w, round(w / ASPECT)
    return (w - cw) // 2, (h - ch) // 2, cw, ch


def main() -> int:
    for tool in ("sips", "cwebp"):
        if not shutil.which(tool):
            sys.exit(f"error: `{tool}` not found (cwebp: `brew install webp`)")

    images = sorted({
        img for pattern in SOURCES for qmd in ROOT.glob(pattern)
        if (img := front_matter_image(qmd)) and img.is_file()
    })
    manifest: dict[str, dict] = {}
    for src in images:
        rel = src.relative_to(ROOT).as_posix()
        dest = THUMBS / Path(rel).with_suffix(".webp")
        w, h = image_size(src)
        x, y, cw, ch = center_crop(w, h)
        out_w = min(MAX_WIDTH, cw)
        out_h = round(out_w / cw * ch)
        dest.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["cwebp", "-quiet", "-q", str(QUALITY), "-metadata", "none",
             "-crop", str(x), str(y), str(cw), str(ch),
             "-resize", str(out_w), str(out_h), str(src), "-o", str(dest)],
            check=True,
        )
        before, after = src.stat().st_size, dest.stat().st_size
        if after > before * (1 - MIN_SAVING):
            dest.unlink()
            print(f"skip  {rel}: thumbnail not much smaller ({after // 1024} KB vs {before // 1024} KB)")
            continue
        manifest[rel] = {
            "thumb": dest.relative_to(ROOT).as_posix(),
            "width": out_w,
            "height": out_h,
        }
        print(f"thumb {rel}: {before // 1024} KB -> {after // 1024} KB ({out_w}x{out_h})")

    # Remove thumbnails that are no longer used.
    keep = {THUMBS / v["thumb"].removeprefix("thumbs/") for v in manifest.values()}
    for old in THUMBS.rglob("*.webp"):
        if old not in keep:
            old.unlink()
            print(f"removed stale {old.relative_to(ROOT)}")

    MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"wrote {MANIFEST.relative_to(ROOT)} ({len(manifest)} thumbnails)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
