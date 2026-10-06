import * as THREE from "three";
import { header, footer, setup, loop, state, clamp } from "./shared.js";
document.querySelector("#app").innerHTML =
  `${header("02 / Aurora")}<main class="aurora"><canvas id="sky" aria-hidden="true"></canvas><section class="aurora-intro"><span class="eyebrow">A collection of impossible places</span><h1>Somewhere<br><em>between worlds.</em></h1><p>A living gallery of light, landscape and a little imagination.</p></section><section class="gallery" aria-label="Interactive gallery"><div class="gallery-track" id="track" tabindex="0" aria-label="Drag gallery, or use left and right arrow keys">${["Luminous dunes", "Tidal memory", "After the rain", "Quiet infinity", "Solar bloom"].map((name, i) => `<article class="gallery-item" data-index="${i}"><canvas class="landscape" data-art="${i}" role="img" aria-label="Procedural artwork: ${name}"></canvas><div class="art-caption"><span>0${i + 1}</span><h2>${name}</h2></div></article>`).join("")}</div></section><section class="gallery-controls"><div class="controls"><button class="pill" id="prev" aria-label="Previous artwork">←</button><span id="art-count" aria-live="polite">01 — 05</span><button class="pill" id="next" aria-label="Next artwork">→</button></div><p class="hint">Drag to wander · 拖动画廊<br>Arrow keys work, too.</p><label class="control-label">Aurora intensity <input id="intensity" type="range" min=".2" max="1.5" step=".1" value=".8"></label></section></main>${footer("aurora", "https://reactbits.dev/components/circular-gallery", "An original study of React Bits’ Aurora and Circular Gallery concepts: an animated shader sky, a curved gallery, drag inertia and generated landscape art. No stock photography or copied component code. The background intensity is adjustable, with a static gradient if WebGL is unavailable.")}`;
setup();
let amplitude = 0.8;
document.querySelector("#intensity").oninput = (e) => {
  amplitude = +e.target.value;
};
let renderer, program;
try {
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#sky"),
    alpha: true,
    antialias: false,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  program = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, amp: { value: 0.8 }, aspect: { value: 1 } },
    vertexShader:
      "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
    fragmentShader: `precision highp float; varying vec2 vUv; uniform float time,amp,aspect;float wave(float x,float t){return sin(x*4.+t)*.18+sin(x*9.-t*.7)*.09+sin(x*17.+t*.4)*.04;}void main(){vec2 uv=vUv;float h=.5+wave(uv.x,time*.25)*amp;float band=exp(-abs(uv.y-h)*8.);float curtain=.5+.5*sin(uv.x*85.+sin(uv.x*8.+time*.3)*4.);vec3 c=mix(vec3(.05,.27,.30),vec3(.38,.75,.55),.5+.5*sin(uv.x*4.+time*.15));vec3 col=c*band*(.25+curtain*.75);float lower=exp(-abs(uv.y-(h-.12))*12.);col+=vec3(.14,.12,.39)*lower*.6;gl_FragColor=vec4(col,.9);}`,
  });
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), program));
  const camera = new THREE.Camera();
  const resize = () => {
    const c = renderer.domElement;
    renderer.setSize(c.clientWidth, c.clientHeight, false);
    program.uniforms.aspect.value = c.clientWidth / c.clientHeight;
  };
  addEventListener("resize", resize);
  resize();
  loop((t) => {
    program.uniforms.time.value = t;
    program.uniforms.amp.value = amplitude;
    renderer.render(scene, camera);
  });
} catch {
  document.querySelector("#sky").style.display = "none";
}
const palettes = [
  ["#cd875f", "#222d39", "#e6c895"],
  ["#619caa", "#112f40", "#afd9c9"],
  ["#607b55", "#122e26", "#e0c792"],
  ["#716a9c", "#211d44", "#b9aed4"],
  ["#d49739", "#392545", "#f3b792"],
];
function art(canvas, i) {
  const ctx = canvas.getContext("2d");
  canvas.width = 640;
  canvas.height = 850;
  const [a, b, c] = palettes[i];
  const g = ctx.createLinearGradient(0, 0, 0, 850);
  g.addColorStop(0, b);
  g.addColorStop(0.55, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 640, 850);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(350 + i * 15, 245 - i * 12, 70 + i * 5, 0, Math.PI * 2);
  ctx.fill();
  for (let l = 0; l < 14; l++) {
    ctx.beginPath();
    ctx.moveTo(0, 850);
    for (let x = 0; x <= 640; x += 8) {
      let y =
        400 +
        l * 27 +
        Math.sin(x / 145 + l * 0.6 + i) * 65 +
        Math.sin(x / 70 + i + l) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(640, 850);
    ctx.closePath();
    ctx.fillStyle = `hsl(${i === 0 ? 20 : i === 1 ? 185 : i === 2 ? 130 : i === 3 ? 250 : 30},${25 + l}%,${20 + l * 2}%)`;
    ctx.fill();
    ctx.strokeStyle = c + "30";
    ctx.stroke();
  }
  ctx.globalAlpha = 0.12;
  for (let n = 0; n < 1800; n++) {
    const x = ((Math.sin(n * 78.23) * 43758.3) % 1) * 640,
      y = ((Math.sin(n * 23.12) * 31758.9) % 1) * 850;
    ctx.fillStyle = "#fff";
    ctx.fillRect(Math.abs(x), Math.abs(y), 1, 1);
  }
  ctx.globalAlpha = 1;
}
document.querySelectorAll(".landscape").forEach((c, i) => art(c, i));
const track = document.querySelector("#track"),
  items = [...document.querySelectorAll(".gallery-item")];
let target = 0,
  current = 0,
  dragging = false,
  last = 0,
  velocity = 0;
function move(n) {
  target = clamp(n, 0, 4);
  velocity = 0;
  document.querySelector("#art-count").textContent =
    `0${Math.round(target) + 1} — 05`;
}
document.querySelector("#prev").onclick = () => move(Math.round(target) - 1);
document.querySelector("#next").onclick = () => move(Math.round(target) + 1);
track.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    move(Math.round(target) + (e.key === "ArrowLeft" ? -1 : 1));
  }
});
track.addEventListener("pointerdown", (e) => {
  dragging = true;
  last = e.clientX;
  velocity = 0;
  track.setPointerCapture(e.pointerId);
  track.classList.add("dragging");
});
track.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  velocity = (last - e.clientX) / 260;
  target = clamp(target + velocity, 0, 4);
  last = e.clientX;
});
function release() {
  dragging = false;
  target = clamp(target + velocity * 5, 0, 4);
  move(Math.round(target));
  track.classList.remove("dragging");
}
track.addEventListener("pointerup", release);
track.addEventListener("pointercancel", release);
loop((t, dt, paused) => {
  current += (target - current) * (paused ? 1 : Math.min(1, dt * 9));
  const mobile = innerWidth < 700,
    step = mobile ? 240 : 330;
  items.forEach((item, i) => {
    const d = i - current;
    const x = d * step,
      y = Math.min(Math.abs(d), 3) ** 2 * (mobile ? 22 : 30);
    item.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px) rotate(${d * (mobile ? 7 : 9)}deg)`;
    item.style.opacity = String(clamp(1 - Math.abs(d) * 0.22, 0.15, 1));
    item.style.zIndex = String(10 - Math.round(Math.abs(d)));
  });
});
