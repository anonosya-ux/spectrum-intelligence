/* ═══════════════════════════════════════════════════════════════
   SPECTRUM INTELLIGENCE — Cinematic SPA v2.0
   Custom GLSL Shaders + GSAP Scrollytelling + Lenis
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const S = {
    mouse: { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 },
    scroll: 0,
    loaded: false,
    section: 0,
  };

  /* ══════════════ 1. THREE.JS — Custom Shader Background ══════════════ */
  function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Full-screen quad with custom GLSL shader
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uScroll: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uColor1: { value: new THREE.Color(0x0a0a14) },
        uColor2: { value: new THREE.Color(0x0d1b3e) },
        uAccent: { value: new THREE.Color(0x2563eb) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uScroll;
        uniform vec2 uResolution;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uAccent;
        varying vec2 vUv;

        // Simplex noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m * m; m = m * m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x = a0.x * x0.x + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        // Grid pattern
        float grid(vec2 uv, float size, float thickness) {
          vec2 g = abs(fract(uv * size) - 0.5);
          float d = min(g.x, g.y);
          return 1.0 - smoothstep(0.0, thickness, d);
        }

        // Voxel-like pattern
        float voxelField(vec2 uv, float time) {
          float n = 0.0;
          vec2 p = uv * 8.0;
          // Layered noise for depth
          n += snoise(p + time * 0.15) * 0.5;
          n += snoise(p * 2.0 - time * 0.1) * 0.25;
          n += snoise(p * 4.0 + time * 0.2) * 0.125;
          return n;
        }

        // Algorithmic lines — like circuit traces
        float traceLine(vec2 uv, float time, float offset) {
          float y = uv.y + offset;
          float wave = sin(uv.x * 20.0 + time + offset * 10.0) * 0.02;
          float line = smoothstep(0.004, 0.0, abs(y - 0.5 + wave));
          float pulse = smoothstep(0.0, 1.0, sin(uv.x * 3.14159 - time * 2.0 + offset * 5.0));
          return line * pulse * 0.6;
        }

        void main() {
          vec2 uv = vUv;
          float aspect = uResolution.x / uResolution.y;
          vec2 uvA = vec2(uv.x * aspect, uv.y);

          // Scroll-driven distortion
          float scrollWarp = uScroll * 0.3;
          uv.y += scrollWarp;

          // Mouse influence
          vec2 mouseD = uv - uMouse;
          float mouseDist = length(mouseD);
          float mouseGlow = exp(-mouseDist * 3.0) * 0.15;

          // Base gradient
          vec3 bg = mix(uColor1, uColor2, uv.y + snoise(uv * 2.0 + uTime * 0.05) * 0.2);

          // Grid overlay
          float g = grid(uvA + vec2(0.0, uScroll * 0.5), 20.0, 0.08);
          bg += vec3(g * 0.015);

          // Voxel field
          float vox = voxelField(uvA + vec2(uTime * 0.02, uScroll * 0.3), uTime);
          float voxMask = smoothstep(0.1, 0.6, vox);
          bg += uAccent * voxMask * 0.04 * (1.0 - uScroll * 0.5);

          // Circuit trace lines
          for (float i = 0.0; i < 5.0; i++) {
            float t = traceLine(uvA, uTime * 0.8, i * 0.12 - 0.24);
            bg += uAccent * t * 0.15;
          }

          // Mouse glow
          bg += uAccent * mouseGlow;

          // Floating particles via noise
          float particleNoise = snoise(uvA * 50.0 + uTime * 0.3);
          float particles = smoothstep(0.92, 0.95, particleNoise);
          bg += vec3(particles * 0.3);

          // Vignette
          float vig = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5) * 1.3);
          bg *= vig;

          // Film grain
          float grain = (fract(sin(dot(uv * uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03;
          bg += grain;

          gl_FragColor = vec4(bg, 1.0);
        }
      `,
    });

    const quad = new THREE.Mesh(geo, mat);
    scene.add(quad);

    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      S.mouse.x += (S.mouse.tx - S.mouse.x) * 0.04;
      S.mouse.y += (S.mouse.ty - S.mouse.y) * 0.04;

      mat.uniforms.uTime.value = time;
      mat.uniforms.uMouse.value.set(S.mouse.x, 1.0 - S.mouse.y);
      mat.uniforms.uScroll.value = S.scroll;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      mat.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });
  }

  /* ══════════════ 2. LENIS SMOOTH SCROLL ══════════════ */
  let lenis;
  function initLenis() {
    lenis = new Lenis({ duration: 1.6, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ({ progress }) => {
      S.scroll = progress;
      document.getElementById('scroll-progress').style.width = (progress * 100) + '%';
    });
  }

  /* ══════════════ 3. SCROLLYTELLING CHOREOGRAPHY ══════════════ */
  function initScrollytelling() {
    gsap.registerPlugin(ScrollTrigger);

    // ── HERO: Pinned with parallax layers ──
    const heroTl = gsap.timeline({ scrollTrigger: {
      trigger: '#hero', start: 'top top', end: '+=150%', scrub: 1.5, pin: true,
    }});
    heroTl
      .to('.hero-title .title-line:first-child span', { x: -120, opacity: 0, ease: 'none' }, 0)
      .to('.hero-title .title-line:last-child span', { x: 120, opacity: 0, ease: 'none' }, 0)
      .to('.hero-subtitle', { y: -80, opacity: 0, ease: 'none' }, 0)
      .to('.hero-stats', { y: -60, opacity: 0, ease: 'none' }, 0.1)
      .to('.hero-tag', { scale: 0.8, opacity: 0, ease: 'none' }, 0);

    // ── PROBLEM: Staggered card reveals with horizontal scroll ──
    gsap.set('#problem .problem-card', { opacity: 0, y: 80, rotateX: 8 });
    gsap.set('#problem .section-index', { opacity: 0, x: -30 });

    const probTl = gsap.timeline({ scrollTrigger: {
      trigger: '#problem', start: 'top 65%', end: 'center center', toggleActions: 'play none none reverse',
    }});
    probTl
      .to('#problem .section-index', { opacity: 1, x: 0, duration: 0.6 })
      .to('#problem .title-line span', { y: 0, duration: 1.2, stagger: 0.08, ease: 'power4.out' }, '-=0.3')
      .to('.problem-card', { opacity: 1, y: 0, rotateX: 0, duration: 0.9, stagger: 0.18, ease: 'power3.out' }, '-=0.7')
      .to('.metric-bar-fill', { width: '100%', duration: 2, ease: 'power2.out' }, '-=0.5');

    // Problem cards parallax
    gsap.utils.toArray('.problem-card').forEach((card, i) => {
      gsap.to(card, {
        y: -30 - i * 10,
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 2 },
      });
    });

    // ── TECH: Split reveal + compression bar animation ──
    gsap.set('.tech-card', { opacity: 0, y: 80, scale: 0.95 });
    gsap.set('.compression-visual', { opacity: 0, y: 40 });

    const techTl = gsap.timeline({ scrollTrigger: {
      trigger: '#tech', start: 'top 65%', end: 'center center', toggleActions: 'play none none reverse',
    }});
    techTl
      .to('#tech .section-index', { opacity: 1, x: 0, duration: 0.6 })
      .to('#tech .title-line span', { y: 0, duration: 1.2, stagger: 0.08, ease: 'power4.out' }, '-=0.3')
      .to('.tech-card-ai', { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.5')
      .to('.tech-card-logistics', { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.5')
      .to('.compression-visual', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .to('.compress-fill', { width: (_, el) => el.dataset.width + '%', duration: 1.8, stagger: 0.4, ease: 'power2.out' }, '-=0.3');

    // ── MVP: Pinned timeline animation ──
    gsap.set('.mvp-card', { opacity: 0, y: 80, scale: 0.9 });

    const mvpTl = gsap.timeline({ scrollTrigger: {
      trigger: '#mvp', start: 'top 65%', toggleActions: 'play none none reverse',
    }});
    mvpTl
      .to('#mvp .section-index', { opacity: 1, x: 0, duration: 0.6 })
      .to('#mvp .title-line span', { y: 0, duration: 1.2, stagger: 0.08, ease: 'power4.out' }, '-=0.3')
      .to('.mvp-card', { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.2, ease: 'back.out(1.2)' }, '-=0.5');

    // Timeline dots animation
    mvpTl.to('.timeline-dot', { borderColor: '#2563EB', stagger: { each: 0.3, from: 'start' }, duration: 0.4 }, '-=0.3');
    mvpTl.to('.timeline-line', { background: 'linear-gradient(90deg, #2563EB, #2563EB)', stagger: 0.3, duration: 0.5 }, '-=0.8');

    // ── CTA: Dramatic reveal ──
    gsap.set('.cta-card', { opacity: 0, y: 60, rotateY: -5 });

    const ctaTl = gsap.timeline({ scrollTrigger: {
      trigger: '#cta', start: 'top 65%', toggleActions: 'play none none reverse',
    }});
    ctaTl
      .to('#cta .section-index', { opacity: 1, x: 0, duration: 0.6 })
      .to('#cta .title-line span', { y: 0, duration: 1.2, stagger: 0.08, ease: 'power4.out' }, '-=0.3')
      .to('.cta-desc', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .to('.cta-card', { opacity: 1, y: 0, rotateY: 0, duration: 0.9, stagger: 0.2, ease: 'power3.out', transformPerspective: 800 }, '-=0.4')
      .to('.cta-footer', { opacity: 1, duration: 0.6 }, '-=0.2');

    // ── NAV HIGHLIGHTING ──
    document.querySelectorAll('.section[data-section]').forEach((sec, i) => {
      ScrollTrigger.create({
        trigger: sec, start: 'top center', end: 'bottom center',
        onEnter: () => setNav(i), onEnterBack: () => setNav(i),
      });
    });

    function setNav(i) {
      document.querySelectorAll('.nav-link').forEach((l, j) => l.classList.toggle('active', j === i - 1));
    }
  }

  /* ══════════════ 4. HERO ENTRANCE ══════════════ */
  function playHeroEntrance() {
    const tl = gsap.timeline({ delay: 0.1 });
    tl.to('.hero-tag', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('#hero .title-line span', { y: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' }, '-=0.5')
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.7')
      .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .to('.hero-scroll-hint', { opacity: 1, duration: 0.8 }, '-=0.3');

    // Animate counters
    tl.add(() => {
      document.querySelectorAll('.stat-number').forEach(el => {
        const v = parseInt(el.dataset.value);
        gsap.to({ n: 0 }, { n: v, duration: 2.5, ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].n); }
        });
      });
    }, '-=1.2');
  }

  /* ══════════════ 5. PRELOADER ══════════════ */
  function initPreloader() {
    const el = document.getElementById('preloader');
    const counter = el.querySelector('.preloader-counter');
    const line = el.querySelector('.preloader-line');
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p > 100) p = 100;
      counter.textContent = Math.round(p) + '%';
      line.style.setProperty('--p', p + '%');
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          gsap.to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut',
            onComplete() {
              el.style.display = 'none';
              S.loaded = true;
              document.getElementById('main-nav').classList.add('visible');
              playHeroEntrance();
            }
          });
        }, 400);
      }
    }, 50);
  }

  /* ══════════════ 6. MOUSE & TILT ══════════════ */
  function initMouse() {
    document.addEventListener('mousemove', e => {
      S.mouse.tx = e.clientX / window.innerWidth;
      S.mouse.ty = e.clientY / window.innerHeight;
    });

    // Magnetic card tilt
    document.querySelectorAll('.problem-card, .tech-card, .mvp-card, .cta-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotateY: x * 8, rotateX: -y * 8, duration: 0.4, ease: 'power2.out', transformPerspective: 1000 });
        const glow = card.querySelector('.card-glow');
        if (glow) gsap.to(glow, { x: x * 100, y: y * 100, duration: 0.5 });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
      });
    });

    // CTA button magnetic effect
    document.querySelectorAll('.cta-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.3 });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ══════════════ 7. TEXT SPLITTING (word-by-word reveal) ══════════════ */
  function splitText() {
    // Add word-by-word split to subtitle for advanced reveal
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
      const html = subtitle.innerHTML;
      const words = html.split(/(\s+|<br\s*\/?>)/);
      subtitle.innerHTML = words.map(w => {
        if (w.match(/<br\s*\/?>/)) return w;
        if (w.trim() === '') return w;
        return `<span class="word">${w}</span>`;
      }).join('');
    }
  }

  /* ══════════════ 8. NAVIGATION ══════════════ */
  function initNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target && lenis) lenis.scrollTo(target, { offset: -80, duration: 2.5 });
      });
    });
  }

  /* ══════════════ 9. INITIAL STATES ══════════════ */
  function initStates() {
    gsap.set('.section-index', { opacity: 0, x: -30 });
    gsap.set('.title-line span', { y: '120%' });
    gsap.set('.hero-tag', { opacity: 0, y: 20 });
    gsap.set('.hero-subtitle', { opacity: 0, y: 20 });
    gsap.set('.hero-stats', { opacity: 0, y: 30 });
    gsap.set('.cta-desc', { opacity: 0, y: 20 });
    gsap.set('.cta-footer', { opacity: 0 });
  }

  /* ══════════════ BOOT ══════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    splitText();
    initStates();
    initWebGL();
    initLenis();
    initScrollytelling();
    initMouse();
    initNav();
    initPreloader();
  });
})();
