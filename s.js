/* SPECTRUM ENGINE */
(function(){
gsap.registerPlugin(ScrollTrigger);

// LENIS
const lenis=new Lenis({duration:1.6,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
lenis.on('scroll',ScrollTrigger.update);
gsap.ticker.add(t=>lenis.raf(t*1000));
gsap.ticker.lagSmoothing(0);

// PROGRESS
const prog=document.getElementById('prog');
gsap.to(prog,{width:'100%',ease:'none',scrollTrigger:{trigger:'body',start:'top top',end:'bottom bottom',scrub:.3}});

// NAV COUNTER
const navNum=document.getElementById('nav-num');
const secs=document.querySelectorAll('.sc');
document.getElementById('nav-total').textContent=String(secs.length).padStart(2,'0');
secs.forEach((s,i)=>{
  ScrollTrigger.create({trigger:s,start:'top center',end:'bottom center',
    onEnter:()=>{navNum.textContent=String(i+1).padStart(2,'0');s.classList.add('is-active')},
    onEnterBack:()=>{navNum.textContent=String(i+1).padStart(2,'0');s.classList.add('is-active')},
    onLeave:()=>s.classList.remove('is-active'),
    onLeaveBack:()=>s.classList.remove('is-active')
  });
});

// SECTION REVEALS
gsap.utils.toArray('.sc').forEach(s=>{
  const h=s.querySelector('.h1');
  const d=s.querySelector('.ds');
  const k=s.querySelector('.kk');
  const tl=gsap.timeline({scrollTrigger:{trigger:s,start:'top 75%'}});
  if(k)tl.from(k,{y:20,opacity:0,duration:.6,ease:'power2.out'},0);
  if(h)tl.from(h,{y:60,opacity:0,duration:1,ease:'expo.out'},.1);
  if(d)tl.from(d,{y:30,opacity:0,duration:.8,ease:'power2.out'},.3);
});

// CARDS
gsap.utils.toArray('.card').forEach((c,i)=>{
  gsap.from(c,{y:80,opacity:0,duration:1,ease:'expo.out',delay:i*.15,
    scrollTrigger:{trigger:c,start:'top 85%'}});
});

// BAR FILLS
document.querySelectorAll('.bar-f').forEach(b=>{
  ScrollTrigger.create({trigger:b,start:'top 85%',once:true,onEnter:()=>{b.style.width=b.dataset.w}});
});

// COUNTERS
document.querySelectorAll('.bn').forEach(el=>{
  const t=+el.dataset.v;if(!t)return;
  ScrollTrigger.create({trigger:el,start:'top 80%',once:true,onEnter:()=>{
    const o={v:0};gsap.to(o,{v:t,duration:2.5,ease:'power2.out',onUpdate:()=>{el.textContent=Math.floor(o.v).toLocaleString('ru-RU')}});
  }});
});

// CHAIN STAGGER
const chain=document.querySelectorAll('.chain > *');
if(chain.length){
  gsap.set(chain,{opacity:0,x:-20});
  ScrollTrigger.create({trigger:'.chain',start:'top 75%',once:true,
    onEnter:()=>gsap.to(chain,{opacity:1,x:0,duration:.5,stagger:.1,ease:'back.out(1.4)'})
  });
}

// ARCH STAGGER
const arch=document.querySelectorAll('.arch > *');
if(arch.length){
  gsap.set(arch,{opacity:0,scale:.85});
  ScrollTrigger.create({trigger:'.arch',start:'top 75%',once:true,
    onEnter:()=>gsap.to(arch,{opacity:1,scale:1,duration:.6,stagger:.1,ease:'back.out(1.5)'})
  });
}

// GANTT
document.querySelectorAll('.g-bar').forEach(b=>{
  ScrollTrigger.create({trigger:b,start:'top 85%',once:true,
    onEnter:()=>gsap.to(b,{width:b.dataset.w,duration:2,ease:'power3.out'})
  });
});

// METRICS STAGGER
const mc=document.querySelectorAll('.mc');
if(mc.length){
  gsap.set(mc,{opacity:0,y:60,scale:.95});
  ScrollTrigger.create({trigger:'.m3',start:'top 75%',once:true,
    onEnter:()=>gsap.to(mc,{opacity:1,y:0,scale:1,duration:.8,stagger:.15,ease:'expo.out'})
  });
}

// TRACKS STAGGER
const tracks=document.querySelectorAll('.track');
if(tracks.length){
  gsap.set(tracks,{opacity:0,x:-40});
  ScrollTrigger.create({trigger:'.tracks',start:'top 75%',once:true,
    onEnter:()=>gsap.to(tracks,{opacity:1,x:0,duration:.8,stagger:.2,ease:'expo.out'})
  });
}

// IMAGES
gsap.utils.toArray('.float-img').forEach(img=>{
  gsap.from(img,{scale:.9,opacity:0,duration:1.2,ease:'expo.out',
    scrollTrigger:{trigger:img,start:'top 80%'}});
  img.addEventListener('mousemove',e=>{
    const r=img.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    gsap.to(img,{rotateY:x*10,rotateX:-y*10,duration:.3,ease:'power2.out'});
  });
  img.addEventListener('mouseleave',()=>gsap.to(img,{rotateY:0,rotateX:0,duration:.5,ease:'elastic.out(1,.5)'}));
});

// BG TEXT PARALLAX
gsap.utils.toArray('.sc-bg span').forEach(t=>{
  gsap.to(t,{xPercent:-10,ease:'none',scrollTrigger:{trigger:t.parentElement.parentElement,start:'top bottom',end:'bottom top',scrub:1}});
});

// PRICE
const price=document.querySelector('.price');
if(price){
  gsap.from(price,{scale:.7,opacity:0,duration:1,ease:'back.out(2)',
    scrollTrigger:{trigger:price,start:'top 80%'}});
}

// CODE
const code=document.querySelector('.code');
if(code) gsap.from(code,{y:30,opacity:0,duration:.8,scrollTrigger:{trigger:code,start:'top 85%'}});

})();
