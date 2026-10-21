/**
 * The deck's one protagonist: clear glass droplets, ray-marched as signed
 * distance metaballs so they genuinely merge and split (smooth-min union).
 * Every slide sets a pose; each droplet springs to its new place, so a slide
 * change reads as liquid flowing into a new shape rather than a cut.
 *
 * World space: the z = 0 plane spans x ∈ [-8, 8], y ∈ [-4.5, 4.5] (16:9),
 * so poses can be placed against the slide layout directly.
 */
import {
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
  WebGLRenderer,
} from 'three'

export const MAX_DROPS = 10

/** [x, y, z, radius] */
export type Drop = readonly [number, number, number, number]

export interface Pose {
  drops: ReadonlyArray<Drop>
  /** Smooth-min blend radius: how eagerly neighbouring drops bridge */
  k?: number
}

export interface LiquidField {
  setPose: (pose: Pose, immediate?: boolean) => void
  setPointer: (x: number, y: number) => void
  /** frames per second over the last half second, and the resolution scale */
  stats: () => { fps: number; quality: number }
  dispose: () => void
}

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
precision highp float;
#define MAXB ${MAX_DROPS}
uniform vec2 uRes;
uniform float uTime;
uniform float uK;
uniform float uMotion;
uniform vec2 uCam;
uniform vec4 uB[MAXB];
varying vec2 vUv;

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

vec3 centre(int i) {
  vec4 b = uB[i];
  float f = float(i);
  vec3 drift = vec3(
    sin(uTime * 0.55 + f * 1.7),
    cos(uTime * 0.47 + f * 2.3),
    sin(uTime * 0.39 + f * 0.9)
  );
  return b.xyz + drift * 0.07 * b.w * uMotion;
}

float map(vec3 p) {
  float d = 1e5;
  for (int i = 0; i < MAXB; i++) {
    float r = uB[i].w;
    if (r < 0.002) continue;
    d = smin(d, length(p - centre(i)) - r, uK);
  }
  // a slow surface swell, so the glass reads as liquid, not plastic
  float t = uTime * 0.8 * uMotion;
  d += sin(p.x * 3.1 + t) * sin(p.y * 2.7 - t * 1.2) * sin(p.z * 2.9 + t * 0.7) * 0.018;
  return d;
}

vec3 normalAt(vec3 p) {
  const vec2 e = vec2(1.0, -1.0) * 0.0015;
  return normalize(
    e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx)
  );
}

// A white photo studio: paper floor, two soft boxes, one indigo bounce card.
vec3 env(vec3 d) {
  vec3 paper = vec3(0.969, 0.969, 0.961);
  // the floor: a crisp horizon is what makes clear glass read as glass
  vec3 col = mix(paper, vec3(0.70, 0.71, 0.77), smoothstep(0.02, -0.12, d.y));
  col = mix(col, vec3(0.50, 0.51, 0.58), smoothstep(-0.2, -0.9, d.y));
  col = mix(col, vec3(1.0), smoothstep(0.2, 0.9, d.y) * 0.6);
  // key soft box overhead
  float key = smoothstep(0.62, 0.72, d.y) * smoothstep(0.75, 0.45, abs(d.x + 0.15));
  col += vec3(0.55) * key;
  // tall strip on the right
  float strip = smoothstep(0.70, 0.80, d.x) * smoothstep(0.55, 0.30, abs(d.y - 0.05));
  col += vec3(0.45) * strip;
  // indigo bounce card low on the left: the only colour, as on the site
  float bounce = smoothstep(-0.45, -0.85, d.x) * smoothstep(0.35, -0.25, d.y);
  col = mix(col, vec3(0.43, 0.44, 0.95), bounce * 0.55);
  // cool lavender fill from behind
  col = mix(col, vec3(0.65, 0.66, 0.97), smoothstep(-0.2, -1.0, d.z) * 0.18);
  return col;
}

