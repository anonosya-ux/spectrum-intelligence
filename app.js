/* SPECTRUM v7 — Native Slide Aesthetic Engine */
(function() {
    'use strict';

    // --- 1. Lenis Smooth Scroll ---
    let lenis;
    function initLenis() {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // --- 2. GSAP Animations ---
    function initAnimations() {
        gsap.registerPlugin(ScrollTrigger);

        // --- 1. AWWWARDS TYPOGRAPHY (SPLIT TEXT) ---
        const splitText = (selector) => {
            document.querySelectorAll(selector).forEach(el => {
                const text = el.innerText;
                el.innerHTML = '';
                let html = '';
                for (let i = 0; i < text.length; i++) {
                    const char = text[i] === ' ' ? '&nbsp;' : text[i];
                    html += `<span class="char-wrapper"><span class="char-inner">${char}</span></span>`;
                }
                el.innerHTML = html;
            });
        };
        splitText('.title-main');

        // Cinematic Typography Animation
        document.querySelectorAll('.title-main').forEach(title => {
            const chars = title.querySelectorAll('.char-inner');
            gsap.to(chars, {
                scrollTrigger: { trigger: title, start: "top 85%" },
                y: "0%", duration: 1, ease: "expo.out", stagger: 0.02
            });
        });

        // --- 2. SCROLL VELOCITY SKEW ---
        let proxy = { skew: 0 },
            skewSetter = gsap.quickSetter(".card, .flow-node, .rag-node", "skewY", "deg"),
            clamp = gsap.utils.clamp(-15, 15);

        ScrollTrigger.create({
            onUpdate: (self) => {
                let skew = clamp(self.getVelocity() / -100);
                if (Math.abs(skew) > Math.abs(proxy.skew)) {
                    proxy.skew = skew;
                    gsap.to(proxy, { skew: 0, duration: 0.8, ease: "power3", overwrite: true, onUpdate: () => skewSetter(proxy.skew) });
                }
            }
        });
        
        // --- 3. CANVAS PARTICLE NETWORK (WEBGL VIBE) ---
        const canvas = document.getElementById('webgl-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let w, h;
            const particles = [];
            const mouse = { x: -1000, y: -1000 };

            const resize = () => {
                w = canvas.width = window.innerWidth;
                h = canvas.height = window.innerHeight;
            };
            window.addEventListener('resize', resize);
            resize();

            document.addEventListener('mousemove', (e) => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            });

            class Particle {
                constructor() {
                    this.x = Math.random() * w;
                    this.y = Math.random() * h;
                    this.vx = (Math.random() - 0.5) * 0.5;
                    this.vy = (Math.random() - 0.5) * 0.5;
                    this.size = Math.random() * 2 + 0.5;
                }
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    if (this.x < 0 || this.x > w) this.vx *= -1;
                    if (this.y < 0 || this.y > h) this.vy *= -1;
                }
                draw() {
                    ctx.fillStyle = 'rgba(229, 9, 20, 0.4)';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            for (let i = 0; i < 60; i++) particles.push(new Particle());

            const animate = () => {
                ctx.clearRect(0, 0, w, h);
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update();
                    particles[i].draw();
                    
                    // Connect particles
                    for (let j = i; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < 150) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(229, 9, 20, ${0.15 - dist/1000})`;
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                    
                    // Connect to mouse
                    const dxm = particles[i].x - mouse.x;
                    const dym = particles[i].y - mouse.y;
                    const distm = Math.sqrt(dxm*dxm + dym*dym);
                    if (distm < 200) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 107, 0, ${0.3 - distm/800})`;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
                requestAnimationFrame(animate);
            };
            animate();
        }

        // --- 4. ADVANCED PARALLAX & AMBIENT LIGHT ---
        document.querySelectorAll('.f-icon, .red-circle, .rag-node').forEach(el => {
            gsap.to(el, { yPercent: -20, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 } });
        });

        document.querySelectorAll('.bg-parallax-text').forEach(el => {
            const speed = el.getAttribute('data-speed') || 1;
            gsap.to(el, { xPercent: 50 * speed, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 1 } });
        });

        const orb1 = document.querySelector('.orb-1');
        const orb2 = document.querySelector('.orb-2');
        if (orb1 && orb2) {
            document.addEventListener('mousemove', (e) => {
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;
                gsap.to(orb1, { x: x * 100, y: y * 100, duration: 2, ease: "power2.out" });
                gsap.to(orb2, { x: -x * 100, y: -y * 100, duration: 2.5, ease: "power2.out" });
            });
        }

        // --- 5. ORGANIC ENTRANCES ---
        gsap.utils.toArray('.sl-c').forEach(section => {
            gsap.fromTo(section, 
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: section, start: "top 85%" } }
            );
        });

        // SCROLLYTELLING: TELEGRAM TO 1C (iPhone slide)
        const tgSlide = document.getElementById('sl-telegram-1c');
        if (tgSlide) {
            ScrollTrigger.create({
                trigger: tgSlide,
                start: "top top",
                end: "+=1500",
                pin: true,
                animation: gsap.timeline()
                    .fromTo('.iphone-mockup', { x: -100, opacity: 0, rotateY: 20 }, { x: 0, opacity: 1, rotateY: 0, duration: 1 })
                    .fromTo('.tg-msg.photo', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out" })
                    .fromTo('.tg-msg.out', { opacity: 0 }, { opacity: 1, duration: 0.5 }, "+=0.5")
                    .fromTo(tgSlide.querySelectorAll('.flow-arrow'), { opacity: 0, width: 0 }, { opacity: 1, width: 60, duration: 0.5, stagger: 0.2 })
                    .fromTo(tgSlide.querySelectorAll('.rag-node.orange-outline'), { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.2 }, "<"),
                scrub: 1
            });
        }

        // SLIDE 1: FOT Waterfall & Counter
        const waterfall = document.getElementById('fot-waterfall');
        if (waterfall) {
            // Generate 12 bars
            const barHeights = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];
            barHeights.forEach(h => {
                const b = document.createElement('div');
                b.className = 'bar';
                b.style.height = `${h}px`;
                waterfall.appendChild(b);
            });

            const bars = waterfall.querySelectorAll('.bar');
            
            ScrollTrigger.create({
                trigger: '#sl-fot',
                start: 'top center',
                onEnter: () => {
                    // Animate bars cascading
                    gsap.to(bars, {
                        scaleY: 1,
                        duration: 0.5,
                        stagger: 0.05,
                        ease: "back.out(1.7)"
                    });
                    
                    // Animate 18M counter
                    const counter = { val: 0 };
                    gsap.to(counter, {
                        val: 18000000,
                        duration: 2,
                        ease: "power2.out",
                        onUpdate: () => {
                            document.getElementById('fot-counter').textContent = 
                                Math.floor(counter.val).toLocaleString('ru-RU');
                        }
                    });

                    // Strike line animation
                    gsap.to('.strike-line', {
                        scaleX: 1,
                        duration: 0.8,
                        delay: 1,
                        ease: "power2.out"
                    });
                }
            });
        }

        // SLIDE 2: Warnings & LED Clock
        ScrollTrigger.create({
            trigger: '#sl-pto',
            start: 'top 60%',
            onEnter: () => {
                gsap.to('.warn-item', {
                    opacity: 1,
                    x: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: "power2.out"
                });
                
                // Blink LED
                gsap.fromTo('.led-text', 
                    { opacity: 0.5 }, 
                    { opacity: 1, duration: 0.1, repeat: 5, yoyo: true }
                );
            }
        });

        // SLIDE 3: Flowchart Arrows
        ScrollTrigger.create({
            trigger: '#sl-collision',
            start: 'top 50%',
            onEnter: () => {
                const nodes = gsap.utils.toArray('.flow-node');
                const arrows = gsap.utils.toArray('.flow-arrow');
                
                const tl = gsap.timeline();
                
                for(let i=0; i<nodes.length; i++) {
                    tl.to(nodes[i], { opacity: 1, duration: 0.4 }, `+=${i===0?0:0.2}`);
                    if (arrows[i]) {
                        tl.to(arrows[i], { opacity: 1, duration: 0.2 });
                    }
                }
                
                // Shake fatal block
                tl.to('.fatal', { x: -5, duration: 0.05, repeat: 5, yoyo: true });
            }
        });

        // SLIDE 6 & 7: RAG Pipeline Animation
        const pipelines = gsap.utils.toArray('.rag-pipeline');
        pipelines.forEach(pipe => {
            ScrollTrigger.create({
                trigger: pipe,
                start: 'top 70%',
                onEnter: () => {
                    const nodes = pipe.querySelectorAll('.rag-node, .cloud-node');
                    const arrows = pipe.querySelectorAll('.flow-arrow');
                    const tl = gsap.timeline();
                    
                    gsap.set(nodes, { opacity: 0, y: 20 });
                    gsap.set(arrows, { opacity: 0 });
                    
                    nodes.forEach((node, i) => {
                        tl.to(node, { opacity: 1, y: 0, duration: 0.4 }, `+=${i===0?0:0.1}`);
                        if (arrows[i]) {
                            tl.to(arrows[i], { opacity: 1, duration: 0.2 });
                        }
                    });
                }
            });
        });

        // SLIDE 9: Counters
        ScrollTrigger.create({
            trigger: '#sl-docflow',
            start: 'top 70%',
            onEnter: () => {
                const c370 = { val: 0 };
                gsap.to(c370, {
                    val: 370, duration: 2, ease: "power2.out",
                    onUpdate: () => document.querySelector('.counter-370').textContent = `-${Math.floor(c370.val)}`
                });
                
                const c85 = { val: 0 };
                gsap.to(c85, {
                    val: 85, duration: 2, ease: "power2.out", delay: 0.5,
                    onUpdate: () => document.querySelector('.counter-85').textContent = `+${Math.floor(c85.val)}%`
                });
            }
        });

        // SLIDE 11: Bar Chart
        ScrollTrigger.create({
            trigger: '#sl-vision',
            start: 'top 60%',
            onEnter: () => {
                const fills = document.querySelectorAll('.bc-fill');
                fills.forEach(f => {
                    gsap.to(f, { width: f.getAttribute('data-w'), duration: 1.5, ease: "power3.out" });
                });
            }
        });

        // SLIDE 12: Jaro-Winkler
        ScrollTrigger.create({
            trigger: '#sl-jaro',
            start: 'top 60%',
            onEnter: () => {
                gsap.to('#jaro-thumb', { left: '92%', duration: 2, ease: "elastic.out(1, 0.7)" });
            }
        });

        // SLIDE 13: UI Tasks checkmarks
        ScrollTrigger.create({
            trigger: '#sl-tasks',
            start: 'top 60%',
            onEnter: () => {
                gsap.to('.check-mark-anim', {
                    scale: 1, duration: 0.5, stagger: 0.5, ease: "back.out(1.7)"
                });
            }
        });

        // SLIDE 14: Roadmap
        ScrollTrigger.create({
            trigger: '#sl-roadmap',
            start: 'top 60%',
            onEnter: () => {
                const tl = gsap.timeline();
                tl.to('.tl-fill', { width: '100%', duration: 2, ease: "power1.inOut" });
                const points = document.querySelectorAll('.tl-point');
                points.forEach((p, i) => {
                    tl.to(p, { backgroundColor: '#F59E0B', duration: 0.2 }, `-=${2 - (i * 0.8)}`);
                });
            }
        });

        // SLIDE 15: SCROLLYTELLING A* PATH
        const pathLine = document.getElementById('path-line');
        if (pathLine) {
            const length = pathLine.getTotalLength();
            gsap.set(pathLine, { strokeDasharray: length, strokeDashoffset: length });
            
            ScrollTrigger.create({
                trigger: '#sl-1hectare',
                start: 'top top',
                end: '+=1500',
                pin: true,
                animation: gsap.timeline()
                    .to('.obst', { scale: 1, opacity: 1, duration: 1, stagger: 0.1, ease: "back.out" })
                    .to(pathLine, { strokeDashoffset: 0, duration: 2, ease: "none" }),
                scrub: 1
            });
        }
    }

    // --- Boot ---
    document.addEventListener('DOMContentLoaded', () => {
        initLenis();
        initAnimations();
    });

})();
