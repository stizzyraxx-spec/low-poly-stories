// animations/perform.js — what makes a figure look alive.
//
// Two layers. Involuntary motion (breath, blink, weight shift, the drift of a
// head) runs on its own timers and never stops, so nobody is ever a statue.
// Voluntary motion (point, shield, kneel, reach, walk) is a set of 0..1 targets
// that beats set and this module eases toward, so a cut never catches a body
// mid-snap.

function ease(cur, target, rate, dt) {
  return cur + (target - cur) * (1 - Math.exp(-rate * dt));
}

// Mouths open only while their own line is being spoken. There is no forced
// aligner on this machine, so this is a speech ENVELOPE, not visemes: the jaw
// rides a fast carrier (syllable-rate) under a slower amplitude curve, and
// closes in the measured pauses inside the line. It reads correctly at these
// shot sizes; it is not phoneme-matched, and the storyboard says so.
function jawEnvelope(t, lineT, lineD, seed) {
  if (lineT === null || t < lineT || t > lineT + lineD) return 0;
  var u = (t - lineT) / Math.max(0.0001, lineD);
  // taper in and out so a line does not begin or end with a snapped jaw
  var amp = Math.min(1, Math.min(u, 1 - u) * 9);
  var carrier = 0.5 + 0.5 * Math.sin((t + seed) * 15.5);
  var slow = 0.55 + 0.45 * Math.sin((t * 2.3 + seed) * 1.7);
  return amp * carrier * slow;
}

