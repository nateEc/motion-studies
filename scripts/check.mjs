import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
for (const p of [
  "index",
  "prism/index",
  "aurora/index",
  "tactile/index",
  "depth/index",
]) {
  const html = readFileSync(p + ".html", "utf8");
  assert.match(html, /<html lang="en">/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /type="module"/);
}
assert(existsSync("src/style.css"));
assert.match(readFileSync("src/shared.js", "utf8"), /prefers-reduced-motion/);
console.log("5 page entry points and shared accessibility contract passed");
