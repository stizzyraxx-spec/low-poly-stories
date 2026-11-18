# Narration for You Are the Man

The film is cut to `narration.mp3` — the Oliver Silk read of the Nathan and
David script (178.13s, 29 lines, two speakers).

`align.py` regenerates `aligned.json` from `narration.mp3` + `script_lines.txt`:
silence detection finds the speech regions, then each line claims a share of
that speech weighted by its syllable count, so the cuts and performances are
keyed to when words are actually said.

## Replacing the narration

1. Drop the new file in as `narration.mp3`.
2. `python3 -I align.py` — rewrites `aligned.json`.
3. Copy the new `t`/`d` values into `beats.js` (camera, mood and action
   choices stay as they are; only the timings change).
4. `python3 -I build.py` — `DURATION` is read from the audio, not hardcoded.
5. Re-render and encode.

## A note on checking the audio first

An earlier pass built this film against a recording that turned out to narrate
the book of Job. Duration and speech-rate arithmetic could not tell the two
apart. What does: a two-hander leaves long pauses at every speaker change,
while a single narrator does not. The Job read had 1 pause over 1.0s; this one
has 34. Run that check before trusting a new file.
