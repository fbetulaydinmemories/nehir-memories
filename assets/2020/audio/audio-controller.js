/* Original synthesized 2020 soundscapes; user opt-in only. */
(()=>{'use strict';
const root=document.getElementById('pandemic2020'),slides=document.getElementById('pandemic2020-slides'),button=document.getElementById('pandemic2020-sound'),status=document.getElementById('pandemic2020-audio-status'),read=document.getElementById('pandemic2020-read');
if(!root||!slides||!button)return;
const names=['01_online','02_coffee','03_anime','04_study','05_school','06_friends'];
let enabled=false,ctx=null,serial=0,active=null,selected=null,readingState=false;
const cache=new Map();
const isOpen=()=>root.classList.contains('is-open');
const index=()=>Math.max(0,Math.min(5,Math.round(slides.scrollLeft/(slides.clientWidth||1))));
function isReading(){const story=root.querySelector('#pandemic2020-story');if(!story||!isOpen())return false;return root.scrollTop>root.clientHeight*.45;}
function label(){button.textContent=enabled?'Sesi kapat':'Sesi aç';button.setAttribute('aria-pressed',String(enabled));}
function halt(){serial++;selected=null;if(active){try{active.source.stop();}catch(e){}active.source.disconnect();active.gain.disconnect();active=null;}}
function fadeOut(){if(!active||!ctx)return;const old=active;active=null;const g=old.gain.gain,now=ctx.currentTime;g.cancelScheduledValues(now);g.setValueAtTime(g.value,now);g.linearRampToValueAtTime(0,now+.55);setTimeout(()=>{try{old.source.stop();}catch(e){}old.source.disconnect();old.gain.disconnect();},650);}
async function load(i){if(cache.has(i))return cache.get(i);const promise=fetch('assets/2020/audio/'+names[i]+'.wav').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b));cache.set(i,promise);try{return await promise;}catch(e){cache.delete(i);throw e;}}
async function sync(){const reading=isReading();if(reading!==readingState){readingState=reading;window.NehirPiano?.sync();}
if(!enabled||!ctx||!isOpen()||document.hidden||reading){if(active)fadeOut();selected=null;serial++;return;}
const i=index();if(i===selected)return;selected=i;const token=++serial;fadeOut();try{const buf=await load(i);if(token!==serial||!enabled||!isOpen()||document.hidden||isReading()||index()!==i)return;const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buf;source.loop=true;source.connect(gain);gain.connect(ctx.destination);gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(.48,ctx.currentTime+.65);active={source,gain};source.start();status.textContent='';for(const k of [...cache.keys()])if(k!==i)cache.delete(k);}catch(e){if(token!==serial)return;selected=null;status.textContent='Ses yüklenemedi. Tekrar denemek için sesi kapatıp aç.';}}
button.addEventListener('click',async()=>{enabled=!enabled;label();status.textContent='';if(!enabled){halt();return;}const token=++serial;try{if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();await ctx.resume();if(token!==serial||!enabled)return;selected=null;sync();}catch(e){if(token!==serial)return;enabled=false;label();status.textContent='Ses başlatılamadı. Yeniden deneyebilirsin.';}});
slides.addEventListener('scroll',sync,{passive:true});root.addEventListener('scroll',sync,{passive:true});if(read)read.addEventListener('click',()=>{readingState=true;halt();window.NehirPiano?.sync();});
new MutationObserver(()=>{if(!isOpen()){halt();readingState=false;window.NehirPiano?.sync();}else{selected=null;sync();}}).observe(root,{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>{if(document.hidden)halt();else if(enabled&&isOpen()){selected=null;ctx?.resume().then(sync).catch(()=>{});}});addEventListener('pagehide',halt);
window.Nehir2020Audio={readingReady:()=>isReading(),sync};label();
})();