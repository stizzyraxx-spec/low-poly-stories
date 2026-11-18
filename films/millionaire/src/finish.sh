#!/bin/bash
# Wait for the render, then encode and verify both cuts.
#
# Every gate here exists because of a failure that actually happened on this
# project: ffmpeg has reported success while producing a file where only 546
# of 8,535 frames would decode, and a film has been published against frames
# that were silently incomplete. So nothing is trusted on an exit code —
# frames are counted before encoding and the output is decoded end to end
# afterwards.
set -u
cd "$(dirname "$0")"

SCRATCH="${SCRATCH:?set SCRATCH to the scratchpad dir}"
FRAMES="$SCRATCH/m-frames"
EXPECT=6849
AUDIO=narration.mp3

log() { echo "[$(date +%H:%M:%S)] $*"; }

# ---- 1. wait for the render driver to finish -------------------------------
# Wait on the SHARD DONE line, not on a pgrep: `pgrep -f render-resilient.js`
# also matches this script's own command line and the shell that launched it,
# so the loop waits on itself and never exits. That deadlock cost a run on
# 2026-11-18 and is why the log is the signal here.
log "waiting for the render"
while ! grep -q "SHARD DONE" "$SCRATCH/m-render.log" 2>/dev/null; do
  sleep 20
done
log "render reported SHARD DONE"

# ---- 2. the frames must all be there ---------------------------------------
HAVE=$(ls "$FRAMES"/f*.jpg 2>/dev/null | wc -l)
log "frames on disk: $HAVE (expect $EXPECT)"
if [ "$HAVE" -ne "$EXPECT" ]; then
  log "ABORT: frame count mismatch — not encoding a film with holes in it"
  exit 1
fi
MISSING=$(python3 -I -c "
import os,sys
d='$FRAMES'
have={int(f[1:7]) for f in os.listdir(d) if f.startswith('f') and f.endswith('.jpg')}
print(len([i for i in range($EXPECT) if i not in have]))
")
if [ "$MISSING" -ne 0 ]; then
  log "ABORT: $MISSING frames missing from the sequence"
  exit 1
fi
TINY=$(find "$FRAMES" -name 'f*.jpg' -size -5k | wc -l)
if [ "$TINY" -ne 0 ]; then
  log "ABORT: $TINY frames under 5KB — likely blank"
  exit 1
fi
log "frame check passed: $HAVE frames, none missing, none blank"

# ---- 3. encode + verify each cut -------------------------------------------
encode() {
  local mode="$1" out="$2" vf="$3"
  log "encoding $mode -> $out"
  nice -n 10 ionice -c3 ffmpeg -hide_banner -v warning -y \
    -framerate 30 -start_number 0 -i "$FRAMES/f%06d.jpg" \
    -i "$AUDIO" \
    -map 0:v -map 1:a \
    -vf "$vf" \
    -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \
    -profile:v high -level 4.1 -movflags +faststart \
    -c:a aac -b:a 160k -ar 44100 \
    -shortest "$out"
  local rc=$?
  if [ $rc -ne 0 ]; then log "ABORT: ffmpeg exited $rc for $mode"; return 1; fi

  # Exit code is not evidence. Decode the whole file.
  local errs frames
  errs=$(ffmpeg -v error -i "$out" -f null - 2>&1 | wc -l)
  frames=$(ffprobe -v error -count_frames -select_streams v:0 \
             -show_entries stream=nb_read_frames -of csv=p=0 "$out")
  log "$mode: decode-errors=$errs frames-decoded=$frames size=$(stat -c%s "$out")"
  if [ "$errs" -ne 0 ]; then log "ABORT: $out has $errs decode errors"; return 1; fi
  if [ "$frames" -lt $((EXPECT - 5)) ]; then
    log "ABORT: $out decoded only $frames of $EXPECT frames"; return 1
  fi
  log "$mode VERIFIED"
}

encode landscape Millionaire_Lost_Everything_Final.mp4 "scale=1280:720" || exit 1
encode vertical  Millionaire_Lost_Everything_Vertical.mp4 \
  "crop=in_h*9/16:in_h,scale=1080:1920:flags=lanczos" || exit 1

# ---- 4. stream summary -----------------------------------------------------
for f in Millionaire_Lost_Everything_Final.mp4 Millionaire_Lost_Everything_Vertical.mp4; do
  echo "=== $f ==="
  ffprobe -v error -show_entries format=duration,size,bit_rate \
    -show_entries stream=codec_name,width,height,r_frame_rate,channels,sample_rate \
    -of default=noprint_wrappers=1 "$f"
done
log "ALL DONE"
