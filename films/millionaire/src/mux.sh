#!/bin/bash
# Mux the rendered frames with the narration.
#   ./mux.sh            landscape 1280x720
#   ./mux.sh vertical   1080x1920, centre-cropped from the same frames
#
# The vertical cut is a crop, not a re-render: re-rendering at 9:16 would
# need every shot reframed, and a centre crop of a 16:9 frame keeps the
# subject (which these shots centre) while losing only side scenery.
set -e
cd "$(dirname "$0")"
MODE="${1:-landscape}"
FRAMES="${FRAMES:-$SCRATCH/m-frames}"
AUDIO="${AUDIO:-narration.mp3}"
N=$(ls "$FRAMES"/*.jpg 2>/dev/null | wc -l)
echo "muxing $N frames ($MODE)"

if [ "$MODE" = "vertical" ]; then
  OUT="Millionaire_Lost_Everything_Vertical.mp4"
  VF="crop=in_h*9/16:in_h,scale=1080:1920:flags=lanczos"
else
  OUT="Millionaire_Lost_Everything_Final.mp4"
  VF="scale=1280:720"
fi

nice -n 10 ionice -c3 ffmpeg -hide_banner -v warning -y \
  -framerate 30 -start_number 0 -i "$FRAMES/f%06d.jpg" \
  -i "$AUDIO" \
  -map 0:v -map 1:a \
  -vf "$VF" \
  -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \
  -profile:v high -level 4.1 -movflags +faststart \
  -c:a aac -b:a 160k -ar 44100 \
  -shortest \
  "$OUT"

echo "--- verifying by full decode, not exit code ---"
ERRS=$(ffmpeg -v error -i "$OUT" -f null - 2>&1 | wc -l)
FRAMES_OUT=$(ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=nb_read_frames -of csv=p=0 "$OUT")
echo "decode-errors: $ERRS"
echo "frames decoded: $FRAMES_OUT"
ls -la "$OUT"
