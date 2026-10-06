import { header, footer, setup, loop, state, clamp } from "./shared.js";
document.querySelector("#app").innerHTML =
  `${header("03 / Tactile")}<main class="tactile"><section class="tactile-title"><span class="eyebrow">An analog feeling in a digital world</span><h1>Make some<br><span>good noise.</span></h1><p>Not a screenshot. An instrument.<br>每个旋钮和按键，都会改变眼前的波形。</p></section><section class="instrument" aria-label="Interactive signal synthesizer"><i class="screw s1"></i><i class="screw s2"></i><i class="screw s3"></i><i class="screw s4"></i><div class="instrument-top"><strong>FORM / 03</strong><span>EXPERIMENTAL SIGNAL UNIT</span><button id="power" class="power" aria-pressed="true"><i></i>Power on</button></div><div class="screen"><div class="screen-label"><span id="signal-name">SINE / SIGNAL</span><span id="frequency-readout">220 Hz</span></div><canvas id="scope" aria-label="Live signal waveform" role="img"></canvas><div class="screen-label"><span>● LIVE SYNTHESIS</span><span id="output-status" aria-live="polite">VISUAL MODE · SILENT</span></div></div><div class="instrument-controls"><div class="knob-group"><div class="dial" id="dial" tabindex="0" role="slider" aria-label="Frequency dial" aria-valuemin="80" aria-valuemax="880" aria-valuenow="220"><div class="dial-inner"><i></i></div></div><label class="control-label" for="frequency">Frequency</label><input id="frequency" aria-label="Frequency" type="range" min="80" max="880" value="220"><span class="hint">Drag the dial / ↑ ↓</span></div><div class="wave-controls"><span class="control-label">Wave shape</span><div class="wave-buttons"><button class="key selected" data-wave="sine" aria-pressed="true">∿<span>Sine</span></button><button class="key" data-wave="triangle" aria-pressed="false">△<span>Triangle</span></button><button class="key" data-wave="square" aria-pressed="false">⊓<span>Square</span></button></div><label class="control-label" for="gain">Signal strength</label><input id="gain" aria-label="Signal strength" type="range" min=".1" max="1" step=".05" value=".6"></div><div class="output-controls"><span class="control-label">Output</span><button class="sound-switch" id="sound" aria-pressed="false"><i></i><span>Enable sound</span></button><button class="fire-key" id="pulse">Send pulse <span>↗</span></button><p class="hint">Sound is off until you choose it.<br>低音量试听 · 不自动播放</p></div></div><div class="instrument-base"><span>DESIGNED TO BE TOUCHED.</span><div class="meter">${Array.from({ length: 16 }, () => "<i></i>").join("")}</div><span>MS—2026 / Nº 003</span></div></section><div class="tactile-note"><span>01 / TURN</span><span>02 / SWITCH</span><span>03 / TRANSMIT</span></div></main>${footer("tactile", "https://uiverse.io/ui/3d-buttons", "An original instrument panel following Uiverse’s tactile interaction ideas: layered shadows, translated press states, switches, status feedback and reactive meters. All controls drive the same real signal state. Audio is optional, starts only after a click, and stops when powered off or the tab is hidden.")}`;
setup();
let frequency = 220,
  gain = 0.6,
  wave = "sine",
  powered = true,
  sound = false,
  pulse = 0,
  context,
  oscillator,
  volume;
const canvas = document.querySelector("#scope"),
  ctx = canvas.getContext("2d"),
  dial = document.querySelector("#dial");
