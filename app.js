/* SPECTRUM v6 — Sticky Stacking Cards Engine */
(function() {
    'use strict';

    // --- 1. Lenis Smooth Scroll ---
    let lenis;
    function initLenis() {
        lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    // --- 2. GSAP Stacking Cards Animation ---
    function initStackingCards() {
        gsap.registerPlugin(ScrollTrigger);

        const cards = gsap.utils.toArray('.card');
        
        cards.forEach((card, i) => {
            // We animate the current card as the NEXT card approaches
            // The last card doesn't scale down
            if (i < cards.length - 1) {
                gsap.to(card, {
                    scale: 0.94, // Shrink slightly to create depth
                    filter: 'brightness(0.3)', // Darken it as it goes to the background
                    scrollTrigger: {
                        trigger: cards[i + 1], // Triggered when the NEXT card comes up
                        start: "top bottom", // When next card's top hits bottom of screen
                        end: "top top", // When next card hits top of screen
                        scrub: true, // Smooth scrub
                        invalidateOnRefresh: true
                    }
                });
            }
        });
        
        // Hero Parallax
        gsap.to('.hero-content', {
            y: -150,
            opacity: 0,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // --- 3. Subtle WebGL Background ---
    function initWebGL() {
        const c = document.getElementById('bg-canvas');
        if (!c) return;
        const r = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: false });
        r.setSize(innerWidth, innerHeight);
        r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        
        const sc = new THREE.Scene();
        const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        const m = new THREE.ShaderMaterial({
            uniforms: {
                uT: { value: 0 },
                uR: { value: new THREE.Vector2(innerWidth, innerHeight) }
            },
            vertexShader: `varying vec2 v; void main(){ v=uv; gl_Position=vec4(position,1.); }`,
            fragmentShader: `
                precision highp float;
                uniform float uT;
                uniform vec2 uR;
                varying vec2 v;
                void main() {
                    vec2 u = v * 2.0 - 1.0;
                    u.x *= uR.x / uR.y;
                    float n = fract(sin(dot(u + uT * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
                    float glow = exp(-length(u) * 1.5);
                    vec3 col = mix(vec3(0.02, 0.02, 0.04), vec3(0.0, 0.1, 0.4), glow * 0.3);
                    col += n * 0.03; // film grain
                    gl_FragColor = vec4(col, 1.0);
                }
            `
        });
        
        sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m));
        
        let t = 0;
        (function lp() {
            requestAnimationFrame(lp);
            t += 0.016;
            m.uniforms.uT.value = t;
            r.render(sc, cam);
        })();
        
        window.addEventListener('resize', () => {
            r.setSize(innerWidth, innerHeight);
            m.uniforms.uR.value.set(innerWidth, innerHeight);
        });
    }

    // --- Boot ---
    document.addEventListener('DOMContentLoaded', () => {
        initLenis();
        initStackingCards();
        initWebGL();
    });

})();
