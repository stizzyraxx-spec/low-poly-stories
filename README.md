# Low Poly Stories

Short animated films built as self-contained web pages: faceted low-poly 3D in
Three.js, driven by a narration track, rendered offline to video.

Every film here is one HTML file. Open it in a browser and it plays — no build
step, no server, no dependencies to install. The same file can also be rendered
frame-by-frame to an MP4.

## Films

### Two Fathers (4:44)

An atheist and a pastor at closing time. Two men discover they have buried a
child each.

| | |
|---|---|
| **Watch** | [`films/two-fathers/index.html`](films/two-fathers/index.html) — open in any browser |
| **Download** | [Releases](../../releases) — 1280×720 MP4, 43 MB |
| **Runtime** | 4:44 (284.45s), 8,533 frames at 30fps |

The narration drives everything. Silence detection over the voice track finds
every speech segment, each script line is aligned to the window where it is
actually spoken, and the camera cuts, performances and captions are keyed to
that — not to guessed timings. At runtime the `<audio>` element is the master
clock, so picture and sound cannot drift.

## How a film is built

The whole piece is one page. Nothing is pre-baked: the bar, both characters and
every performance are generated in code and animated per frame.

**The set** is a few hundred triangles — bar, back shelves, bottles, pendant
lamps, stools, a door. Flat shading throughout, no textures.

**The characters** are jointed rigs (hips → torso → chest → neck → head, plus
shoulder and elbow joints per arm, hip and knee per leg). Emotion is carried by
brow angle, eyelid position, jaw and spine curve — there are no facial textures
and no blend shapes.

**Nothing is ever still.** Both men breathe continuously, shift weight, blink on
independent randomized timers, and their pupils micro-dart. Jaws are driven by a
syllable envelope so whoever is speaking is visibly speaking. Each camera has its
own handheld drift plus a slow push-in, and the lens breathes. Bulbs flicker on
separate cycles and sway, dragging their shadows. Dust rises through the light.
The bartender works the back bar for the entire film.

**Lighting carries the arc.** A mood table interpolates every light, plus fog
depth, across the story: warm amber at the open, draining cold and tightening
through the grief passage, one warm pool returning at the end.

## Rendering to video

The page exposes a deterministic render mode: instead of a `requestAnimationFrame`
loop it advances in fixed 1/30s steps, so output is frame-accurate and identical
on every run.

```bash
npm install playwright      # needs Chrome available
cd films/two-fathers/src

./shard.sh                  # renders all frames (3 parallel browsers)
./mux.sh /path/to/narration.mp3
```

`shard.sh` splits the timeline across three headless Chrome instances.
`mux.sh` encodes the frames with x264 (CRF 19) and muxes in the narration.

Expect roughly an hour on a machine without a GPU — Chrome falls back to
SwiftShader software rasterization. With a real GPU it is far quicker.

### Two traps worth knowing

Both of these cost real time to find, and neither produces an error message.

**`page.screenshot()` captures the compositor, not the WebGL backbuffer.**
Three.js clears the drawing buffer after each render, so screenshots come back
byte-identical while the scene is plainly animating. Use
`preserveDrawingBuffer: true` and read the canvas directly with
`canvas.toDataURL()`.

**HTML overlays are not in the canvas.** Captions, vignette and grain are DOM,
so a canvas grab drops them. `compositeFrame()` redraws them into an offscreen
2D canvas over the WebGL output before export.

## Layout

```
films/two-fathers/
  index.html              the film — open this
  src/
    render-mode.html      deterministic variant used for offline rendering
    render.js             Playwright frame grabber
    shard.sh              parallel render driver
    mux.sh                frames + narration -> MP4
    script_lines.txt      the script, one line per spoken beat
    aligned.json          each line matched to its window in the voice track
    beats.js              generated beat table (timing, camera, action, mood)
```

## License

Code is MIT (see [LICENSE](LICENSE)). The script, the narration audio and the
finished films are not covered — those are owned by their author and are not
licensed for reuse.