vec3 shade(vec3 p, vec3 rd) {
  vec3 n = normalAt(p);
  vec3 v = -rd;
  float nv = max(dot(n, v), 0.0);
  float fr = mix(0.05, 1.0, pow(1.0 - nv, 4.0));

  vec3 refl = env(reflect(rd, n));
  // dispersion: each channel bends a little differently
  vec3 refr = vec3(
    env(refract(rd, n, 1.0 / 1.31)).r,
    env(refract(rd, n, 1.0 / 1.33)).g,
    env(refract(rd, n, 1.0 / 1.36)).b
  );
  // thicker glass at the rim absorbs more, tinting it toward indigo
  vec3 absorb = mix(vec3(0.80, 0.82, 1.0), vec3(1.0), smoothstep(0.05, 0.7, nv));
  vec3 col = mix(refr * absorb, refl, fr);

  vec3 L = normalize(vec3(-0.45, 0.8, 0.55));
  float spec = pow(max(dot(reflect(-L, n), v), 0.0), 140.0) * 1.8;
  spec += pow(max(dot(reflect(-L, n), v), 0.0), 18.0) * 0.12;
  vec3 L2 = normalize(vec3(0.9, -0.1, 0.4));
  spec += pow(max(dot(reflect(-L2, n), v), 0.0), 60.0) * 0.5;
  col += vec3(spec);

  // a lit inner edge on the far side, where light exits the droplet
  col += vec3(0.75, 0.76, 1.0) * pow(max(dot(n, -L), 0.0), 3.0) * (1.0 - nv) * 0.35;
  return col;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 uv = vUv * 2.0 - 1.0;
  vec3 ro = vec3(uCam * 0.9, 12.0);
  vec3 target = vec3(uv.x * 4.5 * aspect, uv.y * 4.5, 0.0);
  vec3 rd = normalize(target - ro);

  // bound the march to the union of the drops' spheres
  float tmin = 1e5;
  float tmax = -1e5;
  for (int i = 0; i < MAXB; i++) {
    float r = uB[i].w;
    if (r < 0.002) continue;
    vec3 oc = ro - centre(i);
    float R = r + uK * 0.35 + 0.12;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - R * R;
    float h = b * b - c;
    if (h < 0.0) continue;
    h = sqrt(h);
    tmin = min(tmin, -b - h);
    tmax = max(tmax, -b + h);
  }

  vec4 outCol = vec4(0.0);

  if (tmax > tmin) {
    float t = max(tmin, 0.0);
    float md = 1e5;
    float mt = t;
    bool hit = false;
    for (int s = 0; s < 80; s++) {
      vec3 p = ro + rd * t;
      float d = map(p);
      if (d < md) { md = d; mt = t; }
      if (d < 0.0012) { hit = true; break; }
      t += d * 0.92;
      if (t > tmax) break;
    }
    // world size of one pixel at this depth, for an analytic soft edge
    float px = (9.0 / uRes.y) * (mt / 12.0) * 1.6;
    if (hit) {
      outCol = vec4(shade(ro + rd * t, rd), 1.0);
    } else if (md < px) {
      float a = 1.0 - md / px;
      outCol = vec4(shade(ro + rd * mt, rd) * a, a);
    }
  }

  if (outCol.a < 1.0) {
    // contact shadow and an indigo caustic on the paper below each drop
    float sh = 0.0;
    float ca = 0.0;
    vec2 q = target.xy;
    for (int i = 0; i < MAXB; i++) {
      float r = uB[i].w;
      if (r < 0.002) continue;
      vec3 c = centre(i);
      vec2 s = c.xy * (12.0 / (12.0 - c.z));
      vec2 dq = q - (s + vec2(0.18 * r, -r * 1.08));
      sh += exp(-(pow(dq.x / (r * 1.05), 2.0) + pow(dq.y / (r * 0.22), 2.0)) * 1.6) * 0.16;
      vec2 dc = q - (s + vec2(0.1 * r, -r * 1.02));
      ca += exp(-(pow(dc.x / (r * 0.45), 2.0) + pow(dc.y / (r * 0.1), 2.0)) * 1.4) * 0.22;
    }
    sh = min(sh, 0.22);
    ca = min(ca, 0.3);
    vec3 shadowCol = vec3(0.10, 0.10, 0.22);
    vec3 causticCol = vec3(0.56, 0.57, 1.0);
    float a = sh + ca * (1.0 - sh);
    vec3 c = (shadowCol * sh + causticCol * ca * (1.0 - sh));
    float rest = 1.0 - outCol.a;
    outCol = vec4(outCol.rgb + c * rest, outCol.a + a * rest);
  }

  gl_FragColor = outCol;
}
`

interface Spring {
  x: number
  v: number
  to: number
}

const spring = (x: number): Spring => ({ x, v: 0, to: x })

/** Pad a pose to MAX_DROPS: unused drops sleep inside a visible one at r = 0. */
function expand(pose: Pose): Array<Drop> {
  const visible = pose.drops.slice(0, MAX_DROPS)
  const out: Array<Drop> = [...visible]
  for (let i = visible.length; i < MAX_DROPS; i++) {
    const host = visible[i % Math.max(visible.length, 1)] ?? [0, 0, 0, 0]
    out.push([host[0], host[1], host[2], 0])
  }
  return out
}

export function createLiquidField(
  canvas: HTMLCanvasElement,
  options: { reducedMotion: boolean },
): LiquidField {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x000000, 0)

  const blobs = Array.from({ length: MAX_DROPS }, () => new Vector4())
  const uniforms = {
    uRes: { value: new Vector2(1, 1) },
    uTime: { value: 0 },
    uK: { value: 0.9 },
    uMotion: { value: options.reducedMotion ? 0 : 1 },
    uCam: { value: new Vector2() },
    uB: { value: blobs },
  }
  const material = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
  })
  const scene = new Scene()
  scene.add(new Mesh(new PlaneGeometry(2, 2), material))
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

  // 4 springs per drop (x, y, z, r) plus one for the blend radius
  const springs = Array.from({ length: MAX_DROPS }, () => [
    spring(0),
    spring(0),
    spring(0),
    spring(0),
  ])
  const kSpring = spring(0.9)
  const delays = new Float32Array(MAX_DROPS)
  const cam = { x: 0, y: 0, tx: 0, ty: 0 }

  // Resolution scale adapts to the GPU: integrated graphics on a classroom
  // laptop still hold frame rate, a good GPU gets full sharpness.
  let quality = 1
  let slowFrames = 0
  let fastFrames = 0

  function resize() {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * quality
    renderer.setPixelRatio(dpr)
    renderer.setSize(rect.width, rect.height, false)
    uniforms.uRes.value.set(rect.width * dpr, rect.height * dpr)
  }
  resize()
  const observer = new ResizeObserver(() => {
    resize()
    wake()
  })
  observer.observe(canvas)

  let raf = 0
  let last = performance.now()
  let elapsed = 0
  let sinceChange = 10
  let frames = 0
  let fps = 0
  let fpsSince = performance.now()

  // Render on demand: once every drop and the camera have settled, the loop
  // stops, so the GPU idles and nothing above the canvas has to repaint.
  let running = false
  function wake() {
    if (running || document.hidden) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  function frame(now: number) {
    frames++
    if (now - fpsSince >= 500) {
      fps = Math.round((frames * 1000) / (now - fpsSince))
      frames = 0
      fpsSince = now
    }
    const rawDt = (now - last) / 1000
    last = now
    const dt = Math.min(rawDt, 1 / 30)
    elapsed += dt
    sinceChange += dt

    // Frames slower than ~42fps count against quality; long stalls (a hidden
    // or throttled window) are ignored, and a steady 60fps earns it back.
    if (rawDt > 0.024 && rawDt < 0.1) slowFrames++
    else if (rawDt < 0.0185) fastFrames++
    if (slowFrames > 40 && quality > 0.55) {
      quality = Math.max(0.55, quality - 0.15)
      slowFrames = 0
      fastFrames = 0
      resize()
    } else if (fastFrames > 180 && quality < 1) {
      quality = Math.min(1, quality + 0.15)
      fastFrames = 0
      slowFrames = 0
      resize()
    }

    // An underdamped spring gives the small overshoot of a settling liquid
    const stiffness = 34
    const damping = 2 * Math.sqrt(stiffness) * 0.6
    for (let i = 0; i < MAX_DROPS; i++) {
      if (sinceChange < delays[i]) continue
      for (const s of springs[i]) {
        s.v += (stiffness * (s.to - s.x) - damping * s.v) * dt
        s.x += s.v * dt
      }
      const [x, y, z, r] = springs[i]
      blobs[i].set(x.x, y.x, z.x, Math.max(r.x, 0))
    }
    kSpring.v +=
      (stiffness * (kSpring.to - kSpring.x) - damping * kSpring.v) * dt
    kSpring.x += kSpring.v * dt
    uniforms.uK.value = Math.max(kSpring.x, 0.2)

    cam.x += (cam.tx - cam.x) * Math.min(dt * 3, 1)
    cam.y += (cam.ty - cam.y) * Math.min(dt * 3, 1)
    uniforms.uCam.value.set(cam.x, cam.y)
    uniforms.uTime.value = elapsed

    renderer.render(scene, camera)

    let moving =
      sinceChange < 0.5 ||
      Math.abs(kSpring.v) > 1e-3 ||
      Math.abs(cam.tx - cam.x) > 1e-3 ||
      Math.abs(cam.ty - cam.y) > 1e-3
    for (let i = 0; i < MAX_DROPS && !moving; i++) {
      for (const s of springs[i]) {
        if (Math.abs(s.v) > 1e-3 || Math.abs(s.to - s.x) > 1e-3) {
          moving = true
          break
        }
      }
    }
    if (moving) {
      raf = requestAnimationFrame(frame)
    } else {
      running = false
      fps = 0
    }
  }

  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(raf)
      running = false
    } else {
      wake()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)
  wake()

  return {
    setPose(pose, immediate = false) {
      const drops = expand(pose)
      sinceChange = 0
      for (let i = 0; i < MAX_DROPS; i++) {
        // ripple outward: later drops leave a beat after the first
        delays[i] = immediate || options.reducedMotion ? 0 : i * 0.04
        const target = drops[i]
        springs[i].forEach((s, axis) => {
          s.to = target[axis]
          if (immediate || options.reducedMotion) {
            s.x = s.to
            s.v = 0
          }
        })
        const [x, y, z, r] = springs[i]
        blobs[i].set(x.x, y.x, z.x, Math.max(r.x, 0))
      }
      kSpring.to = pose.k ?? 0.9
      if (immediate || options.reducedMotion) {
        kSpring.x = kSpring.to
        kSpring.v = 0
      }
      wake()
    },
    setPointer(x, y) {
      if (options.reducedMotion) return
      cam.tx = x
      cam.ty = y
      wake()
    },
    stats: () => ({ fps, quality }),
    dispose() {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      observer.disconnect()
      material.dispose()
      renderer.dispose()
    },
  }
}
