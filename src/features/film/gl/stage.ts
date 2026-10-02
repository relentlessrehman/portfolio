/*
 * The film's WebGL layer: one renderer, one canvas, three things in it.
 *   Core    the glass protagonist (single-pass fake dispersion, no FBO)
 *   Swarm   Madad's nodes + edges (Points/LineSegments, vertex-shader animated)
 *   Ripple  the scene-03 impact rings (analytic shader on one plane)
 *
 * Lazy-loaded after first paint (Performance §3). It only reads a plain state
 * object each frame — no React, no layout reads. Budgets and the measured GPU
 * costs behind these choices: docs/redesign/PERFORMANCE.md §1.3.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { FilmMode } from '../engine/mode'

/** What the stage draws — written by the engine each frame, damped here */
export interface GLState {
  /** Core centre, fractions of the layer viewport (0 = centre, y down) */
  x: number
  y: number
  /** Core radius as a fraction of min(viewport width, height) */
  s: number
  a: number
  dark: number
  /** Emissive "point of light" amount (bookends) */
  e: number
  /** Vertical stretch while falling */
  st: number
  split: number
  stream: number
  edges: number
  query: number
  path: number
  dolly: number
  rip: number
  ripA: number
}

export interface StageView {
  /** Layer (small-viewport) size in CSS px — the coordinate space of GLState */
  width: number
  height: number
}

export interface Stage {
  readonly canvas: HTMLCanvasElement
  ready: Promise<void>
  render: (target: GLState, view: StageView, now: number, force: boolean) => boolean
  /** Pointer position, -0.5..0.5 of the viewport (fine pointers only) — gentle parallax */
  setPointer: (x: number, y: number) => void
  resize: () => void
  /** Steps quality down one rung; returns false when nothing is left to drop */
  degrade: () => boolean
  info: () => { dpr: number; nodes: number; rung: number }
  dispose: () => void
}

const FOV = 35
const CAM_Z = 10
const VIS_H = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180)

/* ── Shaders ───────────────────────────────────────────────────────── */

const CORE_VERT = /* glsl */ `
uniform float uTime; uniform float uWobble; uniform float uStretch; uniform vec3 uDir;
varying vec3 vN; varying vec3 vV; varying vec3 vLocal;
void main() {
  vec3 p = position;
  vec3 n = normal;
  // surface tension: low-order modes that ring after the droplet moves
  float w = sin(p.x * 3.1 + uTime * 9.0) * sin(p.y * 2.6 - uTime * 7.4)
          + 0.6 * sin(p.z * 3.7 + uTime * 11.3) * sin(p.x * 2.2 + uTime * 5.1);
  p += n * w * 0.045 * uWobble;
  // teardrop: the trailing side stretches against the direction of travel,
  // the leading side flattens a little
  float trail = max(0.0, dot(n, -uDir));
  float lead = max(0.0, dot(n, uDir));
  p += -uDir * pow(trail, 2.4) * uStretch * 0.95;
  p -= uDir * lead * lead * uStretch * 0.14;
  vLocal = position;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vN = normalize(mat3(modelMatrix) * n);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`

/*
 * The droplet, art-directed the way product renderers fake glass on black:
 *   a soft round window highlight with a hot core (upper left)
 *   a thin luminous rim that warms toward the lower right, where light exits
 *   a caustic crescent inside the lower right (light focused through the drop)
 *   a mostly clear body with a lavender transmitted gradient, darker inner ring
 *   a whisper of dispersion at the very edge
 * No environment sampling — nothing can blow out into a hard wedge.
 */
