import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  mergeVertices,
  mergeGeometries,
} from "three/addons/utils/BufferGeometryUtils.js";
import { header, footer, setup, loop, state, clamp } from "./shared.js";
document.querySelector("#app").innerHTML =
  `${header("01 / Prism")}<main class="prism"><section class="prism-stage"><canvas id="prism" tabindex="0" role="img" aria-label="Glass cube. Drag to rotate, or use left and right arrow keys."></canvas><div class="prism-fallback"><h1>Explore<br>New<br>Ideas</h1><div class="fallback-cube"></div></div><div class="prism-heading"><span class="eyebrow">An experiment in refraction</span><p>Nothing is fixed.<br>Not even your<br><strong>point of view.</strong></p></div><div class="prism-nav"><button class="pill" id="left" aria-label="Rotate cube left">←</button><button class="pill" id="right" aria-label="Rotate cube right">→</button></div><div class="prism-bottom"><p class="hint">Drag to refract the words<br>拖动玻璃 · 松手惯性旋转</p><label class="control-label">Dispersion <input id="dispersion" type="range" min="0" max="1" step=".01" value=".5"></label><button class="quiet" id="reset">Reset view ↺</button><span class="prism-number">01</span></div><p id="scene-status" class="scene-status" role="status">Preparing the light…</p></section></main>${footer("prism", "https://motionsites.ai/", "Built from the freely accessible Design World prompt: screen-space glass refraction, chromatic dispersion, two-pass rendering, pointer rotation and inertia. Adapted with working controls, a bundled renderer, keyboard support and a geometric fallback. The original prompt is not redistributed.")}`;
setup();
document
  .querySelector(".prism")
  .insertAdjacentHTML(
    "afterbegin",
    '<h1 class="sr-only">Explore New Ideas</h1>',
  );
document
  .querySelector(".prism-fallback h1")
  .setAttribute("aria-hidden", "true");
const canvas = document.querySelector("#prism"),
  status = document.querySelector("#scene-status");
