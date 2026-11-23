// Quarto post-render script (see `project: post-render` in _quarto.yml).
//
// Quarto's built-in grid listing renders card titles as <h5>. On the blog
// listing that puts <h5> directly under the page's <h1>, which breaks heading
// order for screen-reader users (Lighthouse/axe "heading-order").
//
// A custom listing template can't fix this without re-implementing Quarto's
// sorting, category, and lazy-image markup (custom templates don't get
// Quarto's `listing.utilities`). Instead, keep Quarto's grid and change only
// the title tag in the built HTML. styles.css sizes `h2.listing-title` to
// match the original look.
//
// Runs on Quarto's bundled Deno, so no extra runtime is needed in CI.

const TARGETS = ["blog/index.html"];
const H5_TITLE = /<h5 class="no-anchor card-title listing-title">([\s\S]*?)<\/h5>/g;

const outputs = (Deno.env.get("QUARTO_PROJECT_OUTPUT_FILES") ?? "")
  .split("\n")
  .map((f) => f.trim())
  .filter((f) => TARGETS.some((t) => f.replaceAll("\\", "/").endsWith(t)));

for (const file of outputs) {
  const html = await Deno.readTextFile(file);
  const count = html.match(H5_TITLE)?.length ?? 0;
  if (count === 0) {
    console.warn(
      `post-render: no <h5> card titles found in ${file}; ` +
        "Quarto's listing markup may have changed.",
    );
    continue;
  }
  await Deno.writeTextFile(
    file,
    html.replace(H5_TITLE, '<h2 class="no-anchor card-title listing-title">$1</h2>'),
  );
  console.log(`post-render: ${file}: ${count} card titles changed from <h5> to <h2>`);
}
