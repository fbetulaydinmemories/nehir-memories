/* 2019 gallery owns only its ambient recordings. Audible playback requires consent. */
(() => {
'use strict';
const chapter=document.getElementById('school2019'),slides=document.getElementById('school2019-slides'),toggle=document.getElementById('school2019-sound'),status=document.getElementById('school2019-audio-status'),read=document.getElementById('school2019-read');
const files=["2019_01_new_school", "2019_02_archery", "2019_03_volleyball", "2019_04_classroom", "2019_05_reading_club", "2019_06_robotics", "2019_07_corridor"];
let enabled=false,context=null,epoch=0,key=null,current=null,ready=false,scheduled=0;
const buffers=new Map(),nodes=new Set();
const open=()=>chapter.classList.contains('is-open');
const story=()=>chapter.querySelector('#school2019-story,[data-school2019-story]');
function reading(){const target=story();if(!target||!open())return false;const top=target.getBoundingClientRect().top-chapter.getBoundingClientRect().top+chapter.scrollTop;return chapter.scrollTop>=top-1;}
function index(){return Math.max(0,Math.min(6,Math.round(slides.scrollLeft/(slides.clientWidth||1))));}
function label(){toggle.textContent=enabled?'Sesi kapat':'Sesi aç';toggle.setAttribute('aria-pressed',String(enabled));}
function destroy(node){if(!nodes.has(node))return;try{node.source.stop();}catch(error){}node.source.disconnect();node.gain.disconnect();nodes.delete(node);if(current===node)current=null;}
function cleanup(){for(const node of [...nodes])destroy(node);}
function ramp(node,level,seconds){const now=context.currentTime;const gain=node.gain.gain;if(gain.cancelAndHoldAtTime)gain.cancelAndHoldAtTime(now);else{gain.cancelScheduledValues(now);gain.setValueAtTime(gain.value,now);}gain.linearRampToValueAtTime(level,now+seconds);}
function pause(){epoch++;key=null;ready=false;cleanup();}
async function buffer(scene){if(buffers.has(scene))return buffers.get(scene).promise;const controller=new AbortController();const entry={controller,promise:null};entry.promise=fetch('assets/2019/audio/'+files[scene]+'.mp3',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Audio HTTP '+r.status);return r.arrayBuffer();}).then(b=>context.decodeAudioData(b));buffers.set(scene,entry);try{return await entry.promise;}catch(error){if(buffers.get(scene)===entry)buffers.delete(scene);throw error;}}
function trimCache(scene){for(const [i,entry] of buffers){if(i!==scene&&i!==scene+1){entry.controller.abort();buffers.delete(i);}}}
async function transition(next){const token=++epoch;key=next;ready=false;const duration=next==='story'?2.5:.7;for(const node of nodes)ramp(node,0,duration);if(nodes.size)await new Promise(resolve=>setTimeout(resolve,duration*1000));if(token!==epoch)return;cleanup();
 if(!enabled||!open()||document.hidden)return;
 if(next==='story'){ready=true;window.NehirPiano?.sync();return;}
 try{const entry=buffers.get(next);const audio=entry?await entry.promise:await buffer(next);if(token!==epoch||!enabled||!open()||document.hidden||reading()||index()!==next)return;const source=context.createBufferSource(),gain=context.createGain();source.buffer=audio;source.loop=true;source.connect(gain);gain.connect(context.destination);gain.gain.setValueAtTime(0,context.currentTime);const node={source,gain};nodes.add(node);current=node;source.start();ramp(node,.34,.8);status.textContent='';trimCache(next);if(next<6)buffer(next+1).catch(()=>{});
 }catch(error){if(token!==epoch||error.name==='AbortError')return;key=null;status.textContent='Ses yüklenemedi. Sesi kapatıp yeniden açarak deneyebilirsin.';}
}
function controls(){const target=story(),isReading=reading();read.hidden=!target||index()!==6||isReading;chapter.querySelector('.chapter2018-nav').hidden=isReading;if(chapter.classList.contains('has-story')!==Boolean(target))chapter.classList.toggle('has-story',Boolean(target));}
function sync(){controls();if(!enabled||!open()||document.hidden||!context){pause();return;}const next=reading()?'story':index();if(next!==key){window.NehirPiano?.sync();transition(next);}}
toggle.addEventListener('click',async()=>{enabled=!enabled;label();status.textContent='';if(!enabled){pause();window.NehirPiano?.setEnabled(false);return;}const token=++epoch;try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw Error('Audio unavailable');if(!context)context=new Context();await context.resume();if(token!==epoch||!enabled||!open())return;window.NehirPiano?.setEnabled(true);sync();}catch(error){if(token!==epoch)return;enabled=false;label();status.textContent='Ses başlatılamadı. Yeniden deneyebilirsin.';}});
read.addEventListener('click',()=>{const target=story();if(!target)return;chapter.scrollTo({top:target.getBoundingClientRect().top-chapter.getBoundingClientRect().top+chapter.scrollTop,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
function schedule(){if(scheduled)return;scheduled=requestAnimationFrame(()=>{scheduled=0;sync();});}
slides.addEventListener('scroll',schedule,{passive:true});chapter.addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
new MutationObserver(()=>{if(!open()){enabled=false;label();pause();for(const entry of buffers.values())entry.controller.abort();buffers.clear();if(context){const old=context;context=null;old.close().catch(()=>{});}}else sync();}).observe(chapter,{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(enabled&&context)context.resume().then(sync).catch(()=>{});});addEventListener('pagehide',()=>{pause();for(const entry of buffers.values())entry.controller.abort();buffers.clear();});
window.Nehir2019Audio={readingReady:()=>enabled&&ready&&reading()};label();controls();
})();
