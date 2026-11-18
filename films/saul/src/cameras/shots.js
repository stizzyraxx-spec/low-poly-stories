// cameras/shots.js — the camera system.
//
// A shot is a position, a look-at, a focal length and a drift. Drift means no
// shot is ever locked off: every frame adds a slow sine wander, so even a held
// close-up breathes. Cuts blend over `blend` seconds (0 for a hard cut), eased
// with smoothstep, which is the Bezier-feel the brief asks for without
// needing a curve object per shot.
//
// A shot may also carry `path`: [p0, p1, p2] control points for a quadratic
// Bezier the camera travels along across the beat, used for the aerial
// descents, the follow-cam on the road and the final pull-back.

var SHOTS = {
  // ---- 1: Jerusalem ----
  jAerial:   { pos: [0, 15.5, 16], look: [0, 1.4, -10], fov: 46, drift: [0.5, 0.2, 0.3],
               path: [[0, 15.5, 16], [0, 8.0, 10], [0, 3.1, 5.2]], blend: 0 },
  jStreet:   { pos: [0, 2.6, 6.4], look: [0, 1.5, -7], fov: 40, drift: [0.45, 0.16, 0.22] },
  jTrack:    { pos: [2.1, 2.3, 3.4], look: [-0.3, 1.5, -3.5], fov: 38, drift: [0.4, 0.14, 0.2],
               path: [[2.1, 2.3, 4.6], [1.2, 2.3, 2.0], [0.2, 2.25, -0.6]] },
  jSaulCU:   { pos: [1.15, 1.76, 1.35], look: [-0.15, 1.68, 0.1], fov: 27, drift: [0.18, 0.08, 0.06] },
  jFear:     { pos: [-1.6, 1.82, -2.2], look: [-0.2, 1.55, -5.0], fov: 32, drift: [0.3, 0.12, 0.1] },
  jFearCU:   { pos: [-1.9, 1.74, -3.4], look: [-1.1, 1.66, -4.6], fov: 26, drift: [0.16, 0.08, 0.05] },
  jWide:     { pos: [0.4, 3.5, 8.5], look: [0, 1.5, -8], fov: 44, drift: [0.55, 0.22, 0.3] },

  // ---- 2: the road ----
  rFollow:   { pos: [0.3, 2.5, 7.5], look: [0, 1.5, 0], fov: 40, drift: [0.4, 0.15, 0.2],
               path: [[0.3, 2.5, 8.5], [0.1, 2.45, 6.4], [-0.2, 2.4, 4.6]] },
  rSide:     { pos: [5.4, 1.9, 2.2], look: [0, 1.5, -0.4], fov: 36, drift: [0.35, 0.13, 0.16] },
  rSaulCU:   { pos: [1.3, 1.78, 1.5], look: [-0.1, 1.7, 0.2], fov: 27, drift: [0.18, 0.08, 0.06] },
  rCompCU:   { pos: [-1.5, 1.76, 1.3], look: [-0.1, 1.68, 0.1], fov: 28, drift: [0.18, 0.08, 0.06] },
  rAerial:   { pos: [0, 9.0, 11], look: [0, 0.8, -26], fov: 48, drift: [0.5, 0.2, 0.28],
               path: [[0, 5.5, 9], [0, 8.0, 13], [0, 12.5, 19]] },
  rFeet:     { pos: [1.4, 0.45, 2.0], look: [0, 0.2, 0], fov: 34, drift: [0.2, 0.1, 0.12] },

  // ---- 3: the light ----
  lWide:     { pos: [7.0, 2.6, 6.2], look: [0, 2.2, -1.6], fov: 42, drift: [0.4, 0.16, 0.2] },
  lOrbit:    { pos: [5.2, 2.2, 4.4], look: [0, 1.5, -1.8], fov: 36, drift: [0.3, 0.12, 0.14],
               orbit: { c: [0, 1.5, -1.8], r: 6.4, y: 2.3, from: 0.72, to: -0.52 } },
  lOrbitTight:{ pos: [3.0, 1.9, 2.4], look: [0, 1.35, -1.8], fov: 30, drift: [0.2, 0.1, 0.1],
               orbit: { c: [0, 1.35, -1.8], r: 3.5, y: 1.95, from: -0.3, to: 0.62 } },
  lFallen:   { pos: [2.1, 1.05, 1.5], look: [0, 0.5, -1.7], fov: 32, drift: [0.18, 0.09, 0.08] },
  lFallenCU: { pos: [1.25, 0.82, 0.55], look: [0.05, 0.55, -1.5], fov: 26, drift: [0.12, 0.07, 0.05] },
  lUp:       { pos: [0.9, 0.62, 0.6], look: [0.1, 6.5, -1.8], fov: 46, drift: [0.22, 0.1, 0.12] },
  lBlowout:  { pos: [1.5, 1.2, 1.1], look: [0.05, 1.1, -1.7], fov: 29, drift: [0.14, 0.08, 0.06] },

  // ---- 4: blindness ----
  bSubj:     { pos: [0.55, 1.62, -1.15], look: [0.4, 1.5, -5.5], fov: 50, drift: [0.3, 0.14, 0.18] },
  bReach:    { pos: [2.3, 1.55, 1.2], look: [0, 1.35, -1.6], fov: 32, drift: [0.22, 0.1, 0.1] },
  bReachCU:  { pos: [1.35, 1.62, 0.5], look: [0.05, 1.5, -1.6], fov: 27, drift: [0.14, 0.08, 0.05] },
  bHands:    { pos: [1.5, 1.15, 0.9], look: [0.1, 0.95, -1.6], fov: 30, drift: [0.18, 0.09, 0.07] },
  bLead:     { pos: [4.4, 2.1, 4.0], look: [0, 1.4, -2.2], fov: 38, drift: [0.35, 0.14, 0.18],
               path: [[4.4, 2.1, 4.0], [3.0, 2.2, 1.0], [1.4, 2.3, -2.4]] },

  // ---- 5: three days ----
  dRoom:     { pos: [2.4, 2.0, 3.6], look: [0.2, 1.1, -1.1], fov: 36, drift: [0.3, 0.12, 0.14],
               path: [[2.8, 2.15, 4.2], [1.9, 1.85, 2.6], [1.1, 1.62, 1.5]] },
  dPray:     { pos: [1.1, 1.45, 1.3], look: [0.25, 1.05, -1.0], fov: 28, drift: [0.16, 0.08, 0.06] },
  dPrayCU:   { pos: [0.72, 1.3, 0.66], look: [0.3, 1.08, -0.9], fov: 24, drift: [0.1, 0.06, 0.04] },
  dWindow:   { pos: [1.0, 2.1, 1.4], look: [-2.4, 2.3, -3.2], fov: 32, drift: [0.2, 0.1, 0.1] },

  // ---- 6: Ananias' vision ----
  aRoom:     { pos: [-2.2, 1.95, 3.3], look: [0.1, 1.2, -1.0], fov: 36, drift: [0.3, 0.12, 0.14] },
  aCU:       { pos: [-1.05, 1.52, 1.25], look: [-0.1, 1.42, -0.9], fov: 27, drift: [0.15, 0.08, 0.05] },
  aCUtight:  { pos: [-0.68, 1.46, 0.72], look: [-0.1, 1.4, -0.85], fov: 23, drift: [0.1, 0.06, 0.04] },
  aHands:    { pos: [-0.9, 1.15, 0.95], look: [-0.15, 0.85, -0.9], fov: 29, drift: [0.16, 0.08, 0.06] },
  aLeave:    { pos: [-2.8, 2.05, 2.6], look: [0.6, 1.4, -1.4], fov: 35, drift: [0.28, 0.12, 0.12] },

  // ---- 7: sight restored ----
  hDoor:     { pos: [1.9, 1.95, 3.2], look: [-0.9, 1.4, -0.6], fov: 36, drift: [0.28, 0.12, 0.13] },
  hTwo:      { pos: [2.5, 1.8, 2.3], look: [-0.2, 1.35, -0.9], fov: 33, drift: [0.24, 0.11, 0.1] },
  hSaulCU:   { pos: [1.15, 1.5, 1.05], look: [0.1, 1.38, -0.85], fov: 26, drift: [0.14, 0.07, 0.05] },
  hAnanCU:   { pos: [-0.5, 1.52, 1.1], look: [-0.95, 1.42, -0.7], fov: 27, drift: [0.14, 0.07, 0.05] },
  hEyes:     { pos: [0.72, 1.44, 0.52], look: [0.12, 1.4, -0.8], fov: 21, drift: [0.08, 0.05, 0.03] },
  hHands:    { pos: [1.1, 1.72, 1.0], look: [0.05, 1.5, -0.85], fov: 28, drift: [0.14, 0.07, 0.05] },
  hBaptism:  { pos: [2.2, 1.7, 2.6], look: [0, 1.0, -0.9], fov: 34, drift: [0.26, 0.11, 0.12] },

  // ---- 8: preaching ----
  pWide:     { pos: [0.5, 3.0, 7.6], look: [0, 1.7, -4.4], fov: 42, drift: [0.45, 0.18, 0.24] },
  pSaul:     { pos: [0.9, 1.95, 2.4], look: [-0.15, 1.72, -1.4], fov: 32, drift: [0.22, 0.1, 0.1] },
  pSaulCU:   { pos: [0.6, 1.82, 1.25], look: [-0.1, 1.74, -1.3], fov: 26, drift: [0.14, 0.07, 0.05] },
  pSaulHero: { pos: [0.3, 0.95, 2.2], look: [-0.1, 1.9, -1.5], fov: 34, drift: [0.18, 0.1, 0.08] },
  pCrowdA:   { pos: [-2.4, 1.8, 0.4], look: [-3.4, 1.62, 2.1], fov: 28, drift: [0.18, 0.09, 0.07] },
  pCrowdB:   { pos: [2.6, 1.78, 0.6], look: [3.5, 1.6, 2.2], fov: 28, drift: [0.18, 0.09, 0.07] },
  pOver:     { pos: [-2.0, 2.15, 3.4], look: [-0.1, 1.7, -1.5], fov: 36, drift: [0.3, 0.13, 0.14] },
  pGrow:     { pos: [0.2, 4.2, 9.0], look: [0, 1.6, -3.6], fov: 46, drift: [0.5, 0.2, 0.26] },

  // ---- 9: the road out ----
  fRoad:     { pos: [3.2, 1.9, 4.6], look: [0, 1.4, -1.0], fov: 38, drift: [0.3, 0.13, 0.15] },
  fPullUp:   { pos: [2.0, 2.4, 5.0], look: [0, 1.3, -6], fov: 42, drift: [0.4, 0.18, 0.2],
               path: [[2.0, 2.4, 5.0], [1.0, 9.0, 13.0], [-0.5, 24.0, 30.0]] }
};

function smoothstep(x) {
  x = x < 0 ? 0 : (x > 1 ? 1 : x);
  return x * x * (3 - 2 * x);
}

// quadratic Bezier through three control points
function bez3(p, u, out) {
  var v = 1 - u;
  out.set(
    v * v * p[0][0] + 2 * v * u * p[1][0] + u * u * p[2][0],
    v * v * p[0][1] + 2 * v * u * p[1][1] + u * u * p[2][1],
    v * v * p[0][2] + 2 * v * u * p[1][2] + u * u * p[2][2]
  );
  return out;
}
