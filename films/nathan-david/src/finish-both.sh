#!/bin/bash
# Wait out the Two Fathers render, encode it, then render and encode
# Nathan & David. Both films end up as MP4s in the scratchpad.
#
# Safe to re-run: the resilient driver skips frames already on disk, and
# ffmpeg is told to overwrite, so a second run just fills the gaps.
set -u

SP="$1"
REPO=/home/coder/projects/low-poly-stories
TF="$REPO/films/two-fathers/src"
ND="$REPO/films/nathan-david/src"

log() { echo "[$(date +%H:%M:%S)] $*"; }

# ---- 1. wait for the in-flight Two Fathers render to drain -------------
# Wait on the node processes themselves, matched by executable name, not by
# a -f pattern: `pgrep -f render-resilient.js` also matches THIS script's own
# command line and the shell that launched it, so the loop waits on itself and
# never exits. (That deadlock cost a run on 2026-11-18.) `pgrep -x node`
# matches only processes whose executable is node, which this script is not.
log "waiting for any in-flight render to finish"
while pgrep -x node > /dev/null; do
  sleep 30
done
log "two-fathers frames on disk: $(ls "$SP/frames" | wc -l)"

# ---- 2. fill any gaps the crashes left --------------------------------
cd "$TF" || exit 1
for i in 0 1; do
  FROM=$(python3 -I -c "print(284.45*$i/2)")
  TO=$(python3 -I -c "print(284.45*($i+1)/2)")
  FROM=$FROM TO=$TO OUT="$SP/frames" PAGE=render-mode.html \
    node render-resilient.js >> "$SP/tf-fill$i.log" 2>&1 &
done
wait
TFN=$(ls "$SP/frames" | wc -l)
log "two-fathers complete: $TFN frames"

# ---- 3. encode Two Fathers --------------------------------------------
if [ "$TFN" -ge 8500 ]; then
  log "encoding two-fathers"
  ffmpeg -hide_banner -v warning -y \
    -framerate 30 -start_number 0 -i "$SP/frames/f%06d.jpg" \
    -i "$SP/two-fathers-narration.mp3" \
    -map 0:v -map 1:a \
    -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -profile:v high -level 4.1 -movflags +faststart \
    -c:a aac -b:a 160k -ar 44100 -shortest \
    "$SP/two-fathers-720p.mp4" 2>> "$SP/tf-mux.log" \
    && log "two-fathers.mp4 $(du -h "$SP/two-fathers-720p.mp4" | cut -f1)" \
    || log "two-fathers encode FAILED (see tf-mux.log) - likely the audio path"
else
  log "two-fathers INCOMPLETE ($TFN/8535) - skipping encode"
fi

# ---- 4. render Nathan & David -----------------------------------------
log "rendering nathan-david"
mkdir -p "$SP/nd-frames"
cd "$ND" || exit 1
for i in 0 1; do
  FROM=$(python3 -I -c "print(155.25*$i/2)")
  TO=$(python3 -I -c "print(155.25*($i+1)/2)")
  FROM=$FROM TO=$TO OUT="$SP/nd-frames" PAGE=render-mode.html \
    node render-resilient.js > "$SP/nd$i.log" 2>&1 &
done
wait
NDN=$(ls "$SP/nd-frames" | wc -l)
log "nathan-david frames: $NDN"

# ---- 5. encode Nathan & David -----------------------------------------
if [ "$NDN" -ge 4600 ]; then
  log "encoding nathan-david"
  ffmpeg -hide_banner -v warning -y \
    -framerate 30 -start_number 0 -i "$SP/nd-frames/f%06d.jpg" \
    -i "$ND/narration.mp3" \
    -map 0:v -map 1:a \
    -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -profile:v high -level 4.1 -movflags +faststart \
    -c:a aac -b:a 160k -ar 44100 -shortest \
    "$SP/you-are-the-man-720p.mp4" 2>> "$SP/nd-mux.log" \
    && log "you-are-the-man.mp4 $(du -h "$SP/you-are-the-man-720p.mp4" | cut -f1)" \
    || log "nathan-david encode FAILED (see nd-mux.log)"
else
  log "nathan-david INCOMPLETE ($NDN/4658) - skipping encode"
fi

log "ALL DONE"
ls -la "$SP"/*.mp4 2>/dev/null
