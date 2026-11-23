// Quarto post-render script (see `project: post-render` in _quarto.yml).
//
// Listing cards (home, blog, about) show each page's front-matter `image`
// as a small cropped card image. This script swaps those card images for the
// small WebP thumbnails made by `_scripts/make_thumbnails.py` (listed in
// thumbs/manifest.json) and adds width/height so the browser reserves space.
//
// Only listing card images (class "thumbnail-image") are changed; social
// preview images and post header images keep using the originals. Images
// without a thumbnail in the manifest are left as they are.
//
// Runs on Quarto's bundled Deno, so no extra runtime is needed in CI.

type Thumb = { thumb: string; width: number; height: number };

const OUT_DIR = "_site";
const manifest: Record<string, Thumb> = JSON.parse(
  await Deno.readTextFile("thumbs/manifest.json"),
);

// Resolve a relative URL against a directory, returning a site-relative path.
function resolve(dir: string, url: string): string {
  const parts = dir ? dir.split("/") : [];
  for (const seg of url.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return parts.join("/");
}

// Relative URL from a directory to a site-relative path.
function relativeTo(dir: string, target: string): string {
  const from = dir ? dir.split("/") : [];
  const to = target.split("/");
  let i = 0;
  while (i < from.length && i < to.length - 1 && from[i] === to[i]) i++;
  return [...Array(from.length - i).fill(".."), ...to.slice(i)].join("/") || ".";
}

const CARD_IMG = /<img\b[^>]*\bthumbnail-image\b[^>]*>/g;
const SRC_ATTR = /\s(data-src|src)="([^"]+)"/;

const outputs = (Deno.env.get("QUARTO_PROJECT_OUTPUT_FILES") ?? "")
  .split("\n")
  .map((f) => f.trim().replaceAll("\\", "/"))
  .filter((f) => f.endsWith(".html"));

for (const file of outputs) {
  const html = await Deno.readTextFile(file);
  if (!html.includes("thumbnail-image")) continue;

  const siteRel = file.startsWith(`${OUT_DIR}/`) ? file.slice(OUT_DIR.length + 1) : file;
  const dir = siteRel.includes("/") ? siteRel.slice(0, siteRel.lastIndexOf("/")) : "";
  let swapped = 0;
  let missing = 0;

  const updated = html.replace(CARD_IMG, (tag) => {
    const m = tag.match(SRC_ATTR);
    if (!m || /^(https?:|data:)/.test(m[2])) return tag;
    const entry = manifest[resolve(dir, m[2])];
    if (!entry) {
      missing++;
      return tag;
    }
    swapped++;
    let out = tag.replace(SRC_ATTR, ` ${m[1]}="${relativeTo(dir, entry.thumb)}"`);
    if (!/\swidth=/.test(out)) {
      out = out.replace(/^<img\b/, `<img width="${entry.width}" height="${entry.height}"`);
    }
    return out;
  });

  if (swapped > 0) await Deno.writeTextFile(file, updated);
  console.log(
    `post-render: ${file}: ${swapped} card images use thumbnails` +
      (missing ? `, ${missing} without a thumbnail (run _scripts/make_thumbnails.py)` : ""),
  );
}