const CORE_FRAG = /* glsl */ `
uniform float uTime; uniform float uDark; uniform float uAlpha; uniform float uEmit;
varying vec3 vN; varying vec3 vV; varying vec3 vLocal;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vV);
  float ndv = clamp(dot(n, v), 0.0, 1.0);
  float edge = 1.0 - ndv;
  vec3 R = reflect(-v, n);

  // 1. specular: soft window + hot core, from a key light up-left in front
  vec3 L = normalize(vec3(-0.55, 0.62, 0.56));
  float s = max(dot(R, L), 0.0);
  float spec = smoothstep(0.962, 0.994, s) * 0.85 + pow(s, 1400.0) * 1.4;
  // a faint secondary glint from a fill light, lower right
  float s2 = max(dot(R, normalize(vec3(0.7, -0.35, 0.62))), 0.0);
  spec += smoothstep(0.985, 0.998, s2) * 0.25;

  // 2. rim: thin and luminous; cooler up top, brighter where light exits
  float exitSide = smoothstep(-0.3, 0.85, dot(n, normalize(vec3(0.62, -0.62, 0.2))));
  vec3 rimCol = mix(vec3(0.36, 0.37, 0.88), vec3(0.88, 0.89, 1.0), exitSide);
  vec3 rim = rimCol * pow(edge, 3.2) * (0.75 + 0.6 * exitSide);

  // 3. caustic crescent inside the lower right
  float caus = smoothstep(0.5, 0.9, dot(n, normalize(vec3(0.52, -0.6, 0.6))))
             * smoothstep(0.12, 0.55, edge) * (1.0 - smoothstep(0.82, 0.98, edge));
  vec3 caustic = vec3(0.6, 0.62, 1.0) * caus * 0.6;

  // 4. body: clear water, lit from below through itself
  float below = smoothstep(0.55, -0.85, n.y);
  vec3 body = mix(vec3(0.008, 0.008, 0.016), vec3(0.17, 0.18, 0.46), below) * (0.4 + 0.6 * ndv);
  float innerRing = smoothstep(0.5, 0.78, edge) * (1.0 - smoothstep(0.84, 0.96, edge));
  body *= 1.0 - innerRing * 0.75;

  // 5. dispersion at the silhouette
  vec3 disp = vec3(0.28, 0.02, 0.38) * pow(edge, 9.0) * 0.7;

  float breathe = 0.97 + 0.03 * sin(uTime * 1.05);
  vec3 col = (body + rim + caustic + disp) * breathe + vec3(1.0) * spec;
  float a = clamp(0.2 + below * 0.2 + pow(edge, 2.2) * 0.62 + spec + caus * 0.4, 0.0, 1.0);

  // ink: obsidian glass for the paper scene
  vec3 ink = vec3(0.018, 0.018, 0.026) + vec3(1.0) * spec * 1.1 + vec3(0.55, 0.56, 0.82) * pow(edge, 3.0) * 0.55;
  col = mix(col, ink, uDark);
  a = mix(a, 0.96, uDark);

  // emissive point of light (first and last frame)
  col = mix(col, vec3(0.95, 0.95, 1.0) * (0.7 + 0.3 * ndv), uEmit);
  a = mix(a, smoothstep(0.0, 0.5, ndv), uEmit);
  // analytic anti-aliasing at the silhouette (the renderer runs without MSAA)
  a *= clamp(ndv / max(fwidth(ndv) * 1.5, 1e-4), 0.0, 1.0);
  gl_FragColor = vec4(col, a * uAlpha);
}`

const HALO_FRAG = /* glsl */ `
uniform float uAlpha; varying vec2 vUv;
void main() {
  vec2 p = vUv - 0.5;
  float d = length(p) * 2.0;
  float glow = pow(max(0.0, 1.0 - d), 2.6) * 0.26;
  // light focused through the drop pools just below it
  float pool = exp(-pow((p.y + 0.2) * 9.0, 2.0) - pow(p.x * 5.0, 2.0)) * 0.12;
  gl_FragColor = vec4(vec3(0.45, 0.46, 0.98), (glow + pool) * uAlpha);
}`

