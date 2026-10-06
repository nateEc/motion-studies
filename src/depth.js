import {
  header,
  footer,
  setup,
  loop,
  state,
  clamp,
  reduced,
} from "./shared.js";
document.querySelector("#app").innerHTML =
  `${header("04 / Depth")}<main class="depth"><section class="depth-scroll" id="journey"><div class="depth-sticky"><div class="depth-copy"><span class="eyebrow">Interfaces are not flat.</span><h1 id="depth-title">There’s more<br>beneath the surface.</h1><p id="depth-subtitle">Scroll to lift an ordinary interface into space.</p><div class="depth-steps"><span class="active">01 / SURFACE</span><span>02 / STRUCTURE</span><span>03 / SYSTEM</span></div></div><div class="spatial-stage" id="spatial" tabindex="0" aria-label="Spatial interface. Scroll to explore, or press Enter to toggle the exploded view."><div class="platform" id="platform"><div class="underlay"><div class="circuit-grid"></div><span>THE INVISIBLE LAYER</span><div class="circuit-core">✳</div></div><div class="dashboard"><div class="dash-nav"><strong>orbit<span>®</span></strong><span>A living workspace</span><i>● SYSTEM ONLINE</i></div><div class="bento"><button class="bento-card main-card" data-card="Orbit" aria-pressed="false"><span class="card-overline">CONNECTED THINKING</span><div class="orbit-sculpture"><i></i><i></i><i></i><span>✳</span></div><strong>Everything, in orbit.</strong><small>Ideas don’t happen in isolation.</small></button><button class="bento-card chart-card" data-card="Signal" aria-pressed="false"><span class="card-overline">SIGNAL STRENGTH</span><strong>98<span>.4</span><small>%</small></strong><div class="chart-bars">${Array.from({ length: 20 }, (_, i) => `<i style="--h:${30 + Math.sin(i * 0.6) * 18 + i * 2}px;--delay:${i * 0.08}s"></i>`).join("")}</div><small>Illustrative data / animated signal</small></button><button class="bento-card flow-card" data-card="Flow" aria-pressed="false"><span class="card-overline">IDEA → MOMENTUM</span><div class="flow"><i>01</i><b>→</b><i>02</i><b>→</b><i>03</i></div><strong>Make connections.</strong><small>A little structure. A lot of possibility.</small></button><button class="bento-card note-card" data-card="Perspective" aria-pressed="false"><span class="card-overline">A DIFFERENT PERSPECTIVE</span><strong>Think outside<br>the rectangle.</strong><span class="note-arrow">↗</span></button></div></div><div class="floating-label l1">01 / CONTENT</div><div class="floating-label l2">02 / INTERACTION</div><div class="floating-label l3">03 / FOUNDATION</div></div></div><div class="depth-bottom"><div class="progress-track"><i id="progress"></i></div><p class="hint" id="card-status" aria-live="polite">Scroll to unfold · 滚动拆解界面</p><button id="explode" class="quiet" aria-pressed="false">Explode view ↗</button></div></div></section><section class="depth-end"><span class="eyebrow">A change in perspective</span><h2>Same interface.<br><span>Entirely different feeling.</span></h2><p>Scroll back to bring every layer home.</p></section></main>${footer("depth", "https://ui.aceternity.com/components/container-scroll-animation", "Based on the public Container Scroll Animation implementation guide and 3D Card Effect reference: scroll progress maps to perspective rotation, scale and translation. This original adaptation adds an exploded bento composition, independent layer depths, pointer tilt and keyboard/click alternatives. No template source or imagery is copied.")}`;
setup();
const journey = document.querySelector("#journey"),
  platform = document.querySelector("#platform"),
  stage = document.querySelector("#spatial");
let progress = 0,
  manual = null,
  tiltX = 0,
  tiltY = 0;
document.querySelector("#explode").onclick = () => {
  manual = manual === 0.5 ? 0 : 0.5;
  document
    .querySelector("#explode")
    .setAttribute("aria-pressed", String(manual === 0.5));
  document.querySelector("#explode").textContent =
    manual === 0.5 ? "Assemble view ↙" : "Explode view ↗";
};
stage.addEventListener("keydown", (e) => {
  if (e.target !== stage) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    document.querySelector("#explode").click();
  }
});
stage.addEventListener("pointermove", (e) => {
  if (e.pointerType === "touch" || state.paused) return;
  const b = stage.getBoundingClientRect();
  tiltY = ((e.clientX - b.left - b.width / 2) / b.width) * 8;
  tiltX = (-(e.clientY - b.top - b.height / 2) / b.height) * 8;
});
stage.addEventListener("pointerleave", () => {
  tiltX = tiltY = 0;
});
document.querySelectorAll("[data-card]").forEach(
  (card) =>
    (card.onclick = () => {
      const selected = card.getAttribute("aria-pressed") !== "true";
      document.querySelectorAll("[data-card]").forEach((c) => {
        c.setAttribute("aria-pressed", String(c === card && selected));
      });
      document.querySelector("#card-status").textContent = selected
        ? card.dataset.card + " layer selected · click again to release"
        : "Scroll to unfold · 滚动拆解界面";
    }),
);
addEventListener(
  "scroll",
  () => {
    manual = null;
    document.querySelector("#explode").setAttribute("aria-pressed", "false");
    document.querySelector("#explode").textContent = "Explode view ↗";
  },
  { passive: true },
);
loop((t, dt, paused) => {
  const rect = journey.getBoundingClientRect();
  const target =
    manual ?? clamp(-rect.top / (journey.offsetHeight - innerHeight));
  progress += (target - progress) * (paused ? 1 : Math.min(1, dt * 6));
  const mobile = innerWidth < 700;
  const spread = reduced.matches ? 0 : Math.sin(progress * Math.PI) * 1.0;
  const rotate = paused ? 0 : 20 - 50 * Math.sin(progress * Math.PI);
  const scale = mobile ? 0.62 : 0.75;
  platform.style.transform = `scale(${scale}) rotateX(${rotate + tiltX}deg) rotateY(${tiltY}deg) rotateZ(${-8 * spread}deg)`;
  platform.style.setProperty("--spread", String(spread));
  document.querySelector(".dashboard").style.transform =
    `translateZ(${spread * (mobile ? 60 : 80)}px)`;
  document.querySelectorAll(".bento-card").forEach((card, i) => {
    const z =
      spread * (i === 0 ? 105 : i === 1 ? 75 : i === 2 ? 45 : 90) +
      (card.getAttribute("aria-pressed") === "true" ? 25 : 0);
    card.style.transform = `translateZ(${z}px)`;
  });
  document
    .querySelectorAll(".floating-label")
    .forEach((label) => (label.style.opacity = String(spread)));
  document.querySelector("#progress").style.width = progress * 100 + "%";
  const phase = progress < 0.25 ? 0 : progress < 0.75 ? 1 : 2;
  document
    .querySelectorAll(".depth-steps span")
    .forEach((s, i) => s.classList.toggle("active", i === phase));
  document.querySelector("#depth-title").innerHTML = [
    "There’s more<br>beneath the surface.",
    "Give your ideas<br>a little room.",
    "Bring it all<br>back together.",
  ][phase];
  document.querySelector("#depth-subtitle").textContent = [
    "Scroll to lift an ordinary interface into space.",
    "Every layer has a purpose. Every detail has depth.",
    "Motion makes the invisible architecture visible.",
  ][phase];
});
