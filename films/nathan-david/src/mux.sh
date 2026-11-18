#!/bin/bash
set -e
cd "$(dirname "$0")"
AUDIO="${1:-narration.mp3}"
FRAMES="${2:-frames}"
N=$(ls $FRAMES/*.jpg | wc -l)
echo "muxing $N frames + narration"
ffmpeg -hide_banner -v warning -y \
  -framerate 30 -start_number 0 -i $FRAMES/f%06d.jpg \
  -i "$AUDIO" \
  -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -profile:v high -level 4.1 -movflags +faststart \
  -c:a aac -b:a 160k -ar 44100 \
  -shortest \
  you-are-the-man.mp4
echo "--- result ---"
ls -la you-are-the-man.mp4
ffprobe -v error -show_entries format=duration,size,bit_rate \
  -show_entries stream=codec_name,width,height,r_frame_rate,channels \
  -of default=noprint_wrappers=1 you-are-the-man.mp4