const SWARM_COMMON = /* glsl */ `
uniform float uSplit; uniform float uStream; uniform float uQuery; uniform float uPath;
uniform float uDolly; uniform float uTime; uniform vec3 uCenter; uniform vec3 uScale;
attribute vec3 aTarget; attribute vec3 aMid; attribute vec3 aRoot;
attribute float aLevel; attribute vec4 aSeed; attribute float aMatch; attribute float aPath;
varying float vAlpha; varying float vGlow;
vec3 swarmPosition() {
  float b1 = smoothstep(0.0, 0.25, uSplit);
  float b2 = smoothstep(0.22, 0.55, uSplit);
  float b3 = smoothstep(0.5, 1.0, uSplit);
  vec3 p;
  float born;
  if (aLevel < 0.5) { p = aTarget * b1; born = b1; }
  else if (aLevel < 1.5) { p = mix(aRoot * b1, aTarget, b2); born = b2; }
  else { p = mix(mix(aRoot * b1, aMid, b2), aTarget, b3); born = b3; }
  p += sin(uTime * (0.3 + aSeed.w * 0.4) + aSeed.xyz * 6.2831) * 0.012 * b3;
  // streams: nodes flow toward the camera along +z (scene 09)
  vec3 s = vec3(aSeed.x * 2.0 - 1.0, aSeed.y * 2.0 - 1.0, 0.0) * vec3(1.1, 1.0, 1.0);
  s.z = mod(aSeed.z * 9.0 + uTime * 0.9 * (0.6 + aSeed.w), 9.0) - 7.0;
  p = mix(p, s, uStream * step(0.5, aLevel));
  // a query lifts its matches toward the viewer
  p.z += aMatch * uQuery * 0.9;
  vec3 world = uCenter + p * uScale;
  world.z += uDolly * 2.4;
  float onPath = aPath >= 0.0 ? 1.0 : 0.0;
  vGlow = aMatch * uQuery * 0.9
    + onPath * (smoothstep(0.08, 0.0, abs(uPath * 1.1 - aPath)) * 1.6 + step(aPath, uPath * 1.1) * 0.5);
  vAlpha = max(born, uStream * step(0.5, aLevel));
  return world;
}`

const POINTS_VERT = /* glsl */ `
${SWARM_COMMON}
uniform float uSize;
void main() {
  vec3 world = swarmPosition();
  vec4 mv = viewMatrix * vec4(world, 1.0);
  float lvl = aLevel < 0.5 ? 3.2 : aLevel < 1.5 ? 2.0 : 1.0;
  gl_PointSize = uSize * lvl * (1.0 + vGlow * 0.8) * (${CAM_Z.toFixed(1)} / max(-mv.z, 0.5));
  gl_Position = projectionMatrix * mv;
}`

const POINTS_FRAG = /* glsl */ `
uniform float uAlpha; varying float vAlpha; varying float vGlow;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float core = smoothstep(0.42, 0.0, d);
  float halo = exp(-d * d * 7.0) * 0.45;
  float a = core * 0.85 + halo;
  vec3 col = mix(vec3(0.66, 0.67, 1.0), vec3(1.0), clamp(vGlow + core * 0.4, 0.0, 1.0));
  gl_FragColor = vec4(col, a * vAlpha * uAlpha * (0.55 + vGlow));
}`

const LINES_VERT = /* glsl */ `
${SWARM_COMMON}
void main() {
  vec3 world = swarmPosition();
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}`

const LINES_FRAG = /* glsl */ `
uniform float uEdges; uniform float uAlpha; varying float vAlpha; varying float vGlow;
void main() {
  float a = uEdges * vAlpha * uAlpha * (0.1 + vGlow * 0.35);
  gl_FragColor = vec4(vec3(0.6, 0.62, 1.0), a);
}`

const RIPPLE_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