function animatePerson(c, t, dt) {
  var s = c.s;

  // ---- involuntary ----
  s.breathT += dt * (0.95 + s.talking * 0.5 + s.fallen * 0.9);
  var breath = Math.sin(s.breathT) * 0.5 + 0.5;
  c.chest.scale.set(1 + breath * 0.022, 1 + breath * 0.016, 1 + breath * 0.026);
  c.chest.position.y = 0.26 + breath * 0.009;

  s.sway += dt * 0.37;
  var sway = Math.sin(s.sway) * 0.012 + Math.sin(s.sway * 0.41) * 0.008;

  s.blinkT -= dt;
  var blink = 0;
  if (s.blinkT < 0) {
    blink = Math.min(1, -s.blinkT * 11);
    if (s.blinkT < -0.14) { s.blinkT = 2.1 + rnd() * 3.4; }
  }

  // ---- spine ----
  var leanA = s.lean * 0.21 + s.fallen * 0.1;
  c.torso.rotation.x = ease(c.torso.rotation.x, leanA - s.slump * 0.05, 7, dt);
  c.torso.rotation.z = ease(c.torso.rotation.z, sway + s.fallen * 0.14, 5, dt);
  c.chest.rotation.x = ease(c.chest.rotation.x, s.slump * 0.17, 6, dt);

  // ---- head ----
  var hd = s.headDown * 0.34 + s.slump * 0.1 - s.browRaise * 0.05;
  c.neck.rotation.x = ease(c.neck.rotation.x, hd, 7, dt);
  c.head.rotation.y = ease(c.head.rotation.y, s.headTurn * 0.5, 6, dt);
  c.head.rotation.z = ease(c.head.rotation.z, s.headTilt * 0.22 + sway * 0.5, 6, dt);
  c.head.rotation.x = ease(c.head.rotation.x, Math.sin(s.breathT * 0.31) * 0.012, 4, dt);

  // ---- face ----
  c.jaw.rotation.x = ease(c.jaw.rotation.x, s.jawOpen * 0.30, 26, dt);
  c.mouth.scale.y = 1 + s.jawOpen * 2.2;

  // lids: blink, plus the heavy half-lidded look of the blind stretch
  var lidY = 0.044 - (blink * 0.046) - (s.lidDrop * 0.030);
  c.eyeL.lid.position.y = ease(c.eyeL.lid.position.y, lidY, 24, dt);
  c.eyeR.lid.position.y = c.eyeL.lid.position.y;

  // brows do the emotional work: angry drives the inner ends down, fear up
  var bz = s.browAngle * 0.42;
  c.eyeL.brow.rotation.z = ease(c.eyeL.brow.rotation.z, -bz, 10, dt);
  c.eyeR.brow.rotation.z = ease(c.eyeR.brow.rotation.z, bz, 10, dt);
  var by = 0.052 + s.browRaise * 0.022 - Math.max(0, s.browAngle) * 0.012;
  c.eyeL.brow.position.y = ease(c.eyeL.brow.position.y, by, 10, dt);
  c.eyeR.brow.position.y = c.eyeL.brow.position.y;

  // eyes go dead during blindness - no iris tracking, nothing to track with
  var irisZ = 0.004 - s.lidDrop * 0.002;
  c.eyeL.iris.position.z = irisZ;
  c.eyeR.iris.position.z = irisZ;

  // ---- arms ----
  // shield: both forearms up across the face, the Damascus-road gesture
  var shL = -s.armUpL * 1.5 - s.shield * 2.25 - s.reach * 1.35 - s.point * 0.2;
  var shR = -s.armUpR * 1.5 - s.shield * 2.25 - s.reach * 1.35 - s.point * 1.6;
  c.armL.sh.rotation.x = ease(c.armL.sh.rotation.x, shL, 8, dt);
  c.armR.sh.rotation.x = ease(c.armR.sh.rotation.x, shR, 8, dt);
  c.armL.sh.rotation.z = ease(c.armL.sh.rotation.z, -0.09 - s.shield * 0.5 + s.reach * 0.22, 8, dt);
  c.armR.sh.rotation.z = ease(c.armR.sh.rotation.z, 0.09 + s.shield * 0.5 - s.reach * 0.22 - s.point * 0.3, 8, dt);
  c.armL.el.rotation.x = ease(c.armL.el.rotation.x, -s.shield * 1.5 - s.armUpL * 0.7 - s.reach * 0.25, 8, dt);
  c.armR.el.rotation.x = ease(c.armR.el.rotation.x, -s.shield * 1.5 - s.armUpR * 0.7 - s.reach * 0.25 - s.point * 0.1, 8, dt);

  // talking gesture: the forward hand lifts a little on stressed syllables
  if (s.talking > 0.01 && s.shield < 0.1 && s.reach < 0.1) {
    var g = Math.sin(t * 3.1) * 0.5 + 0.5;
    c.armR.sh.rotation.x -= s.talking * g * 0.26;
    c.armR.el.rotation.x -= s.talking * g * 0.2;
  }

  // ---- legs: walk cycle, kneel, collapse ----
  if (s.walk > 0.01) {
    s.walkPhase += dt * 4.6 * s.walk;
    var w = s.walkPhase;
    c.legL.hip.rotation.x = Math.sin(w) * 0.55 * s.walk;
    c.legR.hip.rotation.x = Math.sin(w + Math.PI) * 0.55 * s.walk;
    c.legL.knee.rotation.x = Math.max(0, -Math.sin(w - 0.6)) * 0.72 * s.walk;
    c.legR.knee.rotation.x = Math.max(0, -Math.sin(w + Math.PI - 0.6)) * 0.72 * s.walk;
    // the body rises and falls on the stride, which is what sells a walk
    c.hips.position.y = 0.92 + Math.abs(Math.sin(w)) * 0.028 * s.walk;
    c.armL.sh.rotation.x += Math.sin(w + Math.PI) * 0.3 * s.walk;
    c.armR.sh.rotation.x += Math.sin(w) * 0.3 * s.walk;
  } else {
    c.legL.hip.rotation.x = ease(c.legL.hip.rotation.x, s.kneel * -1.45, 7, dt);
    c.legR.hip.rotation.x = ease(c.legR.hip.rotation.x, s.kneel * -0.3, 7, dt);
    c.legL.knee.rotation.x = ease(c.legL.knee.rotation.x, s.kneel * 1.5, 7, dt);
    c.legR.knee.rotation.x = ease(c.legR.knee.rotation.x, s.kneel * 1.5, 7, dt);
    c.hips.position.y = ease(c.hips.position.y,
      0.92 - s.kneel * 0.42 - s.fallen * 0.66, 6, dt);
  }

  // a fallen body pitches forward onto its hands
  c.root.rotation.x = ease(c.root.rotation.x, s.fallen * 0.3, 5, dt);
}
