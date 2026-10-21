/* Final chapter only. No audio objects, playback calls, or audio level changes. */
(() => {
'use strict';
const DURATION=4800, reduce=matchMedia('(prefers-reduced-motion: reduce)');
let destination=null, active=null;
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const palette=['248,245,240','232,230,245','199,184,232','217,221,232','235,217,184'];
const style=document.createElement('style');
style.textContent='#last-book-light{position:fixed;inset:0;z-index:2147483646;overflow:hidden;touch-action:none;overscroll-behavior:none;isolation:isolate;opacity:1}#last-book-light canvas{display:block;width:100%;height:100%}#last-book-light button{position:absolute;right:22px;top:max(22px,env(safe-area-inset-top));border:1px solid #d9dde85c;border-radius:24px;padding:10px 16px;background:#080c1866;color:#f8f5f0;font:13px system-ui;cursor:pointer}#last-book-light button:focus-visible{outline:2px solid #c7b8e8;outline-offset:4px}';
document.head.append(style);
function register(config){
 if(!config||config.count!==41||typeof config.open!=='function'||!config.root||typeof config.ready!=='function')throw new TypeError('Last Book requires 41 images, root, ready() and open().');
 destination=config;
 return ()=>{if(destination===config)destination=null};
}
function play(button){
 if(active)return active.promise;
 const layer=document.createElement('div');layer.id='last-book-light';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Geleceğin ışığına geçiş');
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Geçişi kapat';layer.append(canvas,cancel);
 const main=document.querySelector('main'),prevInert=main.inert,overflow=document.body.style.overflow,focus=document.activeElement;
 let raf=0,timer=0,done=false,opened=false,w=0,h=0,start=performance.now(),target=destination;
 let resolve;const promise=new Promise(r=>resolve=r);active={promise,cancel:()=>finish(false)};
 main.inert=true;document.body.style.overflow='hidden';document.body.append(layer);cancel.focus({preventScroll:true});
 let ctx;try{ctx=canvas.getContext('2d')}catch{};
 const stars=Array.from({length:innerWidth<600?155:270},(_,i)=>({u:(i*.61803398875)%1,v:(i*.75487766625)%1,p:i*2.399963,r:.45+(i%5)*.32,c:palette[i%5]}));
 function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx?.setTransform(d,0,0,d,0,0)}
 function finish(success){if(done)return;done=true;cancelAnimationFrame(raf);clearTimeout(timer);removeEventListener('resize',resize);document.removeEventListener('keydown',key,true);document.removeEventListener('visibilitychange',hidden);layer.remove();if(!opened){main.inert=prevInert;document.body.style.overflow=overflow;}active=null;if(!opened)(focus||button)?.focus({preventScroll:true});resolve(success);}
 function key(e){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish(false)}else if(e.key==='Tab'){e.preventDefault();e.stopImmediatePropagation();cancel.focus()}else if(['ArrowLeft','ArrowRight',' ','Enter','PageDown','PageUp','Home','End'].includes(e.key)&&e.target!==cancel){e.preventDefault();e.stopImmediatePropagation()}}
 function hidden(){if(document.hidden)finish(false)}
 function arrive(){if(opened||!target)return;try{if(target.ready()!==true)return;main.inert=prevInert;document.body.style.overflow=overflow;target.open(button);opened=true;}catch(error){console.warn('Last Book opening failed',error);target=null;}}
 function paint(now){
  if(done)return;const elapsed=now-start,short=reduce.matches,total=short?650:DURATION,p=Math.min(1,elapsed/total);
  if(!ctx){finish(false);return}
  ctx.clearRect(0,0,w,h);
  const wake=smooth(0,.22,p),travel=smooth(.5,.83,p),exit=smooth(.83,1,p),envelope=wake*(1-exit);
  if(short){ctx.fillStyle='rgba(232,230,245,'+(.18*Math.sin(p*Math.PI))+')';ctx.fillRect(0,0,w,h);if(p>.5)arrive();}
  else {
   ctx.fillStyle='rgba(8,12,24,'+(.52*smooth(.08,.46,p)*(1-exit))+')';ctx.fillRect(0,0,w,h);
   const cx=w*.5,cy=h*.5,scale=Math.min(w,h),radius=scale*(.12+.68*travel);
   const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(1,radius));glow.addColorStop(0,'rgba(248,245,240,'+(.12+.36*travel)*envelope+')');glow.addColorStop(.25,'rgba(232,230,245,'+.22*envelope+')');glow.addColorStop(.6,'rgba(199,184,232,'+.12*envelope+')');glow.addColorStop(1,'rgba(199,184,232,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
   for(const s of stars){const formation=smooth(.17,.52,p);const depth=.16+s.u*.84;const z=depth/(1+travel*.9);const r=scale*.105/z;const angle=s.p+elapsed*.00013+(1-depth)*6;const tx=cx+Math.cos(angle)*r,ty=cy+Math.sin(angle)*r*.72;const x=s.u*w*(1-formation)+tx*formation,y=s.v*h*(1-formation)+ty*formation;
    const opacity=(.16+.5*smooth(0,.2,p))*(1-exit)*(.6+.4*Math.sin(s.p+elapsed*.0006)**2);ctx.fillStyle='rgba('+s.c+','+opacity+')';ctx.beginPath();ctx.arc(x,y,s.r*(1+travel*.8),0,Math.PI*2);ctx.fill();
   }
   // Several nested, broken ellipses form perspective layers, never a single spinning disk.
   ctx.save();ctx.translate(cx,cy);ctx.rotate(elapsed*.00006);for(let k=0;k<9;k++){const depth=.2+k*.13;const r=scale*.105/(depth/(1+travel*.9));ctx.strokeStyle='rgba('+palette[k%5]+','+.10*envelope*smooth(.2,.45,p)+')';ctx.lineWidth=1+travel;ctx.beginPath();ctx.ellipse(0,0,r,r*.72,k*.14,k*.7,k*.7+Math.PI*1.25);ctx.stroke()}ctx.restore();
   const moon=.13*smooth(.68,.85,p)*(1-exit);ctx.fillStyle='rgba(248,245,240,'+moon+')';ctx.fillRect(0,0,w,h);
   if(p>=.84)arrive();
  }
  layer.style.opacity=String(1-smooth(short?.55:.86,1,p));
  if(p>=1){finish(true);return}raf=requestAnimationFrame(paint);
 }
 cancel.addEventListener('click',()=>finish(false));document.addEventListener('keydown',key,true);document.addEventListener('visibilitychange',hidden);addEventListener('resize',resize);resize();timer=setTimeout(()=>finish(false),6500);raf=requestAnimationFrame(paint);return promise;
}
window.NehirLastBookTransition={play,register,cancel:()=>active?.cancel(),get running(){return Boolean(active)},get galleryOpen(){return Boolean(destination?.root?.classList.contains('is-open'))}};
})();
