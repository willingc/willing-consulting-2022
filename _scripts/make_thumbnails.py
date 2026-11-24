#!/usr/bin/env python3
"""Generate small WebP versions of front-matter images for listing cards and
blog post headers.

Two sizes are made for each page's front-matter `image`:

* cards   - listing cards (home, blog, about) show the image about 250-330 CSS
            px wide and 150 px tall, center-cropped with `object-fit: cover`.
            Card versions are center-cropped to 1.6:1 and at most 880 px wide.
* headers - each blog post shows its image at the top of the page (see
            blog/posts/title-block.html), full column width but at most 280 px
            tall, cropped from the top (`object-position: center top`).
            Header versions are cropped from the top to no taller than 1:1.25
            (the shape shown on phones) and at most 1200 px wide.

Files go to thumbs/cards/ and thumbs/headers/ (mirroring the original path)
and are listed in thumbs/manifest.json. `_post-render-images.ts` points the
pages at them after each Quarto build. Front matter is unchanged, so social
preview images keep using the originals.

Run locally (macOS) after adding or changing a page's `image`, then commit
the files under thumbs/:

    python3 _scripts/make_thumbnails.py

Requires `sips` (built into macOS) and `cwebp` (`brew install webp`).
A version is skipped if it would not be at least 25% smaller than the
original; those pages keep using the original image.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
THUMBS = ROOT / "thumbs"
MANIFEST = THUMBS / "manifest.json"
QUALITY = 72
MIN_SAVING = 0.25  # keep a version only if it is at least 25% smaller


@dataclass(frozen=True)
class Variant:
    name: str            # manifest section and folder under thumbs/
    sources: tuple       # globs of pages whose `image` uses this variant
    max_width: int
    min_aspect: float    # crop anything taller than width / min_aspect
    max_aspect: float    # crop anything wider than height * max_aspect
    anchor_top: bool     # vertical crop from the top instead of the center


VARIANTS = [
    # Narrowest card shape is ~1.6:1 (desktop grid); ~330 CSS px on a phone at 2.6x.
    Variant("cards", ("blog/posts/*.qmd", "about/*.qmd"), 880, 1.6, 1.6, False),
    # Header is full width and at most 280px tall; phones show ~1.25:1.
    Variant("headers", ("blog/posts/*.qmd",), 1200, 1.25, float("inf"), True),
]


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


def crop_box(w: int, h: int, v: Variant) -> tuple[int, int, int, int]:
    cw, ch = w, h
    if w / h > v.max_aspect:      # too wide: trim the sides (centered)
        cw = round(h * v.max_aspect)
    elif w / h < v.min_aspect:    # too tall: trim the bottom, or top and bottom
        ch = round(w / v.min_aspect)
    x = (w - cw) // 2
    y = 0 if v.anchor_top else (h - ch) // 2
    return x, y, cw, ch


def make(src: Path, v: Variant) -> dict | None:
    rel = src.relative_to(ROOT).as_posix()
    dest = THUMBS / v.name / Path(rel).with_suffix(".webp")
    w, h = image_size(src)
    x, y, cw, ch = crop_box(w, h, v)
    out_w = min(v.max_width, cw)
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
        print(f"skip  {v.name:<7} {rel}: not much smaller ({after // 1024} KB vs {before // 1024} KB)")
        return None
    print(f"made  {v.name:<7} {rel}: {before // 1024} KB -> {after // 1024} KB ({out_w}x{out_h})")
    return {"thumb": dest.relative_to(ROOT).as_posix(), "width": out_w, "height": out_h}


def main() -> int:
    for tool in ("sips", "cwebp"):
        if not shutil.which(tool):
            sys.exit(f"error: `{tool}` not found (cwebp: `brew install webp`)")

    manifest: dict[str, dict[str, dict]] = {}
    for v in VARIANTS:
        images = sorted({
            img for pattern in v.sources for qmd in ROOT.glob(pattern)
            if (img := front_matter_image(qmd)) and img.is_file()
        })
        section = manifest.setdefault(v.name, {})
        for src in images:
            if entry := make(src, v):
                section[src.relative_to(ROOT).as_posix()] = entry

    # Remove files that are no longer listed.
    keep = {ROOT / e["thumb"] for section in manifest.values() for e in section.values()}
    for old in THUMBS.rglob("*.webp"):
        if old not in keep:
            old.unlink()
            print(f"removed stale {old.relative_to(ROOT)}")
    for d in sorted(THUMBS.rglob("*"), reverse=True):
        if d.is_dir() and not any(d.iterdir()):
            d.rmdir()

    MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    counts = ", ".join(f"{len(s)} {name}" for name, s in manifest.items())
    print(f"wrote {MANIFEST.relative_to(ROOT)} ({counts})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
