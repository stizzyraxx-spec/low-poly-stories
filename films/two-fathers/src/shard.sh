#!/bin/bash
cd "$(dirname "$0")"
N=3
for i in 0 1 2; do
  FROM=$(python3 -I -c "print(284.45*$i/$N)")
  TO=$(python3 -I -c "print(284.45*($i+1)/$N)")
  W=1280 H=720 FPS=30 FROM=$FROM TO=$TO OUT=frames PAGE=render-mode.html \
    node render.js > shard$i.log 2>&1 &
done
wait
echo "ALL SHARDS DONE"
ls frames | wc -l
