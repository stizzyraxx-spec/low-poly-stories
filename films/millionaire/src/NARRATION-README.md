# Narration — The Millionaire Who Lost Everything

`narration.mp3` is the Oliver Silk "British Deep Gravel" read supplied
2026-11-18 19:04 (`uploads/ElevenLabs_2026-11-18T19_04_12_...mp3`), 228.28s.

## This is NOT the 155s file

`uploads/ElevenLabs_2026-11-18T05_41_17_Stizzop_...mp3` (155.25s) is a
DIFFERENT recording. It was briefly a candidate for this film and is not it:
64 speech spans for 46 lines at 4.58 words/sec, against this track's 101 spans
at 3.06 words/sec. Do not build from the 155s file.

## Verifying a replacement

Before aligning any new recording, confirm it actually contains this script —
duration alone cannot tell two scripts apart, and on 2026-11-18 a film was
built, rendered and published against the wrong narration because that check
was skipped.

    ffmpeg -hide_banner -nostats -i narration.mp3 \
      -af silencedetect=noise=-35dB:d=0.25 -f null - 2>&1 | grep -c silence_start

Expect ~100 spans for these 46 lines, a speech rate near 3 w/s, and a final
beat of roughly 18s for the closing narration, which is the longest single
line in the script by a wide margin and the easiest fingerprint to check.
