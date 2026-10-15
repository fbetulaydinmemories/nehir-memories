# 2021–2024 New Year scene audio delivery

43 separate 14-second stereo MP3 mixes: 2021 (11), 2022 (21), 2023 (7), 2024 New Year (4). Each year stores its MP3s, exact source-event timelines and technical checks under `assets/<year>/audio/`. `scene-audio-map.json` records each image-to-audio association in gallery order. New Year ends with fireworks; the straw game precedes it.

## Sources and sound design

Recordings from Freesound, BigSoundBank and SoundBible were edited into individual compositions. Source URLs, authors, licenses and available downloaded-file hashes are in `scene-audio-licenses.json`; the visible “Ses kaynakları” link opens full attribution including modifications and license links. The crying recording by Daniel Simon is CC BY 3.0. Other used recordings are CC0/public-domain-equivalent. No downloaded music, TV drama dialogue, imitation of Betül/Nehir, or AI-generated voice was used. The distant party rhythm and nonverbal camera countdown beeps are project-original procedural effects, used only in the relevant scenes.

Conversation recordings are assembled as short fragments, overlapped and frequency-filtered to avoid foreground sentences. Quiet laughter, sniffing and crying are separate real recordings. Object sound design includes Foley substitutions: plastic packaging movement for badge sleeves, small wood impacts for chess placement, and mechanical controls for production equipment. These are designed general-purpose soundscapes, not documentary recordings of the actual locations or people.

## Integration and protection

One independent shared controller observes the existing galleries; no gallery JavaScript, images, scene order, stories, timeline nodes, or 2020 audio was overwritten. Main HTML adds one controller script and updates its/piano cache versions. Piano permission changes only for the four new albums, allowing existing stories while blocking illustration sound overlap. Playback starts after the user's album interaction. The added sound toggle provides a retry path if the browser blocks audio. Closing, hiding the tab and entering a story stop scene audio; revisiting an image restarts it. Rapid navigation invalidates pending decodes. Short gain ramps accompany switches; a single manager prevents overlapping scene playback.

## Verification

Every final MP3 was decoded end-to-end and measured with ffprobe/FFmpeg. Per-year `technical-checks.json` contains duration, codec, channels, loudness, peak and SHA-256. All 43 hashes are distinct. Output is 44.1 kHz stereo, 128 kb/s MP3, approximately 14 seconds, with 0.45-second edge fades. Most mixes target -22 LUFS, with the quiet crying scene targeting -26 LUFS; measured values vary with dynamics.

Automated controller tests cover every image mapping, opening, next/previous changes, rapid navigation, story entry/return, tab visibility and closing. The mock run permits at most one playing source. Live desktop checks additionally verify loading and gallery controls; final live-file byte checks are performed after deployment.

## Limits

Technical decoding, level measurements and playback-state checks are not a subjective listening approval. The assistant could not directly audition the perceived naturalness, speech intelligibility, loop seamlessness or emotional balance of all 43 mixes. A real mobile device, Safari/iOS and headphones/speaker differences were not tested. These points remain unverified; the delivery must not be described as fully auditioned or universally browser-certified.

## Staged commits

- 2021: `5cf51026175d521d0bdb082208f1cf1094e6654f`
- 2022: `3b0819833c7aadc3d9e5dd9a6e935f17f09dc855`
- 2023 and refined conversational fragments: `06c6ad792a18c37eaf9072b0756be575ab0af964`
- The following New Year integration commit also contains this report and the final four mappings.
