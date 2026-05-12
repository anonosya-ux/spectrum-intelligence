/* SPECTRUM v5 ENGINE */
(function(){
'use strict';
gsap.registerPlugin(ScrollTrigger);

// CURSOR
const cur=document.createElement('div');cur.className='cur';document.body.appendChild(cur);
const dot=document.createElement('div');dot.className='dot';document.body.appendChild(dot);
addEventListener('mousemove',e=>{
  gsap.to(cur,{x:e.clientX,y:e.clientY,duration:.5,ease:'power2.out'});
  gsap.to(dot,{x:e.clientX,y:e.clientY,duration:.08});
});

// LENIS
const lenis=new Lenis({duration:1.4,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
lenis.on('scroll',ScrollTrigger.update);
gsap.ticker.add(t=>lenis.raf(t*1000));
gsap.ticker.lagSmoothing(0);

// PARTICLES
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let W,H;const pts=[];const ms={x:-1e3,y:-1e3};
const re=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};addEventListener('resize',re);re();
addEventListener('mousemove',e=>{ms.x=e.clientX;ms.y=e.clientY});
for(let i=0;i<70;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.5+.5});
(function loop(){
  ctx.clearRect(0,0,W,H);
  pts.forEach((p,i)=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
    ctx.fillStyle='rgba(229,9,20,.2)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.28);ctx.fill();
    for(let j=i+1;j<pts.length;j++){const d=Math.hypot(p.x-pts[j].x,p.y-pts[j].y);if(d<120){ctx.strokeStyle=`rgba(229,9,20,${.08-d/1600})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}}
    const dm=Math.hypot(p.x-ms.x,p.y-ms.y);if(dm<160){ctx.strokeStyle=`rgba(255,107,0,${.15-dm/1100})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(ms.x,ms.y);ctx.stroke();}
  });
  requestAnimationFrame(loop);
})();

// ORB TRACKING
const o1=document.querySelector('.o1'),o2=document.querySelector('.o2'),o3=document.querySelector('.o3');
addEventListener('mousemove',e=>{
  const x=e.clientX/innerWidth,y=e.clientY/innerHeight;
  gsap.to(o1,{x:x*100,y:y*100,duration:3,ease:'power2.out'});
  gsap.to(o2,{x:-x*80,y:-y*80,duration:3.5,ease:'power2.out'});
  if(o3)gsap.to(o3,{x:x*60-30,y:y*60-30,duration:4,ease:'power2.out'});
});

// HERO BG TEXT PARALLAX
gsap.to('.hero-bg-text',{xPercent:-20,ease:'none',scrollTrigger:{trigger:'body',start:'top top',end:'bottom bottom',scrub:1}});

// HERO ENTRANCE
const hero=document.querySelector('#s1');
if(hero){
  const htl=gsap.timeline({delay:.3});
  htl.to('#s1 .mega',{opacity:1,y:0,duration:1.2,ease:'expo.out'})
     .to('#s1 .sub',{opacity:1,y:0,duration:.8,ease:'power2.out'},'-=.6')
     .to('#s1 .scroll-hint',{opacity:1,duration:.6},'-=.3');
}

// ANIM-T: reveal on scroll
gsap.utils.toArray('.anim-t').forEach(el=>{
  gsap.to(el,{opacity:1,y:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 82%'}});
});

// BAR FILLS
document.querySelectorAll('.bar-fill,.bench-f').forEach(b=>{
  const w=b.dataset.w;if(!w)return;
  ScrollTrigger.create({trigger:b,start:'top 85%',once:true,onEnter:()=>{b.style.width=w}});
});

// COUNTERS
document.querySelectorAll('.counter').forEach(el=>{
  const t=+el.dataset.t;
  ScrollTrigger.create({trigger:el,start:'top 80%',once:true,onEnter:()=>{
    const o={v:0};gsap.to(o,{v:t,duration:2,ease:'power2.out',onUpdate:()=>{el.textContent=Math.floor(o.v).toLocaleString('ru-RU')}});
  }});
});

// GANTT BARS
document.querySelectorAll('.g-bar').forEach(b=>{
  const w=b.dataset.w;
  ScrollTrigger.create({trigger:b,start:'top 85%',once:true,onEnter:()=>{gsap.to(b,{width:w,duration:1.8,ease:'power3.out'})}});
});

// CASCADE — staggered reveal
const cas=document.querySelectorAll('.cascade > *');
if(cas.length){
  gsap.set(cas,{opacity:0,x:-30});
  ScrollTrigger.create({trigger:'.cascade',start:'top 75%',once:true,
    onEnter:()=>gsap.to(cas,{opacity:1,x:0,duration:.6,stagger:.12,ease:'back.out(1.4)'})
  });
}

// HORIZONTAL SCROLL
const hzWrap=document.querySelector('.hz-wrap');
const hzTrack=document.querySelector('.hz-track');
if(hzWrap&&hzTrack){
  const dist=()=>hzTrack.scrollWidth-innerWidth;
  gsap.to(hzTrack,{
    x:()=>-dist(),ease:'none',
    scrollTrigger:{trigger:hzWrap,start:'top top',end:()=>`+=${dist()}`,pin:true,scrub:1,anticipatePin:1,invalidateOnRefresh:true}
  });
}

// VS CARDS — pinned
const s2=document.getElementById('s2');
if(s2){
  const ch=s2.querySelector('.chaos'),or=s2.querySelector('.order');
  if(ch&&or){
    gsap.set(or,{opacity:0,x:80,scale:.95});
    ScrollTrigger.create({
      trigger:s2,start:'top top',end:'+=800',pin:true,scrub:1,
      animation:gsap.timeline()
        .to(ch,{x:-40,opacity:.4,scale:.95,filter:'blur(2px)',duration:1})
        .to(or,{opacity:1,x:0,scale:1,duration:1},'<0.3')
    });
  }
}

// GANTT PIN
const s6=document.getElementById('s6');
if(s6){
  ScrollTrigger.create({
    trigger:s6,start:'top top',end:'+=1000',pin:true,scrub:1,
    animation:gsap.timeline()
      .to('.g-red',{width:'100%',duration:1.5})
      .to('.g-blue',{width:'2%',duration:1},'+=0.2')
  });
}

// PHONE SLIDE-IN
const s7=document.getElementById('s7');
if(s7){
  const ph=s7.querySelector('.phone-img');
  const js=s7.querySelector('.json-block');
  if(ph){
    gsap.set(ph,{x:-150,opacity:0,rotateY:20});
    ScrollTrigger.create({trigger:s7,start:'top top',end:'+=1200',pin:true,scrub:1,
      animation:gsap.timeline()
        .to(ph,{x:0,opacity:1,rotateY:0,duration:1.5})
        .to(js,{opacity:1,y:0,duration:.8},'<0.5')
    });
  }
}

// JARO ANIMATION
const jf=document.getElementById('jfill'),js2=document.getElementById('jscore');
if(jf){
  ScrollTrigger.create({trigger:jf,start:'top 80%',once:true,onEnter:()=>{
    gsap.to(jf,{width:'92%',duration:2.5,ease:'elastic.out(1,.6)'});
    const o={v:0};gsap.to(o,{v:92,duration:2,ease:'power2.out',onUpdate:()=>{js2.textContent=Math.floor(o.v)+'%'}});
  }});
}

// M3 CARDS STAGGER
const m3=document.querySelectorAll('.m3-card');
if(m3.length){
  gsap.set(m3,{opacity:0,y:50,scale:.95});
  ScrollTrigger.create({trigger:'.m3',start:'top 75%',once:true,
    onEnter:()=>gsap.to(m3,{opacity:1,y:0,scale:1,duration:.8,stagger:.15,ease:'expo.out'})
  });
}

// ROADMAP STAGGER
const rs=document.querySelectorAll('.road-track');
if(rs.length){
  gsap.set(rs,{opacity:0,x:-60});
  ScrollTrigger.create({trigger:'.road',start:'top 75%',once:true,
    onEnter:()=>gsap.to(rs,{opacity:1,x:0,duration:.8,stagger:.2,ease:'expo.out'})
  });
}

// FINAL CTA
const s13=document.getElementById('s13');
if(s13){
  const pr=s13.querySelector('.price');
  if(pr)gsap.set(pr,{scale:.8,opacity:0});
  ScrollTrigger.create({trigger:s13,start:'top 60%',once:true,
    onEnter:()=>{
      gsap.to('#s13 .mega',{opacity:1,y:0,duration:1,ease:'expo.out'});
      gsap.to(pr,{opacity:1,scale:1,duration:.8,ease:'back.out(2)',delay:.4});
      gsap.to('#s13 .sub',{opacity:1,y:0,duration:.6,delay:.7});
    }
  });
}

// 3D TILT ON IMAGES
document.querySelectorAll('.phone-img,.sec-img,.hz-img').forEach(img=>{
  img.addEventListener('mousemove',e=>{
    const r=img.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    gsap.to(img,{rotateY:x*12,rotateX:-y*12,duration:.4,ease:'power2.out'});
  });
  img.addEventListener('mouseleave',()=>gsap.to(img,{rotateY:0,rotateX:0,duration:.6,ease:'elastic.out(1,.5)'}));
});

// VELOCITY SKEW
let px={s:0};const cl=gsap.utils.clamp(-8,8);
ScrollTrigger.create({onUpdate:self=>{
  let v=cl(self.getVelocity()/-150);
  if(Math.abs(v)>Math.abs(px.s)){px.s=v;gsap.to(px,{s:0,duration:.8,ease:'power3',overwrite:true,
    onUpdate:()=>gsap.quickSetter('.vs-card,.cas-node,.m3-card,.rs,.hzn,.rag-n,.jaro-in,.jaro-out','skewY','deg')(px.s)
  });}
}});

// PROGRESS BAR
const prog=document.getElementById('prog');
if(prog){
  gsap.to(prog,{width:'100%',ease:'none',scrollTrigger:{trigger:'body',start:'top top',end:'bottom bottom',scrub:.3}});
}

})();
