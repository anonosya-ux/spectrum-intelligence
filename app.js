/* SPECTRUM v4 — Cinematic Scrollytelling Engine */
(function(){
'use strict';
const S={mx:.5,my:.5,tx:.5,ty:.5,scroll:0};

/* === GLSL BACKGROUND === */
function initGL(){
const c=document.getElementById('webgl-canvas');if(!c)return;
const r=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:false});
r.setSize(innerWidth,innerHeight);r.setPixelRatio(Math.min(devicePixelRatio,1.5));
const sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const m=new THREE.ShaderMaterial({uniforms:{
uT:{value:0},uM:{value:new THREE.Vector2(.5,.5)},uS:{value:0},uR:{value:new THREE.Vector2(innerWidth,innerHeight)}
},vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=vec4(position,1.);}`,
fragmentShader:`precision highp float;uniform float uT,uS;uniform vec2 uM,uR;varying vec2 v;
vec3 mod289(vec3 x){return x-floor(x/289.)*289.;}vec2 mod289(vec2 x){return x-floor(x/289.)*289.;}
vec3 perm(vec3 x){return mod289(((x*34.)+1.)*x);}
float sn(vec2 p){const vec4 C=vec4(.211324865,.366025403,-.577350269,.024390243);
vec2 i=floor(p+dot(p,C.yy));vec2 x0=p-i+dot(i,C.xx);vec2 i1=x0.x>x0.y?vec2(1,0):vec2(0,1);
vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
vec3 pm=perm(perm(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m*m*m;
vec3 x=2.*fract(pm*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a=x-ox;
m*=1.79284291-.85373472*(a*a+h*h);
vec3 g;g.x=a.x*x0.x+h.x*x0.y;g.yz=a.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}
float grid(vec2 u,float s,float t){vec2 g=abs(fract(u*s)-.5);return 1.-smoothstep(0.,t,min(g.x,g.y));}
void main(){vec2 u=v;float a=uR.x/uR.y;vec2 ua=vec2(u.x*a,u.y);
u.y+=uS*.2;vec2 md=u-uM;float mg=exp(-length(md)*3.)*.1;
vec3 bg=mix(vec3(.039,.039,.078),vec3(.051,.106,.243),u.y+sn(u*2.+uT*.04)*.2);
bg+=vec3(grid(ua+vec2(0,uS*.3),20.,.07)*.01);
float vx=sn(ua*8.+uT*.1)*.5+sn(ua*16.-uT*.07)*.25;
bg+=vec3(.145,.388,.92)*smoothstep(.1,.55,vx)*.03*(1.-uS*.3);
for(float i=0.;i<5.;i++){float y=ua.y+i*.1-.2;float w=sin(ua.x*20.+uT+i*10.)*.02;
float l=smoothstep(.003,0.,abs(y-.5+w))*smoothstep(0.,1.,sin(ua.x*3.14-uT*2.+i*5.));
bg+=vec3(.145,.388,.92)*l*.1;}
bg+=vec3(.145,.388,.92)*mg;
bg+=vec3(smoothstep(.93,.96,sn(ua*55.+uT*.2))*.2);
bg*=1.-smoothstep(.3,1.2,length(u-.5)*1.3);
bg+=(fract(sin(dot(u*uT,vec2(12.9898,78.233)))*43758.5453)-.5)*.02;
gl_FragColor=vec4(bg,1.);}`});
sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),m));
let t=0;(function lp(){requestAnimationFrame(lp);t+=.016;
S.mx+=(S.tx-S.mx)*.04;S.my+=(S.ty-S.my)*.04;
m.uniforms.uT.value=t;m.uniforms.uM.value.set(S.mx,1-S.my);m.uniforms.uS.value=S.scroll;
r.render(sc,cam);})();
addEventListener('resize',()=>{r.setSize(innerWidth,innerHeight);m.uniforms.uR.value.set(innerWidth,innerHeight);});
}

/* === LENIS === */
let lenis;
function initLenis(){
lenis=new Lenis({duration:1.6,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
lenis.on('scroll',ScrollTrigger.update);
gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
lenis.on('scroll',({progress})=>{S.scroll=progress;
const p=document.getElementById('prog');if(p)p.style.width=(progress*100)+'%';});
}

/* === SCROLLYTELLING === */
function initScroll(){
gsap.registerPlugin(ScrollTrigger);

// Hero pin + split
const ht=gsap.timeline({scrollTrigger:{trigger:'#s1',start:'top top',end:'+=120%',scrub:1.5,pin:true}});
ht.to('.hero-h .tl:first-child span',{x:-200,opacity:0,ease:'none'},0)
.to('.hero-h .tl:last-child span',{x:200,opacity:0,ease:'none'},0)
.to('.hero-sub',{y:-60,opacity:0,ease:'none'},0)
.to('.kpis',{y:-40,opacity:0,ease:'none'},.1)
.to('.tag',{scale:.85,opacity:0,ease:'none'},0)
.to('.scr-cue',{opacity:0,ease:'none'},0);

// All section headers
document.querySelectorAll('.sl[data-block]').forEach(sec=>{
if(sec.id==='s1')return;
const idx=sec.querySelector('.idx'),spans=sec.querySelectorAll('.tl span');
const tl=gsap.timeline({scrollTrigger:{trigger:sec,start:'top 72%',toggleActions:'play none none reverse'}});
if(idx)tl.to(idx,{opacity:1,x:0,duration:.6});
if(spans.length)tl.to(spans,{y:0,duration:1.2,stagger:.08,ease:'power4.out'},'-.3');
});

// Reveal lines (word by word)
gsap.utils.toArray('.rv-line').forEach((el,i)=>{
gsap.to(el,{opacity:1,y:0,duration:.8,delay:i*.15,ease:'power3.out',
scrollTrigger:{trigger:el,start:'top 82%',toggleActions:'play none none reverse'}});
});

// Counter animations
gsap.utils.toArray('.ctr').forEach(el=>{
const v=parseInt(el.dataset.v);
ScrollTrigger.create({trigger:el,start:'top 80%',onEnter:()=>{
gsap.to({n:0},{n:v,duration:2.5,ease:'power2.out',
onUpdate(){el.textContent=Math.round(this.targets()[0].n).toLocaleString('ru-RU');}});
}});
});

// Bars
gsap.utils.toArray('.bar-fill').forEach(el=>{
gsap.to(el,{flex:parseFloat(el.dataset.w)/100,duration:1.5,ease:'power2.out',
scrollTrigger:{trigger:el,start:'top 85%'}});
});

// Split cards (fly from sides)
document.querySelectorAll('.split').forEach(sp=>{
const l=sp.querySelector('.split-l,.card-r:first-child');
const r=sp.querySelector('.split-r,.card-r:last-child');
if(l)gsap.from(l,{opacity:0,x:-60,duration:1,ease:'power3.out',scrollTrigger:{trigger:sp,start:'top 70%',toggleActions:'play none none reverse'}});
if(r)gsap.from(r,{opacity:0,x:60,duration:1,ease:'power3.out',delay:.15,scrollTrigger:{trigger:sp,start:'top 70%',toggleActions:'play none none reverse'}});
});

// Horizontal scroll (pain section)
const track=document.querySelector('.hscr-track');
if(track){
const tw=()=>track.scrollWidth-innerWidth+80;
gsap.to(track,{x:()=>-tw(),ease:'none',
scrollTrigger:{trigger:'#s5',pin:true,scrub:1,start:'top top',end:()=>'+='+tw(),invalidateOnRefresh:true}});
}

// Steps animation
gsap.utils.toArray('.step').forEach((el,i)=>{
gsap.to(el,{opacity:1,x:0,duration:.7,delay:i*.12,ease:'power3.out',
scrollTrigger:{trigger:el,start:'top 82%',toggleActions:'play none none reverse'}});
});

// Ecosystem nodes + SVG lines
gsap.utils.toArray('.eco-node').forEach((n,i)=>{
gsap.to(n,{opacity:1,scale:1,duration:.8,delay:i*.2,ease:'back.out(1.4)',
scrollTrigger:{trigger:'.eco',start:'top 75%'}});
});
gsap.utils.toArray('.svg-draw').forEach((l,i)=>{
gsap.to(l,{strokeDashoffset:0,duration:1,delay:.3+i*.3,ease:'power2.out',
scrollTrigger:{trigger:'.eco',start:'top 75%'}});
});

// Compress big
gsap.from('.compress-was',{textContent:0,duration:2,snap:{textContent:1},ease:'power2.out',
scrollTrigger:{trigger:'.compress-big',start:'top 75%'}});

// Timeline phases
gsap.utils.toArray('.tl-phase').forEach((ph,i)=>{
gsap.to(ph,{opacity:1,y:0,duration:.7,delay:i*.25,ease:'power3.out',
scrollTrigger:{trigger:'.timeline',start:'top 75%'}});
});
gsap.utils.toArray('.tl-dot').forEach((d,i)=>{
gsap.to(d,{borderColor:'#2563EB',background:'#2563EB',boxShadow:'0 0 12px rgba(37,99,235,.3)',
duration:.5,delay:i*.3,scrollTrigger:{trigger:'.timeline',start:'top 75%'}});
});
gsap.utils.toArray('.tl-connector').forEach((c,i)=>{
gsap.to(c,{background:'#2563EB',duration:.6,delay:.15+i*.3,
scrollTrigger:{trigger:'.timeline',start:'top 75%'}});
});

// MVP boxes
gsap.utils.toArray('.mvp-box').forEach((b,i)=>{
gsap.to(b,{opacity:1,y:0,duration:.8,delay:i*.15,ease:'back.out(1.2)',
scrollTrigger:{trigger:b,start:'top 82%'}});
});

// ROI path draw
const roiP=document.querySelector('.roi-path');
if(roiP){
gsap.to(roiP,{strokeDashoffset:0,duration:2.5,ease:'power2.out',
scrollTrigger:{trigger:'.roi-graph',start:'top 70%'}});
gsap.utils.toArray('.roi-dot').forEach((d,i)=>{
gsap.to(d,{opacity:1,duration:.4,delay:1+i*.5,
scrollTrigger:{trigger:'.roi-graph',start:'top 70%'}});
});
}

// Market bars
gsap.utils.toArray('.market-fill').forEach(el=>{
const w=el.classList.contains('market-fill-red')?'100%':'50%';
gsap.to(el,{width:w,duration:1.5,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 85%'}});
});

// CTA cards
gsap.utils.toArray('.cta-card').forEach((c,i)=>{
gsap.to(c,{opacity:1,y:0,duration:1,delay:i*.15,ease:'power3.out',
transformPerspective:800,scrollTrigger:{trigger:c,start:'top 82%',toggleActions:'play none none reverse'}});
});

// Price rows
gsap.utils.toArray('.price-row.rv-line').forEach((r,i)=>{
gsap.to(r,{opacity:1,y:0,duration:.7,delay:i*.15,ease:'power3.out',
scrollTrigger:{trigger:r,start:'top 85%',toggleActions:'play none none reverse'}});
});

// Parallax per section
document.querySelectorAll('.sl-c').forEach(el=>{
gsap.to(el,{y:-15,scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:3}});
});
}

/* === HERO ENTRANCE === */
function playHero(){
const tl=gsap.timeline({delay:.15});
tl.to('.tag',{opacity:1,y:0,duration:.8,ease:'power3.out'})
.to('#s1 .tl span',{y:0,duration:1.4,stagger:.12,ease:'power4.out'},'-.5')
.to('.hero-sub',{opacity:1,y:0,duration:.8,ease:'power3.out'},'-.8')
.to('.kpis',{opacity:1,y:0,duration:.8,ease:'power3.out'},'-.5')
.to('.scr-cue',{opacity:1,duration:.8},'-.3');
tl.add(()=>{
document.querySelectorAll('.kpi-v').forEach(el=>{
const v=parseInt(el.dataset.v);
gsap.to({n:0},{n:v,duration:2.5,ease:'power2.out',
onUpdate(){el.textContent=Math.round(this.targets()[0].n);}});
});
},'-.8');
}

/* === PRELOADER === */
function initPL(){
const el=document.getElementById('preloader');if(!el)return;
const ct=el.querySelector('.pl-pct'),ln=el.querySelector('.pl-line');
let p=0;const iv=setInterval(()=>{
p+=Math.random()*14+4;if(p>100)p=100;
ct.textContent=Math.round(p)+'%';ln.style.setProperty('--p',p+'%');
if(p>=100){clearInterval(iv);setTimeout(()=>{
gsap.to(el,{clipPath:'inset(0 0 100% 0)',duration:1.1,ease:'power4.inOut',
onComplete(){el.style.display='none';
document.getElementById('nav').classList.add('vis');playHero();}});
},350);}
},50);
}

/* === INTERACTIONS === */
function initMouse(){
document.addEventListener('mousemove',e=>{S.tx=e.clientX/innerWidth;S.ty=e.clientY/innerHeight;});
// 3D tilt
document.querySelectorAll('.card-r,.hcard,.cta-card,.mvp-box,.eco-node').forEach(c=>{
c.addEventListener('mousemove',e=>{
const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
gsap.to(c,{rotateY:x*10,rotateX:-y*10,duration:.35,ease:'power2.out',transformPerspective:1000});
});
c.addEventListener('mouseleave',()=>{gsap.to(c,{rotateY:0,rotateX:0,duration:.8,ease:'elastic.out(1,.4)'});});
});
// Magnetic buttons
document.querySelectorAll('.cta-btn').forEach(b=>{
b.addEventListener('mousemove',e=>{
const r=b.getBoundingClientRect();
gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.2,y:(e.clientY-r.top-r.height/2)*.2,duration:.3});
});
b.addEventListener('mouseleave',()=>{gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.35)'});});
});
}

/* === NAV === */
function initNav(){
document.querySelectorAll('.nav-a').forEach(a=>{
a.addEventListener('click',e=>{e.preventDefault();
const t=document.querySelector(a.getAttribute('href'));
if(t&&lenis)lenis.scrollTo(t,{offset:-80,duration:2.5});
});
});
}

/* === INIT STATES === */
function initStates(){
gsap.set('.tag',{opacity:0,y:20});
gsap.set('.hero-sub',{opacity:0,y:20});
gsap.set('.kpis',{opacity:0,y:30});
gsap.set('.scr-cue',{opacity:0});
}

/* === BOOT === */
document.addEventListener('DOMContentLoaded',()=>{
initStates();initGL();initLenis();initScroll();initMouse();initNav();initPL();
});
})();
