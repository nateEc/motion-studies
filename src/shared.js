import "./style.css";
export const base = import.meta.env.BASE_URL;
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/svg+xml";
favicon.href = base + "favicon.svg";
document.head.append(favicon);
export const reduced = matchMedia("(prefers-reduced-motion: reduce)");
export const state = { paused: reduced.matches };
export const studies = [
  ["prism", "01", "Prism", "MotionSites"],
  ["aurora", "02", "Aurora", "React Bits"],
  ["tactile", "03", "Tactile", "Uiverse"],
  ["depth", "04", "Depth", "Aceternity UI"],
];
export function header(label) {
  return `<header class="header"><a class="brand" href="${base}"><span class="brand-mark">m<span>↗</span></span><span>MOTION<br>STUDIES</span></a><div class="head-right"><span class="eyebrow current">${label}</span><button class="quiet" id="pause" aria-pressed="${state.paused}">${state.paused ? "Resume motion" : "Pause motion"}</button><a class="quiet" href="${base}">All studies ↗</a></div></header>`;
}
export function footer(slug, source, description) {
  const next = studies[(studies.findIndex((s) => s[0] === slug) + 1) % 4];
  return `<footer class="study-footer"><details><summary>Behind the experiment <span>+</span></summary><p>${description}</p><a href="${source}" target="_blank" rel="noopener noreferrer">View the original reference ↗</a><p class="small">Independent study. Not affiliated with the reference library.</p></details><a class="next-study" href="${base}${next[0]}/">Next study <strong>${next[2]} ↗</strong></a></footer>`;
}
export function setup() {
  document.documentElement.classList.toggle("paused", state.paused);
  document
    .querySelector("#pause")
    ?.addEventListener("click", () => setPause(!state.paused));
  reduced.addEventListener("change", (e) => setPause(e.matches));
}
function setPause(paused) {
  state.paused = paused;
  document.documentElement.classList.toggle("paused", paused);
  const b = document.querySelector("#pause");
  if (b) {
    b.textContent = paused ? "Resume motion" : "Pause motion";
    b.setAttribute("aria-pressed", String(paused));
  }
}
export function loop(draw) {
  let last = 0,
    time = 0,
    lastDraw = 0;
  function frame(now) {
    if (state.paused && now - lastDraw < 100) {
      requestAnimationFrame(frame);
      return;
    }
    lastDraw = now;
    const dt = Math.min((now - last) / 1000 || 0, 0.05);
    last = now;
    if (!document.hidden) {
      if (!state.paused) time += dt;
      draw(time, dt, state.paused);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
export function reveal() {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.12 },
  );
  document
    .querySelectorAll("[data-reveal]")
    .forEach((el) => observer.observe(el));
}
export const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
