import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
const prefix = "/motion-studies/";
for (const path of [
  "index.html",
  "prism/index.html",
  "aurora/index.html",
  "tactile/index.html",
  "depth/index.html",
]) {
  const html = readFileSync("dist/" + path, "utf8");
  const links = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  assert(
    links.some((url) => url.endsWith(".js")),
    `${path}: missing module entry`,
  );
  for (const url of links) {
    if (url.startsWith("https://")) continue;
    assert(url.startsWith(prefix), `${path}: incorrect project base: ${url}`);
    assert(
      existsSync("dist/" + url.slice(prefix.length)),
      `${path}: missing deployed asset: ${url}`,
    );
  }
}
assert(existsSync("dist/favicon.svg"));
console.log(
  "All five deployed pages resolve every bundled asset under /motion-studies/",
);
