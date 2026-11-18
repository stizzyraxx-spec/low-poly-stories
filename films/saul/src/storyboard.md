# The Conversion of Saul — storyboard

Runtime **3:19 (198.97s)**, 41 lines, 8 voices, 5,970 frames at 30fps.
Every time below is a **measured speech onset** from `aligned.json`, not an
estimate: `align.py` groups the 103 detected speech spans one group per line
and takes each group's first onset. Scene cuts are placed on line onsets, so
a transition can never land before its line is spoken.

No captions — the series convention. The voice carries it.

| # | Scene | In | Out | Lines | Light / palette |
|---|---|---|---|---|---|
| 1 | Persecution in Jerusalem | 0.00 | 20.88 | 1–3 | warm sandstone, turning ominous |
| 2 | Leaving for Damascus | 20.88 | 38.02 | 4–6 | open noon, dust, long shadows |
| 3 | **The blinding light** | 38.02 | 58.45 | 7–12 | white-gold blowout, exposure ramp |
| 4 | Blindness | 58.45 | 72.88 | 13–16 | desaturating to black, then external |
| 5 | Three days in darkness | 72.88 | 82.13 | 17 | low-key lamp, three day/night passes |
| 6 | Ananias' vision | 82.13 | 108.75 | 18–23 | soft gold fill in a dark room |
| 7 | Sight restored, baptism | 108.75 | 145.82 | 24–32 | cold → warm as scales fall |
| 8 | Preaching in Damascus | 145.82 | 192.64 | 33–40 | bright public courtyard |
| 9 | The sunlit road (moral) | 192.64 | 198.97 | 41 | sunrise, pull up and back |

## Scene detail

**1 — Persecution (0.00–20.88)**
Aerial establishing descent into a crowded street; sandstone, stalls, awnings,
pottery, stairways, distant walls. Track Saul through the street with armed
escorts. CU on his stern face for line 1. Reaction shots of frightened
Christians on line 2 (the only CHRISTIAN line — give it a face). Wide on the
consequences for line 3. No graphic violence: fear, confusion, urgency.

**2 — The road (20.88–38.02)**
Companion's question (line 4) over-shoulder. Saul's "To Damascus" (line 5,
10.5s — the longest beat so far) carries the journey: follow-cam from behind,
then a wide aerial of the road to the horizon. Sandal dust, wind in fabric.

**3 — The blinding light (38.02–58.45) — the centrepiece**
Line 7 is the onset: volumetric white-gold shaft, controlled exposure ramp,
bloom, lit dust, hard rock shadows. Saul shields his eyes and falls. Camera
orbits from wide to intimate CU. Jesus is **light and voice only, no figure**
(lines 8, 10, 12). On line 9 ("Who are you, Lord?" — 1.12s, the shortest beat
in the film) hold the CU and let the light dominate. **No strobing**: all
exposure changes eased over >=0.5s, nothing alternating faster than 3Hz.

**4 — Blindness (58.45–72.88)**
Subjective: progressive blur, colour draining, to black. Return external —
Saul reaching into empty space, hesitant steps, searching hands, lowered head.
Companions take his hands (line 16) and guide him on.

**5 — Three days (72.88–82.13)**
Interior: plastered walls, wooden furniture, oil lamps, woven rugs, clay jugs,
narrow windows. Saul praying in low key. Three day/night cycles pass across
line 17's 9.2s. Camera creeps closer. No other action.

**6 — Ananias' vision (82.13–108.75)**
Second interior. "Ananias!" (line 18, 1.11s) lands as soft gold fills the room.
CU on face and hands through his protest (line 21) and the Lord's answer
(line 22, 7.8s). Fear to obedience. He stands, gathers his cloak, leaves.

**7 — Sight restored (108.75–145.82)**
Straight Street. Ananias enters, kneels, lays on hands. On line 28 ("Receive
your sight") a warm glow rises and stylised translucent fragments fall from
Saul's eyes — non-graphic. Saul blinks repeatedly; vision clears; he sees
Ananias. Baptism on line 30. Emotional turn carried by brow, eyes, posture,
breathing.

**8 — Preaching (145.82–192.64)**
Synagogue courtyard: stone construction, columns, wooden benches. Saul
declares (line 33). Citizens recognise him (34, 35) — whispering, pointing.
Line 36 is the film's longest beat at 13.8s: alternate Saul speaking, CUs of
surprised faces, over-shoulder from the crowd, wide on a growing audience.
Hero low-angle on line 38.

**9 — The road (192.64–198.97)**
Saul walking a sunlit road. Camera pulls up and back to reveal the landscape.
Warm sunrise. Closing text over the last beat:

> No one is beyond redemption. God's grace can transform even the hardest heart.

Fade to black.

## Known limitation

No forced aligner is available on this machine, so there is **no
phoneme-accurate lip sync**. Mouth and jaw motion is driven per line from the
measured speech envelope — mouths open only while that line is actually being
spoken, and close in its pauses — which reads correctly at these shot sizes
but is not viseme-matched. Stated rather than implied, per the brief.