const RIPPLE_FRAG = /* glsl */ `
uniform float uPhase; uniform float uAlpha; varying vec2 vUv;
float height(vec2 p) {
  float d = length(p);
  float h = 0.0;
  for (int i = 0; i < 4; i++) {
    float r = uPhase * 1.12 - float(i) * 0.12;
    if (r <= 0.0) continue;
    float w = 0.025 + r * 0.05;
    float x = (d - r) / w;
    h += sin(x * 3.14159) * exp(-x * x) * (1.0 - float(i) * 0.2) * (1.0 - r * 0.75);
  }
  return h;
}
void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float e = 0.004;
  float dx = height(p + vec2(e, 0.0)) - height(p - vec2(e, 0.0));
  float dy = height(p + vec2(0.0, e)) - height(p - vec2(0.0, e));
  vec3 n = normalize(vec3(-dx * 6.0, 1.0, -dy * 6.0));
  vec3 view = normalize(vec3(0.0, 0.55, 0.85));
  vec3 key = normalize(vec3(-0.35, 0.85, 0.4));
  float spec = pow(max(dot(reflect(-view, n), key), 0.0), 60.0);
  float sheen = pow(1.0 - n.y, 0.6) * 0.35;
  float fall = smoothstep(1.0, 0.1, length(p));
  float splash = exp(-length(p) * 22.0) * smoothstep(0.35, 0.0, uPhase) * 1.4;
  vec3 col = vec3(0.92, 0.93, 1.0) * spec * 3.0 + vec3(0.55, 0.57, 1.0) * sheen * 1.6 + vec3(1.0) * splash;
  float a = clamp(spec * 2.0 + sheen * 1.4 + splash, 0.0, 1.0) * fall * uAlpha;
  gl_FragColor = vec4(col, a);
}`

/* ── Swarm data: 11 course clusters, hierarchical birth, a learning path ── */

function buildSwarm(count: number) {
  const rand = mulberry32(7)
  const L1 = 3
  const L2 = 20
  const targets = new Float32Array(count * 3)
  const mids = new Float32Array(count * 3)
  const roots = new Float32Array(count * 3)
  const levels = new Float32Array(count)
  const seeds = new Float32Array(count * 4)
  const matches = new Float32Array(count)
  const paths = new Float32Array(count).fill(-1)
  const parentOf = new Int32Array(count)

  const put = (arr: Float32Array, i: number, v: [number, number, number]) => {
    arr[i * 3] = v[0]
    arr[i * 3 + 1] = v[1]
    arr[i * 3 + 2] = v[2]
  }
  const get = (arr: Float32Array, i: number): [number, number, number] => [
    arr[i * 3],
    arr[i * 3 + 1],
    arr[i * 3 + 2],
  ]

  for (let i = 0; i < count; i++) {
    seeds[i * 4] = rand()
    seeds[i * 4 + 1] = rand()
    seeds[i * 4 + 2] = rand()
    seeds[i * 4 + 3] = rand()
    if (i < L1) {
      const angle = (i / L1) * Math.PI * 2 + 0.4
      put(targets, i, [
        Math.cos(angle) * 0.45,
        Math.sin(angle) * 0.4,
        (rand() - 0.5) * 0.4,
      ])
      levels[i] = 0
      parentOf[i] = -1
    } else if (i < L2) {
      // cluster centres: 11 courses + a few cross-topic hubs, on a wide ellipsoid
      const k = i - L1
      const angle = (k / (L2 - L1)) * Math.PI * 2
      const radius = 0.62 + rand() * 0.28
      put(targets, i, [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.82,
        (rand() - 0.5) * 1.1,
      ])
      levels[i] = 1
      const parent = k % L1
      parentOf[i] = parent
      put(roots, i, get(targets, parent))
    } else {
      const cluster = L1 + Math.floor(rand() * (L2 - L1))
      const c = get(targets, cluster)
      const spread = 0.17
      put(targets, i, [
        c[0] + gauss(rand) * spread,
        c[1] + gauss(rand) * spread,
        c[2] + gauss(rand) * spread,
      ])
      levels[i] = 2
      parentOf[i] = cluster
      put(mids, i, c)
      put(roots, i, get(targets, parentOf[cluster]))
      matches[i] = rand() < 0.018 ? 1 : 0
    }
  }

  // A "learning path" (Dijkstra in the real system) hopping across five clusters
  const pathClusters = [L1 + 1, L1 + 5, L1 + 8, L1 + 12, L1 + 15]
  const pathNodes: Array<number> = []
  for (const cluster of pathClusters) {
    for (
      let i = L2;
      i < count && pathNodes.length < pathClusters.indexOf(cluster) * 6 + 6;
      i++
    ) {
      if (parentOf[i] === cluster) pathNodes.push(i)
    }
  }
  pathNodes.forEach((node, order) => {
    paths[node] = order / Math.max(1, pathNodes.length - 1)
  })

  // Edges: every leaf to its cluster centre, plus a few sibling links
  const edgePairs: Array<number> = []
  for (let i = L1; i < count; i++) {
    const parent = parentOf[i]
    if (parent >= 0 && (i < L2 || rand() < 0.55)) edgePairs.push(i, parent)
  }
  for (let i = 0; i < pathNodes.length - 1; i++)
    edgePairs.push(pathNodes[i], pathNodes[i + 1])

  return { targets, mids, roots, levels, seeds, matches, paths, edgePairs }
}

