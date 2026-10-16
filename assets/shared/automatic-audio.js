/* Legacy audio state nodes are hidden noninteractive spans; retain existing scene mappings. */
(() => {'use strict';
const albums=[['memory2017','open','memory-sound'],['chapter2018','is-open','chapter2018-sound'],['summer2018','is-open','summer-sound'],['school2019','is-open','school2019-sound'],['pandemic2020','is-open','pandemic2020-sound']];
function activate(event){
 if(event?.type==='keydown'&&!['Enter',' '].includes(event.key))return;
 // This runs inside the original user gesture, after the album's own opening handler.
 for(const [id,cls,stateId] of albums){const root=document.getElementById(id),state=document.getElementById(stateId);if(root?.classList.contains(cls)&&state?.getAttribute('aria-pressed')!=='true')state?.click();}
 window.NehirPiano?.setEnabled(true);
}
document.addEventListener('click',activate);
document.addEventListener('keydown',activate);
})();
