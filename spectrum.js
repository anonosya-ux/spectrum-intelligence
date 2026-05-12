/* SPECTRUM v3 — CINEMATIC ENGINE (Awwwards Edition) */
(function(){
'use strict';
gsap.registerPlugin(ScrollTrigger);

// 0. CUSTOM CURSOR
const cursorEl=document.createElement('div');cursorEl.className='cursor';document.body.appendChild(cursorEl);
const dotEl=document.createElement('div');dotEl.className='cursor-dot';document.body.appendChild(dotEl);
document.addEventListener('mousemove',e=>{
  gsap.to(cursorEl,{x:e.clientX,y:e.clientY,duration:.5,ease:'power2.out'});
  gsap.to(dotEl,{x:e.clientX,y:e.clientY,duration:.1});
});

// 1. LENIS SMOOTH SCROLL
const lenis = new Lenis({ duration:1.4, easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t=>lenis.raf(t*1000));
gsap.ticker.lagSmoothing(0);

// 2. SPLIT TEXT — CINEMATIC TYPOGRAPHY
document.querySelectorAll('.mega-title').forEach(el=>{
  const text=el.innerHTML;
  const words=text.split(/(<br\s*\/?>)/gi);
  let html='';
  words.forEach(w=>{
    if(w.match(/<br\s*\/?>/i)){html+=w;return;}
    // handle spans with classes
    const spanMatch=w.match(/^(<span[^>]*>)(.*?)(<\/span>)$/);
    if(spanMatch){
      html+=spanMatch[1];
      for(let c of spanMatch[2]){
        html+=c===' '?'&nbsp;':`<span class="char-wrap"><span>${c}</span></span>`;
      }
      html+=spanMatch[3];
    } else {
      for(let c of w){
        html+=c===' '?'&nbsp;':`<span class="char-wrap"><span>${c}</span></span>`;
      }
    }
  });
  el.innerHTML=html;
});

// Animate chars on scroll with 3D rotation
document.querySelectorAll('.mega-title').forEach(title=>{
  const chars=title.querySelectorAll('.char-wrap span');
  if(!chars.length) return;
  gsap.to(chars,{
    scrollTrigger:{trigger:title,start:'top 85%'},
    y:'0%',rotateX:0,duration:1,ease:'expo.out',stagger:0.02
  });
});

// 3. SCROLL VELOCITY SKEW
let proxy={skew:0};
const skewTargets='.metric-card,.step-card,.rag-card,.err-node,.arch-node,.track,.metric-box,.jaro-card';
const skewSetter=gsap.quickSetter(skewTargets,'skewY','deg');
const clamp=gsap.utils.clamp(-8,8);
ScrollTrigger.create({
  onUpdate:self=>{
    let skew=clamp(self.getVelocity()/-150);
    if(Math.abs(skew)>Math.abs(proxy.skew)){
      proxy.skew=skew;
      gsap.to(proxy,{skew:0,duration:0.8,ease:'power3',overwrite:true,onUpdate:()=>skewSetter(proxy.skew)});
    }
  }
});

// 4. CANVAS PARTICLES
const canvas=document.getElementById('particles');
if(canvas){
  const ctx=canvas.getContext('2d');
  let w,h;
  const pts=[];
  const mouse={x:-1e3,y:-1e3};
  const resize=()=>{w=canvas.width=innerWidth;h=canvas.height=innerHeight;};
  addEventListener('resize',resize);resize();
  addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  class P{
    constructor(){this.x=Math.random()*w;this.y=Math.random()*h;this.vx=(Math.random()-.5)*.4;this.vy=(Math.random()-.5)*.4;this.r=Math.random()*1.5+.5;}
    update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>w)this.vx*=-1;if(this.y<0||this.y>h)this.vy*=-1;}
    draw(){ctx.fillStyle='rgba(229,9,20,.3)';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();}
  }
  for(let i=0;i<50;i++)pts.push(new P());
  (function loop(){
    ctx.clearRect(0,0,w,h);
    for(let i=0;i<pts.length;i++){
      pts[i].update();pts[i].draw();
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<140){ctx.strokeStyle=`rgba(229,9,20,${.12-d/1200})`;ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}
      }
      const dx=pts[i].x-mouse.x,dy=pts[i].y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<180){ctx.strokeStyle=`rgba(255,107,0,${.25-d/800})`;ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke();}
    }
    requestAnimationFrame(loop);
  })();
}

