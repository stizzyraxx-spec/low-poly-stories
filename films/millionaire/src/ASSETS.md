# The Millionaire Who Lost Everything — assets

Everything is generated in code. There are no imported models, textures or
image files: the whole film is geometry built at load time from the modules
below, which is why the finished piece is a single HTML file.

## Modules

| Path | What it holds |
|---|---|
| `materials/palette.js` | Every colour in the film, named by role |
| `characters/rig.js` | The one jointed body all six speakers are built from |
| `characters/cast.js` | Who exists, how they differ, where they stand per scene |
| `animations/perform.js` | Breath, blink, walk, weight shift, the speech-envelope jaw |
| `animations/acts.js` | 46 named actions, one per spoken line |
| `animations/beats.js` | The shot list; `t`/`d` written from `aligned.json` |
| `environments/sets.js` | Five sets plus the shared skyline and props |
| `lighting/moods.js` | 13 lighting states and the light rig |
| `cameras/solve.js` | Shot builders that derive framing from live positions |
| `cameras/shots.js` | The shot library and the mid-line subcuts |
| `scripts/transport.js` | The clock: audio-driven live, exact 1/30s in render |
| `scripts/frame.js` | One frame: pose, camera, light, effects, draw |
| `build.py` | Assembles all of the above into the two output files |
| `align.py` | Produces `aligned.json` from the narration + script |

## Reusable across episodes

These carry to another Modern-Day Parables film unchanged:

- **`rig.js`** — `modern: true` gives trousers and an optional suit jacket,
  tie and wristwatch; omit it for period dress. Every joint is the same
  either way, so `perform.js` and `acts.js` work on both.
- **`perform.js`** — nothing in it is specific to this story.
- **`solve.js`** — `cu`, `two`, `over`, `wideOn`, `hero`, `lookUp`, `orbitOn`.
- **`transport.js`** — the audio-as-clock transport and the render stepping.
- **`buildSkyline()`** — one deterministic city, seeded, so every set that
  can see it shows the same towers from different windows.
- **`buildOffice`, `buildHospital`, `buildResidence`, `buildApartment`,
  `buildStreet`** — all parameterless and independent of this script.

## Characters

| Who | Build | Notes |
|---|---|---|
| The man | `modern`, navy jacket, charcoal trousers, tie, watch | Built ONCE and reused in all 12 scenes |
| Assistant | `modern`, blouse, dark jacket | Composed, then increasingly anxious |
| Wife | `modern`, blouse | Grief, frustration, then quiet support |
| Doctor | `modern`, scrubs + coat | One line, carries the worst news in the film |
| Friend | `modern`, jacket over an open shirt, bearded | Sympathetic, then accusatory |
| 8 extras | varied height, build, skin, hair, dress | Hospital staff and pedestrians |

The son is never modelled. He appears only in the framed photograph, as
three flat shapes — two adults and a child — because a rendered face at that
scale would read worse than a suggestion, and the brief asks for no graphic
depiction of the accident.

### The man's progression

Applied through one `setDecline(C, level)` so it cannot get out of step:

| | Scenes 1–4 | Scenes 5+ |
|---|---|---|
| Jacket | navy, worn | removed |
| Trousers | charcoal suit | plain |
| Watch | on the left wrist | off, from scene 7 |
| Posture | upright | a slump floor he cannot straighten past until scene 10 |

His face, proportions and identity never change.

## Recurring objects

- **The watch** — status in scene 1, taken off in scene 6, and the bare wrist
  is its own shot (`aWrist`) in scene 11.
- **The family photograph** — in the luxury house, then moved to a small
  shelf in the apartment. He looks at it in scene 8.
- **The window** — floor-to-ceiling glass in the office, panoramic in the
  house, a small frame in the apartment.
- **The skyline** — the same towers throughout, from each window in turn.
