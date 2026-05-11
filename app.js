/* ═══════════════════════════════════════════════════
   SPECTRUM INTELLIGENCE — Main Application
   Three.js + GSAP + Lenis Orchestration
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── State ──
    const state = {
        mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
        scroll: { current: 0, target: 0, progress: 0 },
        isLoaded: false,
        currentSection: 0,
        rafId: null,
    };

    // ══════════════════════════════════════════════════
    // 1. THREE.JS — Algorithmic Grid Background
    // ══════════════════════════════════════════════════

    function initWebGL() {
        const canvas = document.getElementById('webgl-canvas');
        if (!canvas) return;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 18);

        // ── Voxel Grid Geometry ──
        const gridSize = 20;
        const spacing = 1.1;
        const totalCubes = gridSize * gridSize;
        const dummy = new THREE.Object3D();

        const cubeGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
        const cubeMat = new THREE.MeshBasicMaterial({
            color: 0x2563EB,
            transparent: true,
            opacity: 0.12,
            wireframe: true,
        });

        const instancedMesh = new THREE.InstancedMesh(cubeGeo, cubeMat, totalCubes);
        scene.add(instancedMesh);

        // Position grid
        const offset = (gridSize - 1) * spacing * 0.5;
        const basePositions = [];
        for (let x = 0; x < gridSize; x++) {
            for (let z = 0; z < gridSize; z++) {
                basePositions.push({
                    x: x * spacing - offset,
                    y: 0,
                    z: z * spacing - offset,
                });
            }
        }

        // ── Connecting Lines ──
        const linePositions = [];
        const lineCount = 60;
        for (let i = 0; i < lineCount; i++) {
            const a = Math.floor(Math.random() * totalCubes);
            let b = Math.floor(Math.random() * totalCubes);
            while (b === a) b = Math.floor(Math.random() * totalCubes);
            linePositions.push(
                basePositions[a].x, basePositions[a].y, basePositions[a].z,
                basePositions[b].x, basePositions[b].y, basePositions[b].z
            );
        }

        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({
            color: 0x2563EB,
            transparent: true,
            opacity: 0.04,
        });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(lines);

        // ── Floating Particles ──
        const particleCount = 120;
        const particleGeo = new THREE.BufferGeometry();
        const particlePos = new Float32Array(particleCount * 3);
        const particleSpeeds = [];
        for (let i = 0; i < particleCount; i++) {
            particlePos[i * 3] = (Math.random() - 0.5) * 30;
            particlePos[i * 3 + 1] = (Math.random() - 0.5) * 30;
            particlePos[i * 3 + 2] = (Math.random() - 0.5) * 20;
            particleSpeeds.push({
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005,
                z: (Math.random() - 0.5) * 0.003,
            });
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x818CF8,
            size: 0.06,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true,
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // ── Animation Loop ──
        let time = 0;

        function animate() {
            state.rafId = requestAnimationFrame(animate);
            time += 0.008;

            // Smooth mouse follow
            state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
            state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

            // Rotate whole scene based on mouse + scroll
            const scrollInfluence = state.scroll.progress * Math.PI * 0.5;
            scene.rotation.x = -0.6 + state.mouse.y * 0.15 + scrollInfluence * 0.3;
            scene.rotation.y = state.mouse.x * 0.2 + time * 0.05;

            // Animate voxels
            for (let i = 0; i < totalCubes; i++) {
                const bp = basePositions[i];
                const wave = Math.sin(bp.x * 0.3 + time * 1.5) *
                    Math.cos(bp.z * 0.3 + time * 1.2) * 1.5;
                const mouseInfluence = Math.sin(
                    (bp.x - state.mouse.x * 10) * 0.1 +
                    (bp.z - state.mouse.y * 10) * 0.1
                ) * 0.5;

                dummy.position.set(bp.x, wave + mouseInfluence, bp.z);
                dummy.scale.setScalar(0.8 + Math.sin(time + i * 0.1) * 0.3);
                dummy.rotation.y = time * 0.5 + i * 0.01;
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(i, dummy.matrix);
            }
            instancedMesh.instanceMatrix.needsUpdate = true;

            // Animate particles
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += particleSpeeds[i].x;
                positions[i * 3 + 1] += particleSpeeds[i].y;
                positions[i * 3 + 2] += particleSpeeds[i].z;
                // Wrap around
                if (Math.abs(positions[i * 3]) > 15) particleSpeeds[i].x *= -1;
                if (Math.abs(positions[i * 3 + 1]) > 15) particleSpeeds[i].y *= -1;
                if (Math.abs(positions[i * 3 + 2]) > 10) particleSpeeds[i].z *= -1;
            }
            particles.geometry.attributes.position.needsUpdate = true;

            // Fade opacity based on scroll
            const fadeOut = Math.max(0.02, 0.12 - state.scroll.progress * 0.08);
            cubeMat.opacity = fadeOut;
            lineMat.opacity = Math.max(0.01, 0.04 - state.scroll.progress * 0.03);

            renderer.render(scene, camera);
        }

        animate();

        // ── Resize Handler ──
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ══════════════════════════════════════════════════
    // 2. LENIS — Smooth Scroll
    // ══════════════════════════════════════════════════

    let lenis;

    function initLenis() {
        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // Update scroll state
        lenis.on('scroll', ({ progress }) => {
            state.scroll.progress = progress;
            const progressBar = document.getElementById('scroll-progress');
            if (progressBar) progressBar.style.width = (progress * 100) + '%';
        });
    }

    // ══════════════════════════════════════════════════
    // 3. GSAP — Section Choreography
    // ══════════════════════════════════════════════════

    function initAnimations() {
        gsap.registerPlugin(ScrollTrigger);

        // ── Hero Entrance ──
        const heroTl = gsap.timeline({ delay: 0.2 });

        heroTl
            .to('.hero-tag', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
            .to('#hero .title-line span', {
                y: 0,
                duration: 1.2,
                stagger: 0.12,
                ease: 'power4.out',
            }, '-=0.4')
            .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
            .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
            .to('.hero-scroll-hint', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2');

        // Animate stat numbers
        heroTl.add(() => {
            document.querySelectorAll('.stat-number').forEach((el) => {
                const target = parseInt(el.dataset.value);
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: function () {
                        el.textContent = Math.round(this.targets()[0].val);
                    },
                });
            });
        }, '-=1');

        // ── Hero Parallax Out ──
        gsap.to('.hero-content', {
            y: -100,
            opacity: 0,
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '60% top',
                scrub: 1.5,
            },
        });

        // ── Section 2: Problem ──
        const problemTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#problem',
                start: 'top 70%',
                end: 'center center',
                toggleActions: 'play none none reverse',
            },
        });

        problemTl
            .to('#problem .section-index', { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' })
            .to('#problem .title-line span', {
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out',
            }, '-=0.3')
            .to('.problem-card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
            }, '-=0.5')
            .to('.metric-bar-fill', {
                width: '100%',
                duration: 1.5,
                ease: 'power2.out',
            }, '-=0.3');

        // ── Section 3: Tech ──
        const techTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#tech',
                start: 'top 70%',
                end: 'center center',
                toggleActions: 'play none none reverse',
            },
        });

        techTl
            .to('#tech .section-index', { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' })
            .to('#tech .title-line span', {
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out',
            }, '-=0.3')
            .to('.tech-card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
            }, '-=0.5')
            .to('.compression-visual', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
            }, '-=0.3')
            .to('.compress-fill', {
                width: (i, el) => el.dataset.width + '%',
                duration: 1.5,
                stagger: 0.3,
                ease: 'power2.out',
            }, '-=0.3');

        // ── Section 4: MVP ──
        const mvpTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#mvp',
                start: 'top 70%',
                end: 'center center',
                toggleActions: 'play none none reverse',
            },
        });

        mvpTl
            .to('#mvp .section-index', { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' })
            .to('#mvp .title-line span', {
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out',
            }, '-=0.3')
            .to('.mvp-card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
            }, '-=0.5');

        // ── Section 5: CTA ──
        const ctaTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#cta',
                start: 'top 70%',
                end: 'center center',
                toggleActions: 'play none none reverse',
            },
        });

        ctaTl
            .to('#cta .section-index', { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' })
            .to('#cta .title-line span', {
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out',
            }, '-=0.3')
            .to('.cta-desc', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
            .to('.cta-card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
            }, '-=0.4')
            .to('.cta-footer', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2');

        // ── Nav Active State ──
        const sections = document.querySelectorAll('.section[data-section]');
        const navLinks = document.querySelectorAll('.nav-link');

        sections.forEach((section, i) => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => updateNav(i),
                onEnterBack: () => updateNav(i),
            });
        });

        function updateNav(index) {
            state.currentSection = index;
            navLinks.forEach((link, i) => {
                link.classList.toggle('active', i === index - 1);
            });
        }

        // ── Parallax Cards on Scroll ──
        document.querySelectorAll('.problem-card, .tech-card, .mvp-card, .cta-card').forEach((card) => {
            gsap.to(card, {
                y: -20,
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 2,
                },
            });
        });
    }

    // ══════════════════════════════════════════════════
    // 4. PRELOADER
    // ══════════════════════════════════════════════════

    function initPreloader() {
        const preloader = document.getElementById('preloader');
        const counter = preloader.querySelector('.preloader-counter');
        const line = preloader.querySelector('.preloader-line');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 12 + 3;
            if (progress > 100) progress = 100;

            counter.textContent = Math.round(progress) + '%';
            line.querySelector('::after') || null;
            line.style.setProperty('--progress', progress + '%');
            // Update the pseudo-element via a CSS custom property
            line.style.cssText = `--p: ${progress}%`;

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    gsap.to(preloader, {
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            preloader.style.display = 'none';
                            state.isLoaded = true;
                            document.getElementById('main-nav').classList.add('visible');
                            initAnimations();
                        },
                    });
                }, 300);
            }
        }, 60);
    }

    // ══════════════════════════════════════════════════
    // 5. MOUSE TRACKING
    // ══════════════════════════════════════════════════

    function initMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            state.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
            state.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Card tilt effect
        document.querySelectorAll('.problem-card, .tech-card, .mvp-card, .cta-card').forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(card, {
                    rotateY: x * 5,
                    rotateX: -y * 5,
                    duration: 0.5,
                    ease: 'power2.out',
                    transformPerspective: 800,
                });

                // Move glow
                const glow = card.querySelector('.card-glow');
                if (glow) {
                    gsap.to(glow, {
                        x: x * 80,
                        y: y * 80,
                        duration: 0.6,
                        ease: 'power2.out',
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.6,
                    ease: 'power3.out',
                });
            });
        });
    }

    // ══════════════════════════════════════════════════
    // 6. NAV SMOOTH SCROLL
    // ══════════════════════════════════════════════════

    function initNavigation() {
        document.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target && lenis) {
                    lenis.scrollTo(target, { offset: -80, duration: 2 });
                }
            });
        });
    }

    // ══════════════════════════════════════════════════
    // 7. INITIAL SETUP
    // ══════════════════════════════════════════════════

    function initInitialStates() {
        // Section indices start hidden
        gsap.set('.section-index', { opacity: 0, x: -20 });
        // Title lines hidden
        gsap.set('.title-line span', { y: '110%' });
        // Hero elements
        gsap.set('.hero-tag', { opacity: 0, y: 20 });
        gsap.set('.hero-subtitle', { opacity: 0, y: 20 });
        gsap.set('.hero-stats', { opacity: 0, y: 20 });
        // CTA elements
        gsap.set('.cta-desc', { opacity: 0, y: 20 });
        gsap.set('.cta-footer', { opacity: 0 });
    }

    // ══════════════════════════════════════════════════
    // BOOT
    // ══════════════════════════════════════════════════

    document.addEventListener('DOMContentLoaded', () => {
        initInitialStates();
        initWebGL();
        initLenis();
        initMouseTracking();
        initNavigation();
        initPreloader();
    });

})();
