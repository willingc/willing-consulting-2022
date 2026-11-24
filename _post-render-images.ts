// Quarto post-render script (see `project: post-render` in _quarto.yml).
//
// Serves right-sized images and adds width/height so the browser can reserve
// space before images load:
//
// * Listing cards (home, blog, about; class "thumbnail-image") use the small
//   card versions in thumbs/cards/.
// * Blog post header images (in .quarto-title-thumbnail, from
//   blog/posts/title-block.html) use the header versions in thumbs/headers/.
// * The navbar logo gets its intrinsic width/height.
//
// The card and header versions are made by `_scripts/make_thumbnails.py` and
// listed in thumbs/manifest.json. Images without an entry are left as they
// are. Social preview (og:image) tags are not touched, so they keep the
// full-size originals.
//
// Runs on Quarto's bundled Deno, so no extra runtime is needed in CI.

type Entry = { thumb: string; width: number; height: number };
type Manifest = Record<"cards" | "headers", Record<string, Entry>>;

const OUT_DIR = "_site";
const NAVBAR_LOGO = { file: "images/willing-horizontal-320-77.png", width: 320, height: 77 };

const manifest: Manifest = JSON.parse(await Deno.readTextFile("thumbs/manifest.json"));

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

const SRC_ATTR = /\s(data-src|src)="([^"]+)"/;

function addSize(tag: string, width: number, height: number): string {
  return /\swidth=/.test(tag)
    ? tag
    : tag.replace(/^<img\b/, `<img width="${width}" height="${height}"`);
}

// Swap an <img> tag's src for its manifest entry; returns null if none.
function swap(tag: string, dir: string, section: Record<string, Entry>): string | null {
  const m = tag.match(SRC_ATTR);
  if (!m || /^(https?:|data:)/.test(m[2])) return null;
  const entry = section[resolve(dir, m[2])];
  if (!entry) return null;
  const out = tag.replace(SRC_ATTR, ` ${m[1]}="${relativeTo(dir, entry.thumb)}"`);
  return addSize(out, entry.width, entry.height);
}

const CARD_IMG = /<img\b[^>]*\bthumbnail-image\b[^>]*>/g;
const HEADER_IMG = /(<div class="quarto-title-thumbnail">\s*)(<img\b[^>]*>)/g;
const LOGO_IMG = /<img\b[^>]*\bnavbar-logo\b[^>]*>/g;

const outputs = (Deno.env.get("QUARTO_PROJECT_OUTPUT_FILES") ?? "")
  .split("\n")
  .map((f) => f.trim().replaceAll("\\", "/"))
  .filter((f) => f.endsWith(".html"));

const totals = { cards: 0, cardsMissing: 0, headers: 0, headersMissing: 0, logos: 0 };

for (const file of outputs) {
  const html = await Deno.readTextFile(file);
  const siteRel = file.startsWith(`${OUT_DIR}/`) ? file.slice(OUT_DIR.length + 1) : file;
  const dir = siteRel.includes("/") ? siteRel.slice(0, siteRel.lastIndexOf("/")) : "";

  let updated = html.replace(CARD_IMG, (tag) => {
    const out = swap(tag, dir, manifest.cards);
    out ? totals.cards++ : totals.cardsMissing++;
    return out ?? tag;
  });

  updated = updated.replace(HEADER_IMG, (_all, open: string, tag: string) => {
    const out = swap(tag, dir, manifest.headers);
    out ? totals.headers++ : totals.headersMissing++;
    return open + (out ?? tag);
  });

  updated = updated.replace(LOGO_IMG, (tag) => {
    const m = tag.match(SRC_ATTR);
    if (!m || resolve(dir, m[2]) !== NAVBAR_LOGO.file) return tag;
    totals.logos++;
    return addSize(tag, NAVBAR_LOGO.width, NAVBAR_LOGO.height);
  });

  if (updated !== html) await Deno.writeTextFile(file, updated);
}

console.log(
  `post-render images: ${totals.cards} card images, ${totals.headers} post header images, ` +
    `${totals.logos} navbar logos sized`,
);
if (totals.cardsMissing || totals.headersMissing) {
  console.log(
    `post-render images: ${totals.cardsMissing} card and ${totals.headersMissing} header images ` +
      "have no small version; run _scripts/make_thumbnails.py",
  );
}