function swarmGeometry(
  data: ReturnType<typeof buildSwarm>,
  indices?: ReadonlyArray<number>,
) {
  const geometry = new BufferGeometry()
  const pick = (source: Float32Array, size: number) => {
    if (!indices) return source
    const out = new Float32Array(indices.length * size)
    indices.forEach((index, k) => {
      for (let c = 0; c < size; c++)
        out[k * size + c] = source[index * size + c]!
    })
    return out
  }
  const count = indices ? indices.length : data.levels.length
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(count * 3), 3),
  )
  geometry.setAttribute(
    'aTarget',
    new BufferAttribute(pick(data.targets, 3), 3),
  )
  geometry.setAttribute('aMid', new BufferAttribute(pick(data.mids, 3), 3))
  geometry.setAttribute('aRoot', new BufferAttribute(pick(data.roots, 3), 3))
  geometry.setAttribute('aLevel', new BufferAttribute(pick(data.levels, 1), 1))
  geometry.setAttribute('aSeed', new BufferAttribute(pick(data.seeds, 4), 4))
  geometry.setAttribute('aMatch', new BufferAttribute(pick(data.matches, 1), 1))
  geometry.setAttribute('aPath', new BufferAttribute(pick(data.paths, 1), 1))
  return geometry
}

/* ── Stage ─────────────────────────────────────────────────────────── */

