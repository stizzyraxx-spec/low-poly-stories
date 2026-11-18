// scripts/transport.js — the clock, the beat dispatcher, and the frame loop.
//
// In playback the <audio> element IS the clock: every frame reads
// voice.currentTime, so picture cannot drift from sound no matter how the
// browser schedules frames. In render mode time is supplied in exact 1/30s
// steps instead, which makes the render deterministic and resumable.
//
// Beats are dispatched by onset, not by accumulation. Because each beat's `t`
// came from a measured speech onset, a cut can never land before its line is
// spoken.

var FPS = 30;

function makeTransport(opts) {
  var beats = opts.beats;
  var duration = opts.duration;
  var applyBeat = opts.applyBeat;
  var frame = opts.frame;
  var voice = opts.voice;
  var renderMode = opts.renderMode;

  var time = 0;
  var playing = false;
  var beatIdx = -1;
  var last = 0;

  // Find the beat that owns time t. Linear from the current index in playback
  // (cheap), binary search on seek (correct after a jump).
  function beatAt(t) {
    var lo = 0, hi = beats.length - 1, best = 0;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (beats[mid].t <= t) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    return best;
  }

  function sync(t) {
    var want = beatAt(t);
    if (want !== beatIdx) {
      // When seeking forward over several beats, apply them in order so any
      // state they set (a character's pose, which set is visible) ends up
      // where it would have been had the film played through.
      var from = want < beatIdx ? 0 : beatIdx + 1;
      for (var i = from; i <= want; i++) applyBeat(beats[i], i, t);
      beatIdx = want;
    }
  }

  function step(t, dt) {
    time = t;
    sync(t);
    frame(t, dt);
  }

  // ---- playback ----
  function loop() {
    if (!playing) return;
    var t = voice.currentTime;
    var dt = Math.min(0.1, Math.max(0.0005, t - last));
    last = t;
    step(t, dt);
    if (t < duration) {
      requestAnimationFrame(loop);
    } else {
      playing = false;
    }
  }

  function play() {
    if (playing) return;
    playing = true;
    last = voice.currentTime;
    voice.play();
    requestAnimationFrame(loop);
  }

  function reset() {
    time = 0;
    beatIdx = -1;
    last = 0;
    applyBeat(beats[0], 0, 0);
    beatIdx = 0;
    step(0, 1 / FPS);
  }

  // ---- render mode ----
  // Advance in exact frame steps from wherever we are to the requested time,
  // so eased values (which integrate dt) land identically on every pass. A
  // shard that starts at frame 2000 must produce the same pixels as a full
  // run, so seekTo walks the easing forward rather than teleporting.
  function seekTo(t) {
    var steps = Math.round(t * FPS);
    for (var i = 0; i <= steps; i++) step(i / FPS, 1 / FPS);
  }

  function advanceTo(t) {
    var target = Math.round(t * FPS);
    var cur = Math.round(time * FPS);
    if (target < cur) { reset(); cur = 0; }
    for (var f = cur + 1; f <= target; f++) step(f / FPS, 1 / FPS);
    if (target === 0) step(0, 1 / FPS);
  }

  // Jump straight to t for inspection: apply every beat up to t, then run
  // `settle` frames so eased values land near their targets. Cheap, but NOT
  // frame-exact - renders must use advanceTo.
  function jumpTo(t, settle) {
    time = t;
    beatIdx = -1;
    sync(t);
    for (var i = 0; i < (settle || 20); i++) frame(t, 1 / FPS);
  }

  return {
    play: play, reset: reset, seekTo: seekTo, advanceTo: advanceTo,
    jumpTo: jumpTo,
    step: step, duration: duration,
    get time() { return time; },
    get beatIdx() { return beatIdx; }
  };
}