function sync() {
  document.querySelector("#frequency").value = frequency;
  document.querySelector("#frequency-readout").textContent =
    Math.round(frequency) + " Hz";
  dial.setAttribute("aria-valuenow", String(Math.round(frequency)));
  document.querySelector(".dial-inner").style.transform =
    `rotate(${-135 + ((frequency - 80) / 800) * 270}deg)`;
  document.querySelector("#signal-name").textContent =
    wave.toUpperCase() + " / SIGNAL";
  if (oscillator) {
    oscillator.type = wave;
    oscillator.frequency.setTargetAtTime(frequency, context.currentTime, 0.05);
  }
  if (volume)
    volume.gain.setTargetAtTime(
      sound && powered && !document.hidden ? gain * 0.035 : 0,
      context.currentTime,
      0.05,
    );
}
document.querySelector("#frequency").oninput = (e) => {
  frequency = +e.target.value;
  sync();
};
document.querySelector("#gain").oninput = (e) => {
  gain = +e.target.value;
  sync();
};
document.querySelectorAll("[data-wave]").forEach(
  (button) =>
    (button.onclick = () => {
      wave = button.dataset.wave;
      if (oscillator) oscillator.type = wave;
      document.querySelectorAll("[data-wave]").forEach((b) => {
        const selected = b === button;
        b.classList.toggle("selected", selected);
        b.setAttribute("aria-pressed", String(selected));
      });
      sync();
    }),
);
document.querySelector("#power").onclick = (e) => {
  powered = !powered;
  const button = document.querySelector("#power");
  button.setAttribute("aria-pressed", String(powered));
  button.innerHTML = `<i></i>Power ${powered ? "on" : "off"}`;
  document.querySelector(".instrument").classList.toggle("off", !powered);
  sync();
};
document.querySelector("#sound").onclick = async () => {
  try {
    if (!context) {
      context = new AudioContext();
      oscillator = context.createOscillator();
      volume = context.createGain();
      volume.gain.value = 0;
      oscillator.connect(volume).connect(context.destination);
      oscillator.start();
    }
    await context.resume();
    sound = !sound;
    document
      .querySelector("#sound")
      .setAttribute("aria-pressed", String(sound));
    document.querySelector("#sound span").textContent = sound
      ? "Sound enabled"
      : "Enable sound";
    document.querySelector("#output-status").textContent = sound
      ? "AUDIO MODE · LOW VOLUME"
      : "VISUAL MODE · SILENT";
    sync();
  } catch {
    document.querySelector("#output-status").textContent =
      "AUDIO UNAVAILABLE · VISUAL MODE";
  }
};
document.querySelector("#pulse").onclick = () => {
  if (!powered) {
    document.querySelector("#output-status").textContent =
      "POWER ON TO TRANSMIT";
    return;
  }
  pulse = 1;
  document.querySelector("#output-status").textContent = "PULSE TRANSMITTED";
  setTimeout(() => {
    document.querySelector("#output-status").textContent = sound
      ? "AUDIO MODE · LOW VOLUME"
      : "VISUAL MODE · SILENT";
  }, 1200);
};
let dragging = false,
  startY,
  startFreq;
dial.addEventListener("pointerdown", (e) => {
  dragging = true;
  startY = e.clientY;
  startFreq = frequency;
  dial.setPointerCapture(e.pointerId);
});
dial.addEventListener("pointermove", (e) => {
  if (dragging) {
    frequency = clamp(startFreq + (startY - e.clientY) * 4, 80, 880);
    sync();
  }
});
dial.addEventListener("pointerup", () => (dragging = false));
dial.addEventListener("pointercancel", () => (dragging = false));
dial.addEventListener("keydown", (e) => {
  if (
    ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "Home", "End"].includes(
      e.key,
    )
  ) {
    e.preventDefault();
    frequency =
      e.key === "Home"
        ? 80
        : e.key === "End"
          ? 880
          : clamp(
              frequency +
                (e.key === "ArrowUp" || e.key === "ArrowRight" ? 20 : -20),
              80,
              880,
            );
    sync();
  }
});
function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
}
addEventListener("resize", resize);
resize();
sync();
loop((t, dt, paused) => {
  const w = canvas.width,
    h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#37583b55";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += w / 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += h / 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  if (powered) {
    ctx.strokeStyle = "#b9ed95";
    ctx.shadowColor = "#9ee778";
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2 * devicePixelRatio;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const phase = (x / w) * Math.PI * 2 * (frequency / 80) + t * 3;
      let v =
        wave === "sine"
          ? Math.sin(phase)
          : wave === "triangle"
            ? (2 / Math.PI) * Math.asin(Math.sin(phase))
            : Math.tanh(Math.sin(phase) * 12);
      const envelope = 1 + pulse * Math.exp(-((x / w - 0.5) ** 2) * 30) * 1.5;
      let y = h * 0.5 + v * h * 0.3 * gain * envelope;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  if (!paused) pulse = Math.max(0, pulse - dt * 1.5);
  document.querySelectorAll(".meter i").forEach((bar, i) => {
    bar.style.opacity = powered
      ? String(
          0.2 +
            clamp((Math.sin(t * 4 + i * 0.5) + 1) * gain * 0.6 + pulse) * 0.8,
        )
      : ".1";
  });
});
document.addEventListener("visibilitychange", sync);
addEventListener("pagehide", () => context?.close());
