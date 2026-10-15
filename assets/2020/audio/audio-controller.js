/* Approved 2020 recordings. Keep every outgoing source tracked until it stops. */
(() => {
'use strict';
const root = document.getElementById('pandemic2020');
const slides = document.getElementById('pandemic2020-slides');
const button = document.getElementById('pandemic2020-sound');
const status = document.getElementById('pandemic2020-audio-status');
if (!root || !slides || !button) return;
const version = '20261015-approved-v2';
const tracks = Object.freeze({
  '01_online.webp': '01_online.mp3',
  '02_coffee.webp': '02_coffee.mp3',
  '03_anime.webp': '03_anime.mp3',
  '04_study.webp': '04_study.mp3',
  '05_school.webp': '05_school.mp3',
  '06_friends.webp': '06_friends.mp3'
});
const sources = new Set();
const cache = new Map();
let enabled = false, ctx = null, epoch = 0, selected = null, active = null;
let readingState = false;
const isOpen = () => root.classList.contains('is-open');
function isReading() {
  const story = root.querySelector('#pandemic2020-story');
  if (!story || !isOpen()) return false;
  // Match the existing gallery's transition into its story area.
  return root.scrollTop > root.clientHeight * .45;
}
function currentTrack() {
  const images = slides.querySelectorAll('figure img');
  const i = Math.max(0, Math.min(images.length - 1,
    Math.round(slides.scrollLeft / (slides.clientWidth || 1))));
  const path = images[i]?.getAttribute('src') || '';
  return tracks[path.split('/').pop()] || null;
}
const canPlay = () => enabled && ctx && isOpen() && !document.hidden && !isReading();
function message(text) { if (status) status.textContent = text; }
function label() {
  button.disabled = false;
  button.textContent = enabled ? 'Sesi kapat' : 'Sesi aç';
  button.setAttribute('aria-pressed', String(enabled));
  button.setAttribute('aria-label', enabled ? '2020 ortam sesini kapat' : '2020 ortam sesini aç');
}
function dispose(node) {
  if (!sources.has(node)) return;
  sources.delete(node);
  clearTimeout(node.timer);
  node.source.onended = null;
  try { node.source.stop(); } catch (_) {}
  node.source.disconnect();
  node.gain.disconnect();
  if (active === node) active = null;
}
function halt() {
  ++epoch;
  selected = null;
  for (const node of [...sources]) dispose(node);
}
function fadeOut() {
  if (!active || !ctx) return;
  const node = active;
  active = null;
  const gain = node.gain.gain, now = ctx.currentTime;
  if (gain.cancelAndHoldAtTime) gain.cancelAndHoldAtTime(now);
  else { gain.cancelScheduledValues(now); gain.setValueAtTime(gain.value, now); }
  gain.linearRampToValueAtTime(0, now + .22);
  try { node.source.stop(now + .24); } catch (_) {}
  node.timer = setTimeout(() => dispose(node), 300);
}
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const promise = fetch('assets/2020/audio/' + file + '?v=' + version)
    .then(response => {
      if (!response.ok) throw Error('Audio HTTP ' + response.status);
      return response.arrayBuffer();
    }).then(bytes => ctx.decodeAudioData(bytes));
  cache.set(file, promise);
  promise.catch(() => { if (cache.get(file) === promise) cache.delete(file); });
  return promise;
}
async function sync() {
  const reading = isReading();
  if (reading !== readingState) {
    readingState = reading;
    window.NehirPiano?.sync();
  }
  if (!canPlay()) { halt(); return; }
  const file = currentTrack();
  if (!file) { halt(); message('Bu görsel için ses bulunamadı.'); return; }
  if (selected === file) return;
  selected = file;
  const token = ++epoch;
  fadeOut();
  message('Ses yükleniyor…');
  try {
    const buffer = await load(file);
    if (token !== epoch || !canPlay() || currentTrack() !== file) return;
    const source = ctx.createBufferSource(), gain = ctx.createGain();
    const node = { source, gain, timer: null };
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    // Unity preserves the exact mix level approved in the previews.
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + .5);
    sources.add(node);
    active = node;
    source.onended = () => dispose(node);
    source.start();
    message('');
    // Bound decoded-buffer memory while retaining the current and recent scene.
    while (cache.size > 2) {
      const oldest = [...cache.keys()].find(key => key !== file);
      cache.delete(oldest);
    }
  } catch (_) {
    if (token !== epoch) return;
    halt();
    enabled = false;
    label();
    message('Ses yüklenemedi. Yeniden denemek için Sesi aç düğmesine bas.');
  }
}
button.addEventListener('click', async () => {
  enabled = !enabled;
  label();
  message('');
  halt();
  if (!enabled) return;
  const token = epoch;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    await ctx.resume();
    if (token !== epoch || !enabled) return;
    sync();
  } catch (_) {
    if (token !== epoch) return;
    enabled = false;
    halt();
    label();
    message('Ses başlatılamadı. Yeniden deneyebilirsin.');
  }
});
slides.addEventListener('scroll', sync, { passive: true });
root.addEventListener('scroll', sync, { passive: true });
new MutationObserver(() => {
  halt();
  readingState = isReading();
  window.NehirPiano?.sync();
  if (isOpen()) sync();
}).observe(root, { attributes: true, attributeFilter: ['class'] });
document.addEventListener('visibilitychange', () => {
  halt();
  if (document.hidden || !enabled || !isOpen() || !ctx) return;
  const token = epoch;
  ctx.resume().then(() => { if (token === epoch) sync(); }).catch(() => {});
});
addEventListener('pagehide', halt);
window.Nehir2020Audio = { readingReady: () => !document.hidden && isReading(), sync };
label();
})();