// 5. AMBIENT ORB MOUSE TRACKING
const o1=document.querySelector('.orb-1'),o2=document.querySelector('.orb-2');
if(o1&&o2){
  addEventListener('mousemove',e=>{
    const x=e.clientX/innerWidth,y=e.clientY/innerHeight;
    gsap.to(o1,{x:x*80,y:y*80,duration:2.5,ease:'power2.out'});
    gsap.to(o2,{x:-x*60,y:-y*60,duration:3,ease:'power2.out'});
  });
}

// 6. ORGANIC ENTRANCES
gsap.utils.toArray('.slide-inner').forEach(el=>{
  gsap.fromTo(el,{y:80,opacity:0},{y:0,opacity:1,duration:1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 85%'}});
});

// 7. PARALLAX IMAGES
gsap.utils.toArray('.parallax-img').forEach(img=>{
  gsap.to(img,{yPercent:-15,ease:'none',scrollTrigger:{trigger:img,start:'top bottom',end:'bottom top',scrub:.5}});
});

// 7b. 3D TILT ON HOVER (images)
document.querySelectorAll('.iphone-img, .slide-img').forEach(img=>{
  img.addEventListener('mousemove',e=>{
    const rect=img.getBoundingClientRect();
    const x=(e.clientX-rect.left)/rect.width-.5;
    const y=(e.clientY-rect.top)/rect.height-.5;
    gsap.to(img,{rotateY:x*15,rotateX:-y*15,duration:.4,ease:'power2.out'});
  });
  img.addEventListener('mouseleave',()=>{
    gsap.to(img,{rotateY:0,rotateX:0,duration:.6,ease:'elastic.out(1,.5)'});
  });
});

// === SCROLLYTELLING PINS ===

// PIN: S2 PARADIGM SHIFT — chaos transforms to order
const s2=document.getElementById('s2');
if(s2){
  const chaos=s2.querySelector('.chaos');
  const order=s2.querySelector('.order');
  if(chaos&&order){
    gsap.set(order,{opacity:0,x:100});
    ScrollTrigger.create({
      trigger:s2,start:'top top',end:'+=1200',pin:true,scrub:1,
      animation:gsap.timeline()
        .to(chaos,{x:-50,opacity:.3,scale:.95,duration:1})
        .to(order,{opacity:1,x:0,duration:1},'<0.3')
    });
  }
}

// PIN: S5 ERROR CASCADE — nodes drop in one by one
const s5=document.getElementById('s5');
if(s5){
  const nodes=s5.querySelectorAll('.err-node');
  const arrows=s5.querySelectorAll('.err-arrow');
  gsap.set([...nodes,...arrows],{opacity:0,y:40});
  ScrollTrigger.create({
    trigger:s5,start:'top top',end:'+=1500',pin:true,scrub:1,
    animation:gsap.timeline()
      .to(nodes[0],{opacity:1,y:0,duration:.3})
      .to(arrows[0],{opacity:1,y:0,duration:.2})
      .to(nodes[1],{opacity:1,y:0,duration:.3})
      .to(arrows[1],{opacity:1,y:0,duration:.2})
      .to(nodes[2],{opacity:1,y:0,duration:.3})
      .to(nodes[3],{opacity:1,y:0,duration:.3},'<')
      .to(arrows[2],{opacity:1,y:0,duration:.2},'<')
      .to(nodes[4],{opacity:1,y:0,duration:.3})
      .to(arrows[3],{opacity:1,y:0,duration:.2})
      .to(nodes[5],{opacity:1,y:0,duration:.3})
      .to('.err-fatal',{x:-6,duration:.04,repeat:8,yoyo:true})
  });
}

// PIN: S11 GANTT — 365 bar grows, then 7-day bar appears
const s11=document.getElementById('s11');
if(s11){
  const redBar=s11.querySelector('.gantt-red');
  const blueBar=s11.querySelector('.gantt-blue');
  if(redBar&&blueBar){
    ScrollTrigger.create({
      trigger:s11,start:'top top',end:'+=1200',pin:true,scrub:1,
      animation:gsap.timeline()
        .to(redBar,{width:'100%',duration:2})
        .to(blueBar,{width:'2%',duration:1},'+=0.3')
    });
  }
}

// PIN: S12 iPhone MVP — phone slides in from left
const s12=document.getElementById('s12');
if(s12){
  const phone=s12.querySelector('.iphone-img');
  const table=s12.querySelector('.sku-table');
  if(phone){
    gsap.set(phone,{x:-200,opacity:0,rotateY:30});
    if(table) gsap.set(table,{opacity:0,x:100});
    ScrollTrigger.create({
      trigger:s12,start:'top top',end:'+=1500',pin:true,scrub:1,
      animation:gsap.timeline()
        .to(phone,{x:0,opacity:1,rotateY:0,duration:1.5})
        .to(table,{opacity:1,x:0,duration:1},'<0.5')
    });
  }
}

// PIN: S10 APS Layers — stack up
const s10=document.getElementById('s10');
if(s10){
  const layers=s10.querySelectorAll('.aps-layer');
  gsap.set(layers,{opacity:0,y:80,rotateX:40});
  ScrollTrigger.create({
    trigger:s10,start:'top top',end:'+=1200',pin:true,scrub:1,
    animation:gsap.timeline()
      .to(layers[2],{opacity:1,y:0,rotateX:15,duration:1})
      .to(layers[1],{opacity:1,y:0,rotateX:15,duration:1},'+=0.2')
      .to(layers[0],{opacity:1,y:0,rotateX:15,duration:1},'+=0.2')
  });
}

// 8. COUNTERS
document.querySelectorAll('.counter').forEach(el=>{
  const target=+el.dataset.target;
  const prefix=el.dataset.prefix||'';
  ScrollTrigger.create({
    trigger:el,start:'top 80%',once:true,
    onEnter:()=>{
      const obj={v:0};
      gsap.to(obj,{v:target,duration:2,ease:'power2.out',
        onUpdate:()=>{el.textContent=prefix+Math.floor(obj.v).toLocaleString('ru-RU');}
      });
    }
  });
});

// 9. BAR FILLS
document.querySelectorAll('.bar-fill,.bc-fill').forEach(bar=>{
  const w=bar.dataset.w||bar.dataset.width;
  if(!w)return;
  ScrollTrigger.create({
    trigger:bar,start:'top 85%',once:true,
    onEnter:()=>{bar.style.width=w;}
  });
});

// 10. GANTT BARS
document.querySelectorAll('.gantt-bar').forEach(bar=>{
  const w=bar.dataset.width;
  ScrollTrigger.create({
    trigger:bar,start:'top 85%',once:true,
    onEnter:()=>{gsap.to(bar,{width:w,duration:1.5,ease:'power3.out'});}
  });
});

// 11. ARBITRAGE BARS
document.querySelectorAll('.arb-bar').forEach(bar=>{
  const w=bar.dataset.width;
  ScrollTrigger.create({
    trigger:bar,start:'top 85%',once:true,
    onEnter:()=>{gsap.to(bar,{width:w,duration:1.5,ease:'power3.out'});}
  });
});

// 12. JARO-WINKLER ANIMATION
const jThumb=document.getElementById('jaro-thumb');
const jScore=document.getElementById('jaro-score');
if(jThumb){
  ScrollTrigger.create({
    trigger:jThumb,start:'top 80%',once:true,
    onEnter:()=>{
      gsap.to(jThumb,{left:'92%',duration:2.5,ease:'elastic.out(1,0.7)'});
      const obj={v:0};
      gsap.to(obj,{v:92,duration:2,ease:'power2.out',onUpdate:()=>{jScore.textContent=Math.floor(obj.v)+'%';}});
    }
  });
}

// 13. ROI CURVE DRAW — PINNED
const roiCurve=document.getElementById('roi-curve');
if(roiCurve){
  const len=roiCurve.getTotalLength();
  gsap.set(roiCurve,{strokeDasharray:len,strokeDashoffset:len});
  ScrollTrigger.create({
    trigger:'#s21',start:'top top',end:'+=1000',pin:true,scrub:1,
    animation:gsap.timeline().to(roiCurve,{strokeDashoffset:0,duration:2})
  });
}

// 14. STAGGERED CARD ENTRANCES
['#s8 .step-card','#s9 .rag-card','#s17 .metric-box','#s19 .t-step'].forEach(sel=>{
  const els=document.querySelectorAll(sel);
  if(!els.length) return;
  gsap.set(els,{opacity:0,y:60,scale:.95});
  ScrollTrigger.create({
    trigger:els[0].parentElement,start:'top 75%',once:true,
    onEnter:()=>gsap.to(els,{opacity:1,y:0,scale:1,duration:.8,stagger:.15,ease:'expo.out'})
  });
});

// 15. ARCHITECTURE DIAGRAM SEQUENTIAL REVEAL
const archNodes=document.querySelectorAll('#s6 .arch-node, #s6 .arch-core, #s6 .arch-arrow, #s6 .arch-arrow-down');
if(archNodes.length){
  gsap.set(archNodes,{opacity:0,scale:.8});
  ScrollTrigger.create({
    trigger:'#s6',start:'top 60%',once:true,
    onEnter:()=>gsap.to(archNodes,{opacity:1,scale:1,duration:.6,stagger:.12,ease:'back.out(1.4)'})
  });
}

})();
