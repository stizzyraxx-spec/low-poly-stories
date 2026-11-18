# Narration for You Are the Man

**This film has no narration recording yet.**

`WRONG-job-narration.mp3` is the ElevenLabs file from `uploads/`
(`ElevenLabs_2026-11-18T05_41_17_...mp3`, 155.25s). It narrates the story of
**Job**, not Nathan and David. The film was aligned against it by mistake:
`aligned.json` and `beats.js` carry 29 Nathan/David lines timed to Job's
speech segments, so the lip-sync, cuts and lighting are all keyed to the
wrong words.

The picture is correct and finished (throne room, Nathan standing, David
seated, no bar props, no captions). Only the timing is wrong.

## When the real narration arrives

1. Drop it in as `narration.mp3`.
2. Re-run the alignment that produced `aligned.json` (silencedetect ->
   speech segments -> syllable-weighted per-line split over `script_lines.txt`).
3. Regenerate `beats.js`, then `python3 -I build.py`.
4. Re-render and encode. Nothing in the set, rigs or staging needs changing.

Do not encode against `WRONG-job-narration.mp3`.
