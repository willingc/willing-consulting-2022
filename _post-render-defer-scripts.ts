// Quarto post-render script (see `project: post-render` in _quarto.yml).
//
// Quarto loads its JavaScript libraries (navigation, search, listings,
// tooltips, Bootstrap, ...) with plain <script src> tags in <head>. The
// browser must download and run every one of them before it can draw the
// page. Adding `defer` lets the page render while they download; deferred
// scripts still run in document order, before DOMContentLoaded, so code that
// waits for DOMContentLoaded (as Quarto's inline scripts do) still finds them.
//
// Not deferred:
// * glightbox.min.js - Quarto's inline lightbox setup calls GLightbox()
//   immediately at the end of <body>, so the library must already be loaded.
// * scripts that are already async or type="module" (deferred by default).
// * anything outside site_libs/ (e.g. analytics, embeds).
//
// Runs on Quarto's bundled Deno, so no extra runtime is needed in CI.

const KEEP_BLOCKING = ["glightbox.min.js"];

const SCRIPT = /<script\b([^>]*)\bsrc="([^"]*site_libs\/[^"]+\.js)"([^>]*)><\/script>/g;

const outputs = (Deno.env.get("QUARTO_PROJECT_OUTPUT_FILES") ?? "")
  .split("\n")
  .map((f) => f.trim())
  .filter((f) => f.endsWith(".html"));

let files = 0;
let deferred = 0;

for (const file of outputs) {
  const html = await Deno.readTextFile(file);
  const headEnd = html.indexOf("</head>");
  if (headEnd === -1) continue;
  const head = html.slice(0, headEnd);

  let count = 0;
  const newHead = head.replace(SCRIPT, (tag, before: string, src: string, after: string) => {
    const attrs = `${before} ${after}`;
    if (/\b(defer|async)\b/.test(attrs) || /type="module"/.test(attrs)) return tag;
    if (KEEP_BLOCKING.some((name) => src.endsWith(name))) return tag;
    count++;
    return `<script${before}src="${src}"${after} defer></script>`;
  });

  if (count > 0) {
    await Deno.writeTextFile(file, newHead + html.slice(headEnd));
    files++;
    deferred += count;
  }
}

console.log(`post-render defer: added defer to ${deferred} scripts across ${files} pages`);
