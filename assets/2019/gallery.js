
(() => {
'use strict';
const gallery=document.getElementById('school2019'),slides=document.getElementById('school2019-slides'),back=document.getElementById('school2019-return'),prev=document.getElementById('school2019-prev'),next=document.getElementById('school2019-next');
const locations=['Yeni okul','Okçuluk','Bahçede voleybol','Sınıf','Nehir’in kitap kulübü','Betül’ün robotik çalışması','Çay ve koridor sohbetleri'];let origin=null,current=0,lastWheel=0;
function sync(){current=Math.max(0,Math.min(6,Math.round(slides.scrollLeft/(slides.clientWidth||1))));prev.disabled=current===0;next.disabled=current===6;document.getElementById('school2019-location').textContent=locations[current];document.getElementById('school2019-count').textContent=(current+1)+' / 7';}
function move(delta){slides.scrollTo({left:Math.max(0,Math.min(6,current+delta))*slides.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
window.open2019=function(button){origin=button;document.querySelectorAll('.node').forEach(n=>n.classList.remove('active'));button.classList.add('active');gallery.inert=false;gallery.setAttribute('aria-hidden','false');gallery.classList.add('is-open');gallery.scrollTop=0;document.querySelector('main').inert=true;document.body.style.overflow='hidden';slides.scrollTo({left:0,behavior:'instant'});current=0;sync();back.focus();};
function close(){gallery.classList.remove('is-open');gallery.inert=true;gallery.setAttribute('aria-hidden','true');document.querySelector('main').inert=false;document.body.style.overflow='';origin?.focus();}
back.onclick=close;prev.onclick=()=>move(-1);next.onclick=()=>move(1);slides.addEventListener('scroll',sync,{passive:true});
slides.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&Math.abs(e.deltaY)>8){e.preventDefault();const now=performance.now();if(now-lastWheel>700){lastWheel=now;move(e.deltaY>0?1:-1);}}},{passive:false});
document.addEventListener('keydown',e=>{if(!gallery.classList.contains('is-open'))return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopImmediatePropagation();move(e.key==='ArrowRight'?1:-1);}else if(e.key==='Tab'){const controls=[...gallery.querySelectorAll('button,a[href],[tabindex="0"]')].filter(x=>!x.disabled&&!x.hidden);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}},true);
addEventListener('resize',()=>{if(gallery.classList.contains('is-open'))slides.scrollTo({left:current*slides.clientWidth,behavior:'instant'});});
})();
