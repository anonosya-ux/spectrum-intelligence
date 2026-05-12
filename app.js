/* SPECTRUM v5 — WebGL Slide Transition Engine */
(function() {
    'use strict';

    // Slide images from "Изображение 1.jpg" to "Изображение 16.jpg"
    const NUM_SLIDES = 16;
    const images = [];
    for (let i = 1; i <= NUM_SLIDES; i++) {
        images.push(`Изображение ${i}.jpg`);
    }

    const state = {
        progress: 0,
        scroll: 0,
        currentIndex: 0,
        targetProgress: 0
    };

    let lenis;
    let scene, camera, renderer, material;
    let textures = [];
    let loadedCount = 0;

    // --- 1. Init Lenis Smooth Scroll ---
    function initLenis() {
        lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true
        });

        lenis.on('scroll', ({ progress }) => {
            state.targetProgress = progress; // 0 to 1
        });

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    // --- 2. Preloader ---
    function updatePreloader(pct) {
        document.querySelector('.pl-fill').style.width = pct + '%';
        document.querySelector('.pl-pct').textContent = pct + '%';
        if (pct >= 100) {
            setTimeout(() => {
                gsap.to('#preloader', {
                    opacity: 0,
                    duration: 1,
                    onComplete: () => {
                        document.getElementById('preloader').style.display = 'none';
                        document.getElementById('ui').classList.add('visible');
                    }
                });
            }, 500);
        }
    }

    // --- 3. Load Textures ---
    function loadTextures() {
        const manager = new THREE.LoadingManager();
        manager.onProgress = function (url, itemsLoaded, itemsTotal) {
            updatePreloader(Math.floor((itemsLoaded / itemsTotal) * 100));
        };
        
        const loader = new THREE.TextureLoader(manager);
        
        // Setup proxy height
        const proxy = document.getElementById('scroll-proxy');
        proxy.style.height = `${NUM_SLIDES * 100}vh`;

        images.forEach((img, index) => {
            loader.load(img, (tex) => {
                tex.generateMipmaps = true;
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                textures[index] = tex;
                
                loadedCount++;
                if (loadedCount === NUM_SLIDES) {
                    initWebGL();
                }
            });
        });
    }

    // --- 4. WebGL Setup ---
    function initWebGL() {
        const canvas = document.getElementById('webgl-canvas');
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `;

        // Advanced Displacement Shader with Noise
        const fragmentShader = `
            varying vec2 vUv;
            uniform sampler2D tex1;
            uniform sampler2D tex2;
            uniform float dispFactor;
            uniform vec2 resolution;
            uniform vec2 imageResolution;
            uniform float time;

            // Simplex 2D noise
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v){
                const vec4 C = vec4(0.211324865, 0.366025403, -0.577350269, 0.024390243);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a*a + h*h );
                vec3 g;
                g.x  = a.x  * x0.x  + h.x  * x0.y;
                g.yz = a.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            vec2 getCoverUv(vec2 uv, vec2 res, vec2 texRes) {
                vec2 s = res;
                vec2 i = texRes;
                float rs = s.x / s.y;
                float ri = i.x / i.y;
                vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
                vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
                return uv * s / new + offset;
            }

            void main() {
                // Background cover UVs
                vec2 uv = getCoverUv(vUv, resolution, imageResolution);

                // Add slight pan effect based on mouse or time (static here for clean look)
                // uv.y += sin(time * 0.1) * 0.01;

                // Noise displacement
                float n = snoise(uv * 10.0 + time * 0.5);
                
                // Transition effect: dissolve + displace
                float d = dispFactor;
                
                vec2 uv1 = uv + vec2(n * d * 0.1, 0.0);
                vec2 uv2 = uv - vec2(n * (1.0 - d) * 0.1, 0.0);

                vec4 _tex1 = texture2D(tex1, uv1);
                vec4 _tex2 = texture2D(tex2, uv2);

                // Mix using noise mask to create a "burn" or "dissolve" edge
                float edge = smoothstep(0.0, 1.0, d + n * 0.2 * sin(d * 3.1415));
                vec4 color = mix(_tex1, _tex2, clamp(edge, 0.0, 1.0));

                gl_FragColor = color;
            }
        `;

        // Assuming images are 16:9 (1920x1080)
        const imgAspect = new THREE.Vector2(1920, 1080);

        material = new THREE.ShaderMaterial({
            uniforms: {
                tex1: { value: textures[0] },
                tex2: { value: textures[1] || textures[0] },
                dispFactor: { value: 0.0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                imageResolution: { value: imgAspect },
                time: { value: 0 }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        window.addEventListener('resize', onWindowResize, false);
        
        render();
    }

    function onWindowResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }

    // --- 5. Render Loop ---
    let time = 0;
    function render() {
        requestAnimationFrame(render);
        time += 0.016;

        // Smoothly interpolate scroll progress
        state.progress += (state.targetProgress - state.progress) * 0.1;

        if (material) {
            material.uniforms.time.value = time;

            // Map progress to slides
            // progress is 0 to 1 over the whole proxy height
            const maxIndex = NUM_SLIDES - 1;
            const absoluteProgress = state.progress * maxIndex;
            
            let index1 = Math.floor(absoluteProgress);
            let index2 = index1 + 1;
            
            if (index2 > maxIndex) {
                index2 = maxIndex;
                index1 = maxIndex - 1;
                if (index1 < 0) index1 = 0;
            }

            const localProgress = absoluteProgress - index1;

            material.uniforms.tex1.value = textures[index1];
            material.uniforms.tex2.value = textures[index2];
            material.uniforms.dispFactor.value = localProgress;

            // Update UI
            if (state.currentIndex !== index1) {
                state.currentIndex = index1;
                const displayIdx = Math.min(index1 + (localProgress > 0.5 ? 2 : 1), NUM_SLIDES);
                document.getElementById('curr-slide').textContent = displayIdx.toString().padStart(2, '0');
            }
            
            document.getElementById('progress-bar').style.height = `${(state.progress * 100)}%`;

            renderer.render(scene, camera);
        }
    }

    // --- Boot ---
    document.addEventListener('DOMContentLoaded', () => {
        initLenis();
        loadTextures();
    });

})();
