# Code Rules

## 1. UI/UX
- Baseline: Awwwards SOTD quality. Cohesive aesthetic.
- Creativity: User dictates creative direction. AI executes it to stunning perfection.
- Space: Fluid (clamp). Let layout breathe.
- Color: oklch. Harmonious palettes. High contrast.
- Type: VarFonts. Tight tracking (headers), loose (body).

## 2. AI/XR (If Req)
- AI: MediaPipe/Transformers.js (Local AI, face/hand track). ONLY if explicitly requested.
- XR: WebXR (@react-three/xr). ONLY if requested.

## 3. WebGL/GPGPU
- Tech: Raymarching, SDFs, Navier-Stokes fluid, Curtains.js/OGL.
- Wasm/WebGPU: Use Rust+Wasm for physics/particles (>100k).

## 4. PostProc/Audio
- FX: @react-three/postprocessing (SSR, SSAO, GodRays, Abberation).
- Audio: Pipe WebAudio FFT to shader uniforms.

## 5. Frontend/CSS
- Arch: PWA (ServiceWorker/IndexedDB). ShadowDOM/WebComponents.
- CSS: @container, @layer. No !important.

## 6. Backend
- EDA: Kafka/RabbitMQ/Redis PubSub.
- DB: DistSQL (Cockroach/Yugabyte) + pgvector.

## 7. Security/DevOps
- Sec: ZeroTrust, mTLS, Zod (E2E), asymmetric JWTs.
- Ops: OpenTelemetry (OTel) tracing, WAF, ChaosEng.

## 8. Checks (MANDATORY)
1. StunningUI? (Scroll/Cursor/Colors/GSAP)
2. CinematicDepth? (SSAO/SDF)
3. PhysicsUI? (Springs)
4. Isolated? (ShadowDOM/@container)
5. Perf? (WebGPU/Wasm)
6. Traceable/Dist? (OTel/DistSQL)
7. Secure? (mTLS/Zod)

## 9. Scroll Choreography
- Smooth: Lenis mandatory.
- Depth: Parallax layers via gsap.to(y) w/ scrub.
- BlurFade: opacity+blur() via ScrollTrigger.
- Narrative: GSAP ScrollTrigger.pin().
- Reveals: clip-path:inset/circle.

## 10. MicroPatterns
- Magnetic: Lerp translate to cursor via GSAP quickTo.
- Cursor: Lagging custom div via rAF lerp.
- Scramble: Swap chars on hover/entry.
- Marquee: CSS translateX(-50%) infinite.

## 11. AnimTools
- 3D: Theatre.js (timeline), Spline (embed).
- Physics: ReactSpring.
- 2D/Vanilla: Anime.js, Pixi.js, mo.js.

## 12. Texture
- Grain: SVG feTurbulence.
- MeshGrad: Overlap 3-5 animated radial-gradients + blur.
- Glass: backdrop-filter:blur(16px) saturate(1.8).
- Line: SVG stroke-dashoffset scroll.

## 13. Perf/A11y
- A11y: prefers-reduced-motion fallback. WCAG AA contrast. Semantic HTML.
- GPU: Animate ONLY transform/opacity. Add/remove will-change.

## 14. Code Quality
- React: Min re-renders.
- Strict: NO 'any'. NO unused imports. NO dead code.
- Bundle: Tree-shake. dynamic import() heavy libs.
- CSS: Use clamp().

## 15. Debug
- Stack: Read FULL trace. Trace to origin. No bandaids.
- Method: (1) Repro (2) Isolate (3) Trace (4) Fix (5) Verify.
- ZeroMistake: Think first. Check paths/tags mentally. Test locally before commit.

## 16. Usage Opt
- Short/Precise. Batch edits. Read only needed lines. One-shot execution.

## 17. Visual Check (REQ)
- Run browser. Scroll full page. If flat/default -> Fix immediately without asking.

## 18. Collaboration
- Partner: Antigravity.
- Rule: Read files before edit. Respect existing patterns. Shared Awwwards/Zod standards.
