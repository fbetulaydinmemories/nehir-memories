/* 2018 audio only. No changes to 2017 audio or approved navigation. */
(() => {
'use strict';
const chapter=document.getElementById('chapter2018');
const slides=document.getElementById('chapter2018-slides');
const button=document.getElementById('chapter2018-sound');
const status=document.getElementById('chapter2018-audio-status');
const sources=['library.mp3','exam.mp3','classroom.mp3','gymnasium.mp3','corridor.mp3','reading-piano.mp3'];
const levels=[.55,.5,.45,.5,.45,.32];
class ChapterAudio {
 constructor(){this.enabled=false;this.context=null;this.buffers=new Map();this.voices=new Map();this.offsets=new Map();this.epoch=0;this.target=-1;this.fade=1.6;this.frame=0;}
 active(){return chapter.classList.contains('is-open')&&!document.hidden&&!document.getElementById('memory2017').classList.contains('open');}
 location(){return chapter.scrollTop>chapter.clientHeight*.45?5:Math.max(0,Math.min(4,Math.round(slides.scrollLeft/(slides.clientWidth||1))));}
 volume(scene){let volume=levels[scene];if(scene===4){const progress=chapter.scrollTop/(chapter.clientHeight||1);volume*=Math.max(.25,1-progress*1.5);}return volume;}
 label(){button.textContent=this.enabled?'Ses açık':'Ses kapalı';button.setAttribute('aria-pressed',String(this.enabled));button.setAttribute('aria-label',this.enabled?'2018 sesini kapat':'2018 sesini aç');}
 async toggle(){this.enabled=!this.enabled;this.label();status.textContent='';if(!this.enabled){this.stop();return;}const intent=++this.epoch;try{const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)throw Error('AudioContext unsupported');if(!this.context)this.context=new AudioContextClass();await this.context.resume();if(intent!==this.epoch||!this.enabled)return;this.sync();}catch(error){if(intent!==this.epoch)return;this.enabled=false;this.label();this.stop();status.textContent='Ses başlatılamadı. Yeniden deneyebilirsin.';}}
 async buffer(scene){if(!this.buffers.has(scene)){const request=fetch('assets/2018/audio/'+sources[scene]).then(response=>{if(!response.ok)throw Error('Audio HTTP '+response.status);return response.arrayBuffer();}).then(bytes=>this.context.decodeAudioData(bytes));this.buffers.set(scene,request);request.catch(()=>this.buffers.delete(scene));}return this.buffers.get(scene);}
 ramp(voice,value,duration){const now=this.context.currentTime;const gain=voice.gain.gain;const elapsed=Math.max(0,Math.min(1,(now-voice.rampStart)/Math.max(.001,voice.rampDuration)));const held=voice.from+(voice.to-voice.from)*elapsed;gain.cancelScheduledValues(now);gain.setValueAtTime(held,now);gain.linearRampToValueAtTime(value,now+duration);voice.from=held;voice.to=value;voice.rampStart=now;voice.rampDuration=duration;}
 dispose(voice){clearTimeout(voice.timer);if(this.voices.get(voice.scene)!==voice)return;this.voices.delete(voice.scene);this.offsets.set(voice.scene,(voice.offset+this.context.currentTime-voice.started)%voice.buffer.duration);try{voice.source.stop();}catch(error){}voice.source.disconnect();voice.gain.disconnect();}
 stop(){this.epoch++;this.target=-1;for(const voice of [...this.voices.values()])this.dispose(voice);}
 schedule(){if(this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=0;this.sync();});}
 async sync(){if(!this.enabled||!this.context||!this.active()){if(this.voices.size||this.target!==-1)this.stop();return;}
 const scene=this.location();const level=this.volume(scene);
 if(scene===this.target){const voice=this.voices.get(scene);if(voice&&Math.abs(voice.to-level)>.015)this.ramp(voice,level,.3);return;}
 this.target=scene;const epoch=++this.epoch;
 try{const buffer=await this.buffer(scene);if(epoch!==this.epoch||!this.enabled||!this.active()||scene!==this.location())return;status.textContent='';
 let incoming=this.voices.get(scene);
 if(incoming){clearTimeout(incoming.timer);incoming.timer=null;}
 else {const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain);gain.connect(this.context.destination);const offset=(this.offsets.get(scene)||0)%buffer.duration;incoming={scene,source,gain,buffer,offset,started:this.context.currentTime,from:0,to:0,rampStart:this.context.currentTime,rampDuration:0,timer:null};this.voices.set(scene,incoming);source.start(0,offset);}
 // Retain at most one outgoing voice during a rapid series of gestures.
 const outgoing=[...this.voices.values()].filter(voice=>voice!==incoming);for(const voice of outgoing.slice(0,-1))this.dispose(voice);
 this.ramp(incoming,this.volume(scene),this.fade);
 for(const voice of outgoing.slice(-1)){clearTimeout(voice.timer);this.ramp(voice,0,this.fade);voice.timer=setTimeout(()=>this.dispose(voice),(this.fade+.08)*1000);}
 }catch(error){if(epoch!==this.epoch)return;this.target=-1;for(const voice of [...this.voices.values()])this.dispose(voice);status.textContent='Bu sahnenin sesi yüklenemedi. Sesi kapatıp açarak yeniden deneyebilirsin.';}}
}
const controller=new ChapterAudio();button.addEventListener('click',()=>controller.toggle());
slides.addEventListener('scroll',()=>controller.schedule(),{passive:true});chapter.addEventListener('scroll',()=>controller.schedule(),{passive:true});
new MutationObserver(()=>controller.sync()).observe(chapter,{attributes:true,attributeFilter:['class']});
new MutationObserver(()=>controller.sync()).observe(document.getElementById('memory2017'),{attributes:true,attributeFilter:['class']});
// Stop immediately through both the return button and Escape; preference persists.
document.getElementById('chapter2018-return').addEventListener('click',()=>controller.stop());
chapter.addEventListener('keydown',event=>{if(event.key==='Escape')controller.stop();},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden)controller.stop();else if(controller.enabled&&controller.active()){controller.context?.resume().then(()=>controller.sync()).catch(()=>{controller.enabled=false;controller.label();status.textContent='Devam etmek için sesi tekrar aç.';});}});
addEventListener('pagehide',()=>controller.stop());addEventListener('resize',()=>controller.schedule());
// Include the new controls in the existing chapter's focus loop.
chapter.addEventListener('keydown',event=>{if(event.key!=='Tab')return;event.stopImmediatePropagation();const controls=[...chapter.querySelectorAll('button,[tabindex="0"],a[href]')].filter(element=>!element.disabled&&!element.hidden&&element.getClientRects().length);if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}},true);
controller.label();
})();
