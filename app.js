/* ═══════════════════════════════════════════════════════════════
   SPECTRUM INTELLIGENCE v3 — Cinematic Scrollytelling KP
   GLSL Background + GSAP Pin/Scrub + Horizontal Scroll +
   Elastic Tilt + Magnetic Buttons + Counter Animation
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const S = { mx: 0.5, my: 0.5, tx: 0.5, ty: 0.5, scroll: 0, loaded: false };

  /* ══════════════ 1. GLSL SHADER BACKGROUND ══════════════ */
  function initWebGL() {
    const c = document.getElementById('webgl-canvas');
    if (!c) return;
    const r = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: false, powerPreference: 'high-performance' });
    r.setSize(innerWidth, innerHeight);
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(.5, .5) },
        uScroll: { value: 0 }, uRes: { value: new THREE.Vector2(innerWidth, innerHeight) },
        uC1: { value: new THREE.Color(0x0a0a14) }, uC2: { value: new THREE.Color(0x0d1b3e) },
        uAcc: { value: new THREE.Color(0x2563eb) }
      },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}`,
      fragmentShader: `
        precision highp float;
        uniform float uTime,uScroll;uniform vec2 uMouse,uRes;
        uniform vec3 uC1,uC2,uAcc;varying vec2 vUv;
        vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
        vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
        vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
        float snoise(vec2 v){
          const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
          vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1;
          i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
          vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
          vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
          vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
          m=m*m;m=m*m;
          vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
          m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
          vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
          return 130.*dot(m,g);
        }
        float grid(vec2 uv,float sz,float th){vec2 g=abs(fract(uv*sz)-.5);return 1.-smoothstep(0.,th,min(g.x,g.y));}
        float traceLine(vec2 uv,float t,float off){
          float y=uv.y+off;float w=sin(uv.x*20.+t+off*10.)*.02;
          float l=smoothstep(.003,0.,abs(y-.5+w));
          float p=smoothstep(0.,1.,sin(uv.x*3.14159-t*2.+off*5.));
          return l*p*.5;
        }
        void main(){
          vec2 uv=vUv;float asp=uRes.x/uRes.y;vec2 uvA=vec2(uv.x*asp,uv.y);
          uv.y+=uScroll*.25;
          vec2 md=uv-uMouse;float mD=length(md);float mG=exp(-mD*3.)*.12;
          vec3 bg=mix(uC1,uC2,uv.y+snoise(uv*2.+uTime*.04)*.2);
          bg+=vec3(grid(uvA+vec2(0.,uScroll*.4),22.,.07)*.012);
          float vox=snoise(uvA*8.+uTime*.12)*.5+snoise(uvA*16.-uTime*.08)*.25;
          bg+=uAcc*smoothstep(.1,.55,vox)*.035*(1.-uScroll*.4);
          for(float i=0.;i<6.;i++) bg+=uAcc*traceLine(uvA,uTime*.7,i*.1-.25)*.12;
          bg+=uAcc*mG;
          float pn=snoise(uvA*55.+uTime*.25);bg+=vec3(smoothstep(.93,.96,pn)*.25);
          bg*=1.-smoothstep(.3,1.2,length(uv-.5)*1.3);
          bg+=(fract(sin(dot(uv*uTime,vec2(12.9898,78.233)))*43758.5453)-.5)*.025;
          gl_FragColor=vec4(bg,1.);
        }
      `
    });
    sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    let t = 0;
    (function loop() {
      requestAnimationFrame(loop);
      t += .016;
      S.mx += (S.tx - S.mx) * .04; S.my += (S.ty - S.my) * .04;
      mat.uniforms.uTime.value = t;
      mat.uniforms.uMouse.value.set(S.mx, 1 - S.my);
      mat.uniforms.uScroll.value = S.scroll;
      r.render(sc, cam);
    })();
    addEventListener('resize', () => { r.setSize(innerWidth, innerHeight); mat.uniforms.uRes.value.set(innerWidth, innerHeight); });
  }

  /* ══════════════ 2. LENIS ══════════════ */
  let lenis;
  function initLenis() {
    lenis = new Lenis({ duration: 1.6, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ({ progress }) => {
      S.scroll = progress;
      const bar = document.getElementById('scroll-progress');
      if (bar) bar.style.width = (progress * 100) + '%';
    });
  }

  /* ══════════════ 3. GSAP SCROLLYTELLING ══════════════ */
  function initScrollytelling() {
    gsap.registerPlugin(ScrollTrigger);

    // ─── HERO: Pinned with dramatic exit ───
    const heroTl = gsap.timeline({
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=120%', scrub: 1.5, pin: true }
    });
    heroTl
      .to('.hero-title .title-line:first-child span', { x: -200, opacity: 0, ease: 'none' }, 0)
      .to('.hero-title .title-line:last-child span', { x: 200, opacity: 0, ease: 'none' }, 0)
      .to('.hero-subtitle', { y: -80, opacity: 0, ease: 'none' }, 0)
      .to('.hero-kpis', { y: -60, opacity: 0, ease: 'none' }, 0.1)
      .to('.hero-tag', { scale: 0.85, opacity: 0, ease: 'none' }, 0)
      .to('.scroll-cue', { opacity: 0, ease: 'none' }, 0);

    // ─── PAIN: Horizontal scroll (pinned section) ───
    const track = document.querySelector('.hscroll-track');
    if (track) {
      const cards = gsap.utils.toArray('.pain-card');
      const totalW = () => track.scrollWidth - window.innerWidth + 80;

      gsap.to(track, {
        x: () => -totalW(),
        ease: 'none',
        scrollTrigger: {
          trigger: '#pain',
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => '+=' + totalW(),
          invalidateOnRefresh: true,
        }
      });

      // Cards stagger in during horizontal scroll
      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0, y: 40, rotateY: -8,
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            containerAnimation: undefined,
            start: 'left 80%',
            toggleActions: 'play none none reverse',
          }
        });
      });
    }

    // Pain bar fills
    gsap.utils.toArray('.pain-bar-fill').forEach(el => {
      gsap.to(el, { width: el.dataset.w + '%', duration: 1.5, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });

    // ─── GENERIC: .fade-in elements ───
    gsap.utils.toArray('.fade-in').forEach(el => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });

    // ─── SECTION HEADERS: Index + Title reveal ───
    document.querySelectorAll('.section[data-section]').forEach(sec => {
      if (sec.id === 'hero') return;
      const idx = sec.querySelector('.section-index');
      const spans = sec.querySelectorAll('.title-line span');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sec, start: 'top 70%', toggleActions: 'play none none reverse' }
      });
      if (idx) tl.to(idx, { opacity: 1, x: 0, duration: 0.6 });
      if (spans.length) tl.to(spans, { y: 0, duration: 1.2, stagger: 0.08, ease: 'power4.out' }, '-=0.3');
    });

    // ─── TECH: Cards fly in from sides ───
    const techL = document.querySelector('.tech-card-left');
    const techR = document.querySelector('.tech-card-right');
    if (techL && techR) {
      gsap.set(techL, { opacity: 0, x: -80 });
      gsap.set(techR, { opacity: 0, x: 80 });
      const techTl = gsap.timeline({
        scrollTrigger: { trigger: '#tech', start: 'top 60%', toggleActions: 'play none none reverse' }
      });
      techTl
        .to(techL, { opacity: 1, x: 0, duration: 1, ease: 'power3.out' })
        .to(techR, { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }, '-=0.7');
    }

    // Compression bars
    gsap.utils.toArray('.compress-fill').forEach(el => {
      gsap.to(el, { width: el.dataset.w + '%', duration: 2, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    // ─── METHOD: Staggered cards ───
    gsap.utils.toArray('.method-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, y: 60, scale: 0.95,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'back.out(1.2)',
        scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });

    // Market compare bars
    gsap.utils.toArray('.market-fill').forEach(el => {
      const w = el.classList.contains('market-fill-red') ? '100%' : '50%';
      gsap.to(el, { width: w, duration: 1.5, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    // ─── MVP: Cards rise with elastic ───
    gsap.utils.toArray('.mvp-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, y: 80, rotateX: 8,
        duration: 1,
        delay: i * 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });

    // Timeline dots progressive activation
    gsap.utils.toArray('.tl-dot').forEach((dot, i) => {
      gsap.to(dot, {
        borderColor: '#2563EB', background: '#2563EB', boxShadow: '0 0 12px rgba(37,99,235,.3)',
        duration: 0.5,
        delay: i * 0.3,
        scrollTrigger: { trigger: '.mvp-timeline', start: 'top 75%' }
      });
    });
    gsap.utils.toArray('.tl-line').forEach((line, i) => {
      gsap.to(line, {
        background: 'linear-gradient(90deg, #2563EB, #2563EB)',
        duration: 0.6,
        delay: i * 0.3 + 0.15,
        scrollTrigger: { trigger: '.mvp-timeline', start: 'top 75%' }
      });
    });

    // ─── CTA: Dramatic cards ───
    gsap.utils.toArray('.cta-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, y: 50, rotateY: -6,
        duration: 1,
        delay: i * 0.15,
        ease: 'power3.out',
        transformPerspective: 800,
        scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });

    // ─── NAV: Active state ───
    document.querySelectorAll('.section[data-section]').forEach((sec, i) => {
      ScrollTrigger.create({
        trigger: sec, start: 'top center', end: 'bottom center',
        onEnter: () => setNav(i), onEnterBack: () => setNav(i),
      });
    });
    function setNav(i) {
      document.querySelectorAll('.nav-link').forEach((l, j) => l.classList.toggle('active', j === i - 1));
    }

    // ─── PARALLAX: Subtle per-section ───
    document.querySelectorAll('.section-container').forEach(el => {
      gsap.to(el, {
        y: -20,
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 3 }
      });
    });
  }

  /* ══════════════ 4. HERO ENTRANCE ══════════════ */
  function playHero() {
    const tl = gsap.timeline({ delay: 0.15 });
    tl.to('.hero-tag', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('#hero .title-line span', { y: 0, duration: 1.4, stagger: 0.12, ease: 'power4.out' }, '-=0.5')
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8')
      .to('.hero-kpis', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .to('.scroll-cue', { opacity: 1, duration: 0.8 }, '-=0.3');

    // Counter animation
    tl.add(() => {
      document.querySelectorAll('.kpi-val').forEach(el => {
        const v = parseInt(el.dataset.val);
        gsap.to({ n: 0 }, {
          n: v, duration: 2.5, ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].n); }
        });
      });
    }, '-=1.2');
  }

  /* ══════════════ 5. PRELOADER ══════════════ */
  function initPreloader() {
    const el = document.getElementById('preloader');
    if (!el) return;
    const counter = el.querySelector('.preloader-counter');
    const line = el.querySelector('.preloader-line');
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 14 + 4;
      if (p > 100) p = 100;
      counter.textContent = Math.round(p) + '%';
      line.style.setProperty('--p', p + '%');
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          gsap.to(el, {
            clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.inOut',
            onComplete() {
              el.style.display = 'none';
              S.loaded = true;
              const nav = document.getElementById('main-nav');
              if (nav) nav.classList.add('visible');
              playHero();
            }
          });
        }, 350);
      }
    }, 50);
  }

  /* ══════════════ 6. INTERACTIONS ══════════════ */
  function initMouse() {
    document.addEventListener('mousemove', e => {
      S.tx = e.clientX / innerWidth;
      S.ty = e.clientY / innerHeight;
    });

    // 3D Tilt on cards
    const cards = document.querySelectorAll('.pain-card, .tech-card, .method-card, .mvp-card, .cta-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotateY: x * 10, rotateX: -y * 10, duration: 0.35, ease: 'power2.out', transformPerspective: 1000 });
        const glow = card.querySelector('.card-glow');
        if (glow) gsap.to(glow, { x: x * 80, y: y * 80, duration: 0.4 });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      });
    });

    // Magnetic CTA buttons
    document.querySelectorAll('.cta-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3 });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)' });
      });
    });
  }

  /* ══════════════ 7. NAV ══════════════ */
  function initNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target && lenis) lenis.scrollTo(target, { offset: -80, duration: 2.5 });
      });
    });
  }

  /* ══════════════ 8. INITIAL STATES ══════════════ */
  function initStates() {
    gsap.set('.hero-tag', { opacity: 0, y: 20 });
    gsap.set('.hero-subtitle', { opacity: 0, y: 20 });
    gsap.set('.hero-kpis', { opacity: 0, y: 30 });
    gsap.set('.scroll-cue', { opacity: 0 });
  }

  /* ══════════════ BOOT ══════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initStates();
    initWebGL();
    initLenis();
    initScrollytelling();
    initMouse();
    initNav();
    initPreloader();
  });
})();
