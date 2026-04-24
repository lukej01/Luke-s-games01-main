# Code Rules

## 1. UI/UX
- Baseline: Awwwards SOTD quality. Cohesive aesthetic.
- Creativity: User dictates creative direction. AI executes it to stunning perfection.
- Space: Fluid (`clamp()`). Let layout breathe.
- Color: `oklch`. Harmonious palettes. High contrast.
- Type: Variable fonts. Tight tracking (headers), loose (body).

## 2. AI/XR (If Requested)
- AI: MediaPipe / Transformers.js (local AI, face/hand tracking). ONLY if explicitly requested.
- XR: WebXR (`@react-three/xr`). ONLY if explicitly requested.

## 3. WebGL / GPGPU
- Tech: Raymarching, SDFs, Navier-Stokes fluid, Curtains.js / OGL.
- Wasm/WebGPU: Use Rust+Wasm for physics/particles (>100k).

## 4. Post-Processing / Audio
- FX: `@react-three/postprocessing` (SSR, SSAO, GodRays, Chromatic Aberration).
- Audio: Pipe WebAudio FFT to shader uniforms.

## 5. Frontend / CSS
- Arch: PWA (ServiceWorker / IndexedDB). ShadowDOM / WebComponents.
- CSS: `@container`, `@layer`. No `!important`.

## 6. Backend
- EDA: Kafka / RabbitMQ / Redis PubSub.
- DB: DistSQL (CockroachDB / YugabyteDB) + pgvector.

## 7. Security / DevOps
- Sec: Zero Trust, mTLS, Zod (E2E validation), asymmetric JWTs.
- Ops: OpenTelemetry (OTel) tracing, WAF, Chaos Engineering.

## 8. Mandatory Checks (Before Every Delivery)
1. Stunning UI? (Scroll / Cursor / Colors / GSAP)
2. Cinematic depth? (SSAO / SDF)
3. Physics UI? (Springs)
4. Isolated? (ShadowDOM / `@container`)
5. Perf? (WebGPU / Wasm)
6. Traceable/Distributed? (OTel / DistSQL)
7. Secure? (mTLS / Zod)

## 9. Scroll Choreography
- Smooth: Lenis is mandatory.
- Depth: Parallax layers via `gsap.to(y)` with `scrub`.
- Blur-fade: `opacity` + `blur()` via ScrollTrigger.
- Narrative: `GSAP ScrollTrigger.pin()`.
- Reveals: `clip-path: inset() / circle()`.

## 10. Micro Patterns
- Magnetic: Lerp translate to cursor via `GSAP quickTo`.
- Cursor: Lagging custom div via `rAF` lerp.
- Scramble: Swap chars on hover / entry.
- Marquee: `CSS translateX(-50%)` infinite.

## 11. Animation Tools
- 3D: Theatre.js (timeline), Spline (embed).
- Physics: React Spring.
- 2D/Vanilla: Anime.js, Pixi.js, mo.js.

## 12. Texture
- Grain: SVG `feTurbulence`.
- Mesh gradient: Overlap 3–5 animated `radial-gradient`s + `blur`.
- Glass: `backdrop-filter: blur(16px) saturate(1.8)`.
- Line: SVG `stroke-dashoffset` scroll animation.

## 13. Perf / A11y
- A11y: `prefers-reduced-motion` fallback. WCAG AA contrast. Semantic HTML.
- GPU: Animate ONLY `transform` / `opacity`. Add/remove `will-change` dynamically.

## 14. Code Quality
- React: Minimize re-renders.
- Strict: NO `any`. NO unused imports. NO dead code.
- Bundle: Tree-shake. `dynamic import()` heavy libs.
- CSS: Always use `clamp()`.

## 15. Debugging
- Stack: Read FULL trace. Trace to origin. No bandaids.
- Method: (1) Repro → (2) Isolate → (3) Trace → (4) Fix → (5) Verify.
- Zero Mistake: Think first. Check paths/tags mentally. Test locally before commit.

## 16. Usage Optimization
- Short and precise. Batch edits. Read only needed lines. One-shot execution.

## 17. Visual Check (REQUIRED)
- Run browser. Scroll full page. If flat/default → fix immediately without asking.

## 18. Collaboration
- Partner: Antigravity.
- Rule: Read files before editing. Respect existing patterns. Shared Awwwards/Zod standards.
