#!/bin/bash
set -e
cd "$(dirname "$0")"
AUDIO="${1:?usage: mux.sh <narration.mp3>}"
N=$(ls frames/*.jpg | wc -l)
echo "muxing $N frames + narration"
# Encode from the numbered jpegs, pair with the ORIGINAL full-quality audio.
ffmpeg -hide_banner -v warning -y \
  -framerate 30 -start_number 0 -i frames/f%06d.jpg \
  -i "$AUDIO" \
  -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -profile:v high -level 4.1 -movflags +faststart \
  -c:a aac -b:a 160k -ar 44100 \
  -shortest \
  two-fathers.mp4
echo "--- result ---"
ls -la two-fathers.mp4
ffprobe -v error -show_entries format=duration,size,bit_rate \
  -show_entries stream=codec_name,width,height,r_frame_rate,channels \
  -of default=noprint_wrappers=1 two-fathers.mp4