try {
  init();
} catch (error) {
  document.querySelector(".prism-stage").classList.add("no-webgl");
  status.textContent = "WebGL unavailable — a static composition is shown.";
  console.warn("Prism fallback:", error.message);
}
function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.autoClear = false;
  const scene = new THREE.Scene(),
    bgScene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.z = 10;
  const headline = document.createElement("canvas"),
    ctx = headline.getContext("2d"),
    texture = new THREE.CanvasTexture(headline);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: { tex: { value: texture } },
    vertexShader:
      "varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
    fragmentShader:
      "varying vec2 vUv; uniform sampler2D tex; void main(){gl_FragColor=texture2D(tex,vUv);\n#include <colorspace_fragment>\n}",
    depthTest: false,
    depthWrite: false,
  });
  bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial));
  const vertex = `varying vec3 nrm; varying vec3 eye;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);nrm=normalize(normalMatrix*normal);eye=normalize(mv.xyz);gl_Position=projectionMatrix*mv;}`;
  const fragment = `precision highp float; varying vec3 nrm;varying vec3 eye;uniform sampler2D tex;uniform vec2 res;uniform float backside,dispersion,power;void main(){vec2 uv=gl_FragCoord.xy/res;vec3 n=normalize(nrm);if(backside>.5)n=-n;vec3 e=normalize(eye);vec3 col=vec3(0.);for(int i=0;i<12;i++){float slide=float(i)/12.*.045;vec2 r=refract(e,n,1./1.15).xy*(power+slide)*dispersion;vec2 y=refract(e,n,1./1.16).xy*(power+slide)*dispersion;vec2 g=refract(e,n,1./1.18).xy*(power+slide*2.)*dispersion;vec2 c=refract(e,n,1./1.22).xy*(power+slide*2.5)*dispersion;vec2 b=refract(e,n,1./1.25).xy*(power+slide*3.)*dispersion;vec2 p=refract(e,n,1./1.28).xy*(power+slide)*dispersion;float R=texture2D(tex,uv+r).r*.5;vec3 Y=texture2D(tex,uv+y).rgb;float yy=(Y.r*2.+Y.g*2.-Y.b)/6.;float G=texture2D(tex,uv+g).g*.5;vec3 C=texture2D(tex,uv+c).rgb;float cc=(C.g*2.+C.b*2.-C.r)/6.;float B=texture2D(tex,uv+b).b*.5;vec3 P=texture2D(tex,uv+p).rgb;float pp=(P.b*2.+P.r*2.-P.g)/6.;col+=vec3(R+(2.*pp+2.*yy-cc)/3.,G+(2.*yy+2.*cc-pp)/3.,B+(2.*cc+2.*pp-yy)/3.);}col/=12.;float lum=dot(col,vec3(.2125,.7154,.0721));col=mix(vec3(lum),col,1.08);vec3 l=normalize(vec3(1.,-1.,-1.));float spec=pow(max(dot(n,normalize(l-e)),0.),90.);col+=spec*(backside>.5?.35:1.);float f=pow(clamp(1.+dot(e,n),0.,1.),5.);col=mix(col,vec3(1.),f*(backside>.5?.25:.55));gl_FragColor=vec4(col+vec3(.004,.005,.007),1.);\n#include <colorspace_fragment>\n}`;
  const rtBack = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
    }),
    rtFront = rtBack.clone();
  function material(back) {
    return new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      side: back ? THREE.BackSide : THREE.FrontSide,
      uniforms: {
        tex: { value: back ? rtBack.texture : rtFront.texture },
        res: { value: new THREE.Vector2() },
        backside: { value: back ? 1 : 0 },
        dispersion: { value: 0.5 },
        power: { value: back ? 0.22 : 0.3 },
      },
    });
  }
  const backMat = material(true),
    frontMat = material(false),
    pivot = new THREE.Group(),
    spinner = new THREE.Group();
  scene.add(pivot);
  pivot.add(spinner);
  const cube = new THREE.Mesh(
    new RoundedBoxGeometry(1, 1, 1, 8, 0.12),
    frontMat,
  );
  spinner.add(cube);
  spinner.rotation.set(-0.42, 0.62, 0.18);
  let width,
    height,
    drag = false,
    lastX = 0,
    lastY = 0,
    vx = 0,
    vy = 0,
    spin = 0,
    lastRelease = 0;
  const modelUrl =
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260929_212926_92423081-b0e4-4f5a-b650-14af6c05c058.glb";
  status.textContent = "Drag the glass to change your perspective";
  new GLTFLoader().load(
    modelUrl,
    (gltf) => {
      try {
        gltf.scene.updateMatrixWorld(true);
        const parts = [];
        gltf.scene.traverse((mesh) => {
          if (mesh.isMesh) {
            let g = mesh.geometry.clone();
            for (const a of ["uv", "color", "tangent"]) g.deleteAttribute(a);
            g = mergeVertices(g, 1e-4);
            g.computeVertexNormals();
            g.applyMatrix4(mesh.matrixWorld);
            parts.push(g);
          }
        });
        const geometry = mergeGeometries(parts);
        geometry.center();
        geometry.computeBoundingBox();
        const size = geometry.boundingBox.getSize(new THREE.Vector3());
        geometry.scale(
          1 / Math.max(size.x, size.y, size.z),
          1 / Math.max(size.x, size.y, size.z),
          1 / Math.max(size.x, size.y, size.z),
        );
        cube.geometry.dispose();
        cube.geometry = geometry;
        parts.forEach((g) => g.dispose());
      } catch {
        /* RoundedBox remains as the accessible fallback. */
      }
    },
    undefined,
    () => {},
  );
  function layout() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const d = renderer.getPixelRatio();
    rtBack.setSize(width * d, height * d);
    rtFront.setSize(width * d, height * d);
    [backMat, frontMat].forEach((m) =>
      m.uniforms.res.value.set(width * d, height * d),
    );
    headline.width = width * d;
    headline.height = height * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.fillStyle = "#050606";
    ctx.fillRect(0, 0, width, height);
    const mobile = width < 700;
    const fs = Math.min(height * 0.2, width * (mobile ? 0.21 : 0.12));
    ctx.font = `700 ${fs}px Space Grotesk, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#e8e7df";
    ["Explore", "New", "Ideas"].forEach((word, i) =>
      ctx.fillText(
        word,
        width * (mobile ? 0.5 : 0.53),
        height * 0.46 + (i - 1) * fs * 1.04 + fs * 0.32,
      ),
    );
    texture.needsUpdate = true;
    const visH = 2 * Math.tan(Math.PI / 12) * 10;
    const px = Math.min(height * 0.49, width * (mobile ? 0.57 : 0.32));
    pivot.scale.setScalar((px / height) * visH);
    pivot.position.x = (mobile ? 0 : 0.03) * visH * camera.aspect;
    pivot.position.y = height < 600 ? 0 : visH * 0.03;
  }
  addEventListener("resize", layout);
  document.fonts.ready.then(layout);
  layout();
  const yAxis = new THREE.Vector3(0, 1, 0),
    xAxis = new THREE.Vector3(1, 0, 0),
    q = new THREE.Quaternion();
  function rotate(x, y) {
    spinner.quaternion.premultiply(q.setFromAxisAngle(yAxis, x));
    spinner.quaternion.premultiply(q.setFromAxisAngle(xAxis, y));
  }
  canvas.addEventListener("pointerdown", (e) => {
    drag = true;
    vx = vy = spin = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    vx = (e.clientX - lastX) * 0.008;
    vy = (e.clientY - lastY) * 0.008;
    rotate(vx, vy);
    lastX = e.clientX;
    lastY = e.clientY;
  });
  function release() {
    drag = false;
    canvas.classList.remove("dragging");
    lastRelease = performance.now();
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  document.querySelector("#left").onclick = () => {
    spin = -Math.PI / 2;
    vx = vy = 0;
  };
  document.querySelector("#right").onclick = () => {
    spin = Math.PI / 2;
    vx = vy = 0;
  };
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      spin = e.key === "ArrowLeft" ? -Math.PI / 2 : Math.PI / 2;
    }
  });
  document.querySelector("#reset").onclick = () => {
    spinner.rotation.set(-0.42, 0.62, 0.18);
    vx = vy = spin = 0;
  };
  document.querySelector("#dispersion").oninput = (e) =>
    [backMat, frontMat].forEach(
      (m) => (m.uniforms.dispersion.value = +e.target.value),
    );
  loop((t, dt, paused) => {
    if (!drag) {
      if (Math.abs(spin) > 0.0005) {
        const change = spin * Math.min(1, 0.09 * dt * 60);
        rotate(change, 0);
        spin -= change;
      } else if (!paused) {
        rotate(vx * dt * 60, vy * dt * 60);
        vx *= Math.pow(0.94, dt * 60);
        vy *= Math.pow(0.94, dt * 60);
        if (performance.now() - lastRelease > 600)
          rotate(0.0035 * dt * 60, 0.0012 * dt * 60);
      }
    }
    cube.material = backMat;
    renderer.setRenderTarget(rtBack);
    renderer.clear();
    renderer.render(bgScene, camera);
    renderer.setRenderTarget(rtFront);
    renderer.clear();
    renderer.render(bgScene, camera);
    renderer.clearDepth();
    renderer.render(scene, camera);
    cube.material = frontMat;
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(bgScene, camera);
    renderer.clearDepth();
    renderer.render(scene, camera);
  });
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    document.querySelector(".prism-stage").classList.add("no-webgl");
    status.textContent =
      "Graphics context lost. Reload to resume the 3D scene.";
  });
}
