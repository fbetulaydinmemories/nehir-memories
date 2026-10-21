# Son Kitap light transition

`NehirLastBookTransition.play(button)` runs a 4.8 second Canvas transition (650 ms fade with reduced motion). With no registered, ready gallery it returns to the existing timeline without opening the placeholder panel. Escape, the close control, backgrounding the tab and a 6.5 second watchdog always remove the overlay and restore focus/scrolling. Each entry creates a new, disposable canvas; no audio APIs are called.

## Connect the completed gallery

After all 41 approved images and the final approved story have been installed, register the real gallery root and opener:

```js
NehirLastBookTransition.register({
  count: 41,
  root: lastBookGallery,
  ready: () => firstPhotoDecoded && approvedAlbumInstalled,
  open: button => openCompletedLastBookAtFirstPhoto(button)
});
```

`ready()` must return boolean `true` only when the first photo can be shown immediately and the complete album/story is installed. Preload/decode outside the transition. The synchronous opener resets to photo 1, adds `is-open` to the root, makes the timeline inert, focuses the real gallery control and owns its normal scroll lock/return behavior. It must not stop, restart or adjust the existing piano; do not register this root in any scene-audio catalog. The existing piano guard recognizes this registered open root and permits music across both images and story. Calling the returned unregister function removes the integration.

No image, story, placeholder gallery or sound is supplied by this component. Until registration the infinity timeline node plays the transition and returns to the timeline. Other album routes and sound catalogs are unchanged.


## Completed album (22 October 2026)

The 41 distinct approved sources are installed. gallery.js registers the actual gallery; scenes.json and report.md contain the ordered source mapping. First-photo decoding gates transition handoff. Other images load lazily; missing image responses are excluded at runtime rather than showing broken image boxes. The last next-arrow is hidden. No approved closing text was recoverable; the album ends at the original moonlit shore illustration. No audio code or catalog was changed for this album.
