/* Piano is restricted to the timeline and written stories; never illustrations. */
(() => {
'use strict';
const toggle=document.getElementById('timeline-music');
const chapter2017=document.getElementById('memory2017');
const chapter2018=document.getElementById('chapter2018');
const panel=document.getElementById('panel');
const summer=document.getElementById('summer2018');
const pandemic2020=document.getElementById('pandemic2020');
const school2019=document.getElementById('school2019');
const schoolAudio=document.getElementById('memory-audio');
let enabled=false,context=null,bufferPromise=null,source=null,gain=null,started=0,offset=0,epoch=0;
let last2017Reading=false,was2017Open=false,raf=0;
function reading(chapter,story){if(!chapter.classList.contains(chapter===chapter2017?'open':'is-open'))return false;const boundary=story.getBoundingClientRect().top-chapter.getBoundingClientRect().top+chapter.scrollTop;return chapter.scrollTop>=boundary-1;}
function allowed(){if(document.getElementById('newyear2024')?.classList.contains('is-open'))return Boolean(window.NehirSceneAudio?.readingReady('newyear2024'));if(document.getElementById('beginnings2023')?.classList.contains('is-open'))return Boolean(window.NehirSceneAudio?.readingReady('beginnings2023'));if(document.getElementById('senior2022')?.classList.contains('is-open'))return Boolean(window.NehirSceneAudio?.readingReady('senior2022'));if(document.getElementById('reunion2021')?.classList.contains('is-open'))return Boolean(window.NehirSceneAudio?.readingReady('reunion2021'));if(document.hidden||panel.classList.contains('show'))return false;if(pandemic2020.classList.contains('is-open'))return Boolean(window.Nehir2020Audio?.readingReady());if(school2019.classList.contains('is-open'))return Boolean(window.Nehir2019Audio?.readingReady());if(summer.classList.contains('is-open'))return Boolean(window.NehirSummerAudio?.readingReady());if(chapter2017.classList.contains('open'))return reading(chapter2017,document.getElementById('memory-story'));if(chapter2018.classList.contains('is-open'))return reading(chapter2018,document.getElementById('chapter2018-story'));return true;}
function stop(){epoch++;if(source){offset=(offset+context.currentTime-started)%source.buffer.duration;try{source.stop();}catch(error){}source.disconnect();gain.disconnect();source=null;gain=null;}}
function label(){toggle.textContent=enabled?'Müzik açık':'Müzik kapalı';toggle.setAttribute('aria-pressed',String(enabled));toggle.setAttribute('aria-label',enabled?'Timeline ve hikâye piyanosunu kapat':'Timeline ve hikâye piyanosunu aç');}
function buffer(){if(!bufferPromise){bufferPromise=fetch('assets/2018/audio/reading-piano.mp3').then(r=>{if(!r.ok)throw Error('Piano HTTP '+r.status);return r.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes));bufferPromise.catch(()=>bufferPromise=null);}return bufferPromise;}
async function sync(){const open2017=chapter2017.classList.contains('open');const read2017=open2017&&reading(chapter2017,document.getElementById('memory-story'));
 if(read2017){schoolAudio.pause();}else if(open2017&&was2017Open&&last2017Reading&&document.getElementById('memory-sound').getAttribute('aria-pressed')==='true'&&!document.hidden){schoolAudio.play().catch(()=>{});}
 was2017Open=open2017;last2017Reading=read2017;
 if(!enabled||!context||!allowed()){stop();return;}if(source)return;
 const token=++epoch;
 try{const audio=await buffer();if(token!==epoch||!enabled||!allowed()||source)return;const next=context.createBufferSource();gain=context.createGain();next.buffer=audio;next.loop=true;gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime(.32,context.currentTime+1);next.connect(gain);gain.connect(context.destination);started=context.currentTime;source=next;next.start(0,offset%audio.duration);}catch(error){if(token!==epoch)return;enabled=false;label();toggle.textContent='Müziği yeniden dene';}}
async function setEnabled(value){enabled=value;label();if(!enabled){stop();return;}const token=++epoch;try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw Error('Audio unsupported');if(!context)context=new Context();await context.resume();if(token!==epoch||!enabled)return;sync();}catch(error){if(token!==epoch)return;enabled=false;label();toggle.textContent='Müziği yeniden dene';}}
toggle.addEventListener('click',()=>setEnabled(!enabled));
// Existing chapter sound buttons also authorize the reading soundtrack.
document.getElementById('chapter2018-sound').addEventListener('click',()=>setEnabled(document.getElementById('chapter2018-sound').getAttribute('aria-pressed')==='true'));
document.getElementById('memory-sound').addEventListener('click',()=>{const playing=document.getElementById('memory-sound').getAttribute('aria-pressed')==='true';setEnabled(!playing);},true);
schoolAudio.addEventListener('play',()=>{if(reading(chapter2017,document.getElementById('memory-story')))schoolAudio.pause();});
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;sync();});}
chapter2017.addEventListener('scroll',schedule,{passive:true});chapter2018.addEventListener('scroll',schedule,{passive:true});pandemic2020.addEventListener('scroll',schedule,{passive:true});
const observer=new MutationObserver(()=>sync());for(const element of [chapter2017,chapter2018,panel,summer,school2019,pandemic2020])observer.observe(element,{attributes:true,attributeFilter:['class']});
// Capture the original timeline activation so music stops before opening a destination.
document.getElementById('track').addEventListener('click',event=>{if(event.target.closest('.node'))stop();},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(enabled&&context)context.resume().then(()=>sync()).catch(()=>{});});
window.NehirPiano={setEnabled,sync};
addEventListener('pagehide',stop);addEventListener('resize',schedule);label();
})();

