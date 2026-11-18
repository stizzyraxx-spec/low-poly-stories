# The Millionaire Who Lost Everything — storyboard

Runtime **3:48 (228.28s)**, 46 lines, 6 voices, 6,849 frames at 30fps.
Every time below is a **measured speech onset** from `aligned.json`.

Runtime is **over the brief's three-minute target**. No dialogue is trimmed
to reach it; the recording is the authority, as the brief requires.

No captions — the series convention.

| # | Scene | In | Out | Lines | Light |
|---|---|---|---|---|---|
| 1 | The empire (office) | 0.00 | 6.54 | 1–2 | warm daylight, floor-to-ceiling glass |
| 2 | The collapse | 6.54 | 31.48 | 3–8 | warmth draining, cool fill rising |
| 3 | The phone call / transit | 31.48 | 40.77 | 9–11 | overcast, moving |
| 4 | The hospital | 40.77 | 53.24 | 12–14 | cold fluorescent, clinical |
| 5 | The empty house (night) | 53.24 | 84.63 | 15–19 | blue-grey, isolated warm lamps, rain |
| 6 | *(montage inside 5→7)* | — | — | — | loss of the house, boxes, the watch |
| 7 | The judgmental friend | 84.63 | 111.12 | 20–26 | modest apartment, flat evening |
| 8 | The crisis of faith | 111.12 | 133.41 | 27–29 | quiet, subdued, window light |
| 9 | What remains | 133.41 | 167.50 | 30–38 | warming by degrees, city alive outside |
| 10 | The decision to continue | 167.50 | 191.70 | 39–41 | first warmth on his face |
| 11 | The meaning of blessings | 191.70 | 210.20 | 42–45 | intimate, alternating CUs |
| 12 | A new beginning (sunrise) | 210.20 | 228.28 | 46 | sunrise, pull back and up |

## Notes per scene

**1–2 (0.00–31.48)** Aerial on the skyline, push to the tower, interior
reveal. The assistant enters on line 1. The collapse runs lines 3–8: tablet
CU with a falling chart (fictional data, no real tickers), CU on his eyes,
low angle on "Bankruptcy?", then a wide that isolates him in a too-large
office. Warm key cools across the scene; nothing cuts on the change.

**3 (31.48–40.77)** The call. Short shots only: office → lobby → garage →
street → hospital entrance. Urgency through cutting rate, not speed. No
dangerous driving.

**4 (40.77–53.24)** Corridor, waiting area, the doctor. On line 13 hold the
camera on the father's face, not the doctor's. He stumbles, then goes down.
The wife reaches him. Background staff deliberately out of focus and distant.

**5 (53.24–84.63)** The luxury residence at night, rain on glass, city below.
Line 15 is 10.9s — his longest speech yet; let it play with few cuts. The
family photograph is in frame but never pushed. Lines 16 and 18 are the
wife's hardest words; she is exhausted, not cruel.

**6 montage** Folded into the 5→7 transition: boardroom empty, boxes, the
closure notice, the watch coming off, the truck. Then the modest apartment,
which is the second half's home.

**7 (84.63–111.12)** The friend arrives, takes in the room. Two-shot, then
over-shoulders. His face hardens across lines 22–26 while his voice stays
friendly. Line 24 (7.7s) is where sympathy turns to accusation.

**8 (111.12–133.41)** The emotional centre. Line 27 (9.7s) and line 29 (9.8s)
both play long. He looks at the photograph; camera creeps in. No divine
voice, no vision — this is a man wrestling, not receiving an answer.

**9 (133.41–167.50)** He goes to the window. Outside the city carries on —
pedestrians, traffic, lit windows. Warmth enters by degrees, never a cut from
night to day. Line 39 at 14.9s is the film's longest; it belongs to scene 10.

**10 (167.50–191.70)** He sits beside his wife and takes her hand. First
upright posture since the hospital. Still sad. Not healed.

**11 (191.70–210.20)** Alternating close-ups. The friend lowers his eyes.
The bare wrist where the watch was, held briefly, once.

**12 (210.20–228.28)** Morning. Simple clothes, a pause at the photograph, a
look exchanged with his wife, then the street: shops, pedestrians, long soft
shadows. Camera pulls back and up. Closing text over the last beat:

> Faith isn't about having everything. It's about trusting God when
> everything falls apart.

and smaller:

> Inspired by the Book of Job

## Deliverables and limits

Produced: the final MP4 (1280×720), a vertical cut, this storyboard, the
asset and validation notes, and the editable single-file source.

**Not produced: `.blend` and `.glb`.** Blender 4.2.3 is installed on this
machine but there is no GPU; a film-shaped scene benchmarks at ~60s/frame at
720p under Cycles, which is 4+ days for this film and more with volumetrics,
against a disk with single-digit GB free. The Three.js pipeline renders the
same film in roughly half an hour. Said plainly rather than quietly skipped.

**No phoneme-accurate lip sync.** No forced aligner is available, so the jaw
is driven by the measured speech envelope per line. It reads at these shot
sizes; it is not viseme-matched.
