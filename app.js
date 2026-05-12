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
    }

    // --- Boot ---
    document.addEventListener('DOMContentLoaded', () => {
        initLenis();
        initAnimations();
    });

})();