export function createStage(host: HTMLElement, mode: FilmMode): Stage {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const lite = mode === 'film-lite'
  const dprCaps = lite
    ? [1]
    : coarse
      ? [2, 1.75, 1.5, 1.25, 1]
      : [1.5, 1.25, 1, 0.85]
  const maxPixels = lite ? 1.3e6 : 3.7e6
  let rung = 0

  const renderer = new WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  canvas.setAttribute('role', 'presentation')
  host.appendChild(canvas)

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100)
  camera.position.z = CAM_Z

  /* Core */
  const coreUniforms = {
    uTime: { value: 0 },
    uDark: { value: 0 },
    uAlpha: { value: 0 },
    uEmit: { value: 0 },
    uWobble: { value: 0 },
    uStretch: { value: 0 },
    uDir: { value: new Vector3(0, -1, 0) },
  }
  const segments = lite ? [48, 32] : [96, 64]
  const core = new Mesh(
    new SphereGeometry(1, segments[0], segments[1]),
    new ShaderMaterial({
      uniforms: coreUniforms,
      vertexShader: CORE_VERT,
      fragmentShader: CORE_FRAG,
      transparent: true,
      depthWrite: false,
    }),
  )
  core.renderOrder = 3
  // soft light around the Core (the reference's glow), additive, camera-facing
  const haloUniforms = { uAlpha: { value: 0 } }
  const halo = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      uniforms: haloUniforms,
      vertexShader: RIPPLE_VERT,
      fragmentShader: HALO_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  halo.renderOrder = 2
  scene.add(halo, core)

  /* Swarm */
  const nodeCount = lite ? 600 : 2400
  const data = buildSwarm(nodeCount)
  const swarmUniforms = {
    uSplit: { value: 0 },
    uStream: { value: 0 },
    uQuery: { value: 0 },
    uPath: { value: 0 },
    uDolly: { value: 0 },
    uTime: { value: 0 },
    uCenter: { value: new Vector3() },
    uScale: { value: new Vector3(1, 1, 1) },
    uSize: { value: 3 },
    uAlpha: { value: 1 },
    uEdges: { value: 0 },
  }
  const pointsGeometry = swarmGeometry(data)
  const points = new Points(
    pointsGeometry,
    new ShaderMaterial({
      uniforms: swarmUniforms,
      vertexShader: POINTS_VERT,
      fragmentShader: POINTS_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  points.frustumCulled = false
  const lines = new LineSegments(
    swarmGeometry(data, data.edgePairs),
    new ShaderMaterial({
      uniforms: swarmUniforms,
      vertexShader: LINES_VERT,
      fragmentShader: LINES_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  lines.frustumCulled = false
  scene.add(lines, points)

  /* Ripple */
  const rippleUniforms = { uPhase: { value: 0 }, uAlpha: { value: 0 } }
  const ripple = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      uniforms: rippleUniforms,
      vertexShader: RIPPLE_VERT,
      fragmentShader: RIPPLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  ripple.rotation.x = -1.22
  scene.add(ripple)

  /* Damped render state */
  const rs: GLState = {
    x: 0,
    y: 0,
    s: 0,
    a: 0,
    dark: 0,
    e: 0,
    st: 0,
    split: 0,
    stream: 0,
    edges: 0,
    query: 0,
    path: 0,
    dolly: 0,
    rip: 0,
    ripA: 0,
  }
  let primed = false
  let last = performance.now()
  let width = 0
  let height = 0
  let lastDrawn = 0
  let idleSince = performance.now()
  // droplet physics: screen velocity → wobble (decaying ring) + teardrop stretch
  let prevX = Number.NaN
  let prevY = Number.NaN
  let wobble = 0
  let stretch = 0
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

  function resize() {
    width = host.clientWidth
    height = host.clientHeight
    const cap = dprCaps[Math.min(rung, dprCaps.length - 1)]
    let dpr = Math.min(window.devicePixelRatio || 1, cap)
    if (width * height * dpr * dpr > maxPixels)
      dpr = Math.sqrt(maxPixels / (width * height))
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height, false)
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    camera.aspect = width / Math.max(1, height)
    camera.updateProjectionMatrix()
    swarmUniforms.uSize.value =
      (coarse ? 2.4 : 3) * dpr * Math.min(1.4, Math.max(0.7, height / 900))
    primed = false
  }
  resize()

  const ready = renderer.compileAsync(scene, camera).catch(() => undefined)

  function damp(dt: number, target: GLState) {
    const k = 1 - Math.exp(-dt * 11)
    let moving = false
    for (const key of Object.keys(rs) as Array<keyof GLState>) {
      const goal = target[key]
      const next = primed ? rs[key] + (goal - rs[key]) * k : goal
      if (Math.abs(goal - next) > 1e-4) moving = true
      rs[key] = next
    }
    primed = true
    return moving
  }

  function render(
    target: GLState,
    view: StageView,
    now: number,
    force: boolean,
  ) {
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    let moving = damp(dt, target)
    const pk = 1 - Math.exp(-dt * 4)
    pointer.x += (pointer.tx - pointer.x) * pk
    pointer.y += (pointer.ty - pointer.y) * pk
    if (
      Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) >
      1e-4
    )
      moving = true
    if (wobble > 0.01 || stretch > 0.005) moving = true
    if (moving || force) idleSince = now
    // Render on demand: ambient float only, throttled to 30fps after 3s idle
    const idle = now - idleSince > 3000
    if (!moving && !force && idle && now - lastDrawn < 33) return false
    lastDrawn = now

    const visH = VIS_H
    const visW = visH * camera.aspect
    const toWorldX = (fx: number) =>
      ((view.width * (0.5 + fx)) / Math.max(1, width) - 0.5) * visW
    const toWorldY = (fy: number) =>
      (0.5 - (view.height * (0.5 + fy)) / Math.max(1, height)) * visH
    const pxToWorld = visH / Math.max(1, height)
    const t = now / 1000

    // Core: ambient float ≤ 0.6% of the viewport; pointer parallax ≤ 1.2%
    const float = Math.sin(t * 1.05) * 0.006 * (1 - rs.e)
    const radius = rs.s * Math.min(view.width, view.height) * pxToWorld
    const cx = rs.x + pointer.x * 0.024 * (1 - rs.e)
    const cy = rs.y + float + pointer.y * 0.024 * (1 - rs.e)
    core.position.set(toWorldX(cx), toWorldY(cy), 0)
    core.scale.setScalar(radius)
    core.rotation.y = t * 0.2

    // velocity in viewport-fractions per second drives the liquid response
    if (dt > 0 && !Number.isNaN(prevX)) {
      const vx = (cx - prevX) / dt
      const vy = (cy - prevY) / dt
      const speed = Math.hypot(vx, vy)
      if (speed > 0.02) coreUniforms.uDir.value.set(vx / speed, -vy / speed, 0)
      wobble = Math.max(wobble * Math.exp(-dt * 2.6), Math.min(1, speed * 0.9))
      const targetStretch = Math.min(0.32, speed * 0.16) + rs.st * 3.2
      stretch += (targetStretch - stretch) * (1 - Math.exp(-dt * 9))
    }
    prevX = cx
    prevY = cy
    coreUniforms.uWobble.value = wobble * (1 - rs.e)
    coreUniforms.uStretch.value = stretch * (1 - rs.e)
    core.visible = rs.a > 0.002 && radius > 0
    coreUniforms.uTime.value = t
    coreUniforms.uDark.value = rs.dark
    coreUniforms.uAlpha.value = rs.a
    coreUniforms.uEmit.value = rs.e
    halo.visible = core.visible
    halo.position.copy(core.position)
    halo.position.z = -0.01
    halo.scale.setScalar(radius * (5.2 - rs.e * 1.8))
    haloUniforms.uAlpha.value = rs.a * (1 - rs.dark) * (1 + rs.e * 1.5)

    // Swarm centred on the Core
    const swarmOn = rs.split > 0.002 || rs.stream > 0.002
    points.visible = swarmOn
    lines.visible = swarmOn && rs.edges > 0.002
    if (swarmOn) {
      swarmUniforms.uSplit.value = rs.split
      swarmUniforms.uStream.value = rs.stream
      swarmUniforms.uQuery.value = rs.query
      swarmUniforms.uPath.value = rs.path
      swarmUniforms.uDolly.value = rs.dolly
      swarmUniforms.uEdges.value = rs.edges
      swarmUniforms.uTime.value = t
      swarmUniforms.uCenter.value.set(
        toWorldX(rs.x + pointer.x * 0.035),
        toWorldY(rs.y + pointer.y * 0.035),
        0,
      )
      const compact = view.width < 600
      swarmUniforms.uScale.value.set(
        visW * (compact ? 0.42 : 0.34),
        visH * (compact ? 0.26 : 0.36),
        1.6,
      )
    }

    // Ripple at the point of impact
    ripple.visible = rs.ripA > 0.002
    if (ripple.visible) {
      rippleUniforms.uPhase.value = rs.rip
      rippleUniforms.uAlpha.value = rs.ripA
      ripple.position.set(toWorldX(0), toWorldY(0.14) - radius * 0.9, 0)
      const size = visW * 1.1
      ripple.scale.set(size, size, 1)
    }

    renderer.render(scene, camera)
    return true
  }

  function degrade() {
    if (rung < dprCaps.length - 1) {
      rung++
      resize()
      return true
    }
    if (pointsGeometry.drawRange.count === Infinity) {
      pointsGeometry.setDrawRange(0, Math.floor(nodeCount / 2))
      return true
    }
    return false
  }

  return {
    canvas,
    ready: ready.then(() => undefined),
    render,
    resize,
    degrade,
    setPointer(x: number, y: number) {
      pointer.tx = x
      pointer.ty = y
    },
    info: () => ({ dpr: renderer.getPixelRatio(), nodes: nodeCount, rung }),
    dispose() {
      scene.traverse((object) => {
        if (
          object instanceof Mesh ||
          object instanceof Points ||
          object instanceof LineSegments
        ) {
          object.geometry.dispose()
          ;(object.material as ShaderMaterial).dispose()
        }
      })
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}

/* ── tiny deterministic PRNG + gaussian ───────────────────────────── */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function gauss(rand: () => number) {
  return (rand() + rand() + rand() - 1.5) / 1.5
}
