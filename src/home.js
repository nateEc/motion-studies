import { header, base, studies, setup, loop, reveal } from "./shared.js";
document.querySelector("#app").innerHTML =
  `${header("A collection of moving ideas")}<main class="home"><section class="intro"><div class="intro-meta"><span class="eyebrow">Independent experiments / Vol. 01</span><span class="edition">04 STUDIES — 2026</span></div><h1>Less static.<br><span>More feeling.</span><i>↗</i></h1><div class="intro-bottom"><p>Four ways to make an interface<br>feel a little more alive.</p><span class="hint">Scroll to explore<br>鼠标、滚动、触摸 · 都可以玩</span></div><canvas id="home-canvas" aria-hidden="true"></canvas></section><section class="collection">${studies.map(([slug, id, name, ref]) => `<a class="study-card ${slug}-card" href="${base}${slug}/" data-reveal><div class="card-art" aria-hidden="true">${slug === "prism" ? '<div class="mini-cube"><span>NEW<br>IDEAS</span></div>' : slug === "aurora" ? '<div class="mini-aurora"></div><div class="mini-orbit"><i></i><i></i><i></i></div>' : slug === "tactile" ? '<div class="mini-dial"></div><div class="mini-bars"><i></i><i></i><i></i><i></i><i></i></div>' : '<div class="mini-depth"><i></i><i></i><i></i></div>'}</div><div class="card-meta"><span>${id} / ${ref}</span><span>Open study ↗</span></div><h2>${name}</h2><p>${{ prism: "Light bends. Ideas follow.", aurora: "A gallery in perpetual orbit.", tactile: "Turn it. Push it. Feel it.", depth: "An interface, with another dimension." }[slug]}</p></a>`).join("")}</section></main><footer class="home-footer"><span>Built to be experienced, not explained.</span><span>Motion Studies © 2026</span></footer>`;
setup();
reveal();
const c = document.querySelector("#home-canvas"),
  ctx = c.getContext("2d");
let w, h;
function resize() {
  w = c.clientWidth;
  h = c.clientHeight;
  c.width = w * devicePixelRatio;
  c.height = h * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
addEventListener("resize", resize);
resize();
loop((t) => {
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2 + t * 0.12;
    const r = Math.min(w, h) * 0.3;
    ctx.strokeStyle = `rgba(246,93,54,${0.12 + (i / 36) * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(w * 0.76, h * 0.51, r, r * 0.52, a, 0, Math.PI * 2);
    ctx.stroke();
  }
});
