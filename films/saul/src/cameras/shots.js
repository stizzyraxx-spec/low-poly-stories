// cameras/shots.js — the camera system.
//
// Most shots are DERIVED: built by cameras/solve.js from where a character
// actually stands, resolved every frame. Hand-typed coordinates fall out of
// agreement with staging as soon as anyone moves, and the error only shows up
// in a rendered frame. The first Saul render proved it - a close-up aimed at
// empty road, and another camera standing inside a building.
//
// Fixed shots remain where the frame is about the PLACE rather than a person:
// aerial establishes, the road to the horizon, the final pull-back.
//
// A shot carries a drift so nothing is ever locked off, and cuts blend with
// smoothstep over `blend` seconds.

var SHOTS = {};

function buildShots(C) {
  var S = {};
  // Figures that must never block a close-up. Each scene's principals; the
  // crowd is excluded because it stands behind the camera in scene 8.
  var BLOCK = [C.saul, C.anan, C.comp1, C.comp2, C.chris, C.citA, C.citB];

  // ---- 1: Jerusalem ----
  // Fixed: these are about the street, not about a face.
  S.jAerial = { pos: [0, 15.5, 16], look: [0, 1.4, -10], fov: 46,
                drift: [0.5, 0.2, 0.3],
                path: [[0, 15.5, 16], [0, 8.0, 10], [0, 3.2, 5.6]] };
  S.jStreet = { pos: [0, 2.6, 6.4], look: [0, 1.5, -7], fov: 40, drift: [0.45, 0.16, 0.22] };
  S.jWide   = { pos: [0.4, 3.6, 8.5], look: [0, 1.5, -6], fov: 44, drift: [0.55, 0.22, 0.3] };

  // Derived: these follow the people.
  S.jTrack   = wideOn(C.saul, { yaw: 0.25, dist: 7.70, height: 2.3, lookY: 1.5, fov: 38 });
  S.jSaulCU  = cu(C.saul, { dist: 2.71, yaw: 0.45, fov: 27, blockers: BLOCK });
  S.jFear    = wideOn(C.chris, { yaw: 2.9, dist: 7.00, height: 2.0, lookY: 1.45, fov: 34 });
  S.jFearCU  = cu(C.chris, { dist: 2.80, yaw: -0.4, fov: 28, blockers: BLOCK });

  // ---- 2: the road ----
  S.rFollow  = { pos: [0.3, 2.5, 7.5], look: [0, 1.5, 0], fov: 40, drift: [0.4, 0.15, 0.2],
                 path: [[0.4, 2.5, 8.5], [0.15, 2.45, 6.4], [-0.2, 2.4, 4.6]] };
  S.rAerial  = { pos: [0, 9.0, 11], look: [0, 0.8, -26], fov: 48, drift: [0.5, 0.2, 0.28],
                 path: [[0, 5.5, 9], [0, 8.0, 13], [0, 12.5, 19]] };
  S.rSide    = wideOn(C.saul, { yaw: 1.5, dist: 8.75, height: 1.9, lookY: 1.45, fov: 36 });
  S.rSaulCU  = cu(C.saul, { dist: 2.71, yaw: 0.4, fov: 27, blockers: BLOCK });
  S.rCompCU  = cu(C.comp1, { dist: 2.62, yaw: -0.4, fov: 28, blockers: BLOCK });
  S.rFeet    = { pos: [1.4, 0.45, 2.0], look: [0, 0.2, 0], fov: 34, drift: [0.2, 0.1, 0.12] };

  // ---- 3: the light ----
  S.lWide       = wideOn(C.saul, { yaw: 1.05, dist: 12.25, height: 2.7, lookY: 2.0, fov: 42 });
  S.lOrbit      = orbitOn(C.saul, { from: 0.75, to: -0.55, r: 5.6, height: 2.3, fov: 36 });
  S.lOrbitTight = orbitOn(C.saul, { from: -0.35, to: 0.6, r: 3.2, height: 1.85,
                                    drop: 0.35, fov: 30 });
  S.lFallen     = wideOn(C.saul, { yaw: 0.85, dist: 5.60, height: 1.15, lookY: 0.7, fov: 33 });
  S.lFallenCU   = cu(C.saul, { dist: 2.27, yaw: 0.5, rise: -0.05, fov: 26, blockers: BLOCK });
  S.lUp         = lookUp(C.saul, { dx: 0.85, dz: 0.8, lookY: 7.0, fov: 46 });
  S.lBlowout    = cu(C.saul, { dist: 2.54, yaw: 0.3, fov: 29, blockers: BLOCK });

  // ---- 4: blindness ----
  // bSubj is his point of view, so it sits at his eyeline looking forward.
  S.bSubj    = { derive: function (t, v, look) {
                   headOf(C.saul, v);
                   v.y += 0.02;
                   look.set(v.x + Math.sin(C.saul.root.rotation.y) * 4,
                            v.y - 0.25,
                            v.z + Math.cos(C.saul.root.rotation.y) * 4);
                 }, fov: 50, drift: [0.3, 0.14, 0.18] };
  S.bReach   = wideOn(C.saul, { yaw: 0.95, dist: 5.25, height: 1.7, lookY: 1.3, fov: 33 });
  S.bReachCU = cu(C.saul, { dist: 2.54, yaw: 0.45, fov: 27, blockers: BLOCK });
  S.bHands   = { derive: function (t, v, look) {
                   C.saul.armR.hand.getWorldPosition(look);
                   v.set(look.x + 1.1, look.y + 0.55, look.z + 1.0);
                 }, fov: 31, drift: [0.18, 0.09, 0.07] };
  S.bLead    = wideOn(C.saul, { yaw: 1.25, dist: 8.05, height: 2.2, lookY: 1.4, fov: 38 });

  // ---- 5: three days ----
  S.dRoom   = wideOn(C.saul, { yaw: 0.5, dist: 5.95, height: 2.0, lookY: 1.0, fov: 36 });
  S.dPray   = cu(C.saul, { dist: 2.80, yaw: 0.5, rise: 0.1, fov: 28 });
  S.dPrayCU = cu(C.saul, { dist: 1.93, yaw: 0.45, rise: 0.04, fov: 24 });
  S.dWindow = { pos: [1.0, 2.1, 1.4], look: [-2.4, 2.3, -3.2], fov: 32, drift: [0.2, 0.1, 0.1] };

  // ---- 6: Ananias' vision ----
  S.aRoom    = wideOn(C.anan, { yaw: -0.5, dist: 5.77, height: 1.95, lookY: 1.15, fov: 36 });
  S.aCU      = cu(C.anan, { dist: 2.62, yaw: -0.4, fov: 27 });
  S.aCUtight = cu(C.anan, { dist: 2.01, yaw: -0.3, fov: 23 });
  S.aHands   = { derive: function (t, v, look) {
                   C.anan.armL.hand.getWorldPosition(look);
                   v.set(look.x - 0.75, look.y + 0.5, look.z + 0.95);
                 }, fov: 29, drift: [0.16, 0.08, 0.06] };
  S.aLeave   = wideOn(C.anan, { yaw: -1.1, dist: 6.30, height: 2.05, lookY: 1.3, fov: 35 });

  // ---- 7: sight restored ----
  S.hDoor    = wideOn(C.anan, { yaw: 1.0, dist: 5.60, height: 1.95, lookY: 1.35, fov: 36 });
  S.hTwo     = two(C.saul, C.anan, { yaw: 0.35, dist: 3.32, fov: 33 });
  S.hSaulCU  = cu(C.saul, { dist: 2.45, yaw: 0.45, fov: 26, blockers: BLOCK });
  S.hAnanCU  = cu(C.anan, { dist: 2.54, yaw: -0.4, fov: 27, blockers: BLOCK });
  S.hEyes    = cu(C.saul, { dist: 1.57, yaw: 0.25, rise: 0.02, fov: 21, blockers: BLOCK });
  S.hHands   = { derive: function (t, v, look) {
                   C.anan.armR.hand.getWorldPosition(look);
                   v.set(look.x + 0.9, look.y + 0.45, look.z + 0.85);
                 }, fov: 28, drift: [0.14, 0.07, 0.05] };
  S.hBaptism = two(C.saul, C.anan, { yaw: -0.5, dist: 4.02, rise: 0.5, fov: 34 });

  // ---- 8: preaching ----
  S.pWide     = wideOn(C.saul, { yaw: 0.1, dist: 14.00, height: 3.1, lookY: 1.7, fov: 42 });
  S.pSaul     = wideOn(C.saul, { yaw: 0.2, dist: 5.25, height: 2.0, lookY: 1.65, fov: 32 });
  S.pSaulCU   = cu(C.saul, { dist: 4.3, yaw: 0.2, fov: 24 });
  S.pSaulHero = hero(C.saul, { dist: 5.2, height: 1.0, fov: 34 });
  S.pCrowdA   = cu(C.citA, { dist: 2.80, yaw: 0.3, fov: 28 });
  S.pCrowdB   = cu(C.citB, { dist: 2.80, yaw: -0.3, fov: 28 });
  // From behind the audience, over a listener's shoulder, to Saul on the
  // steps. The crowd occupies z=-1.4..+2.7 while Saul is at z=-5.4, so the
  // camera must sit beyond the back row - measured from the crowd, not from
  // citA, who stands in its front rank.
  S.pOver     = { derive: function (t, v, look) {
                    headOf(C.saul, look);
                    look.y -= 0.25;
                    var back = C.crowd[13];        // the furthest listener
                    var bz = back && back.root.visible ? back.root.position.z : 2.7;
                    v.set(look.x + 1.5, 2.45, bz + 2.6);
                  }, fov: 38, drift: [0.22, 0.1, 0.1] };
  S.pGrow     = wideOn(C.saul, { yaw: 0.05, dist: 18.38, height: 4.4, lookY: 1.6, fov: 46 });

  // ---- 9: the road out ----
  S.fRoad   = wideOn(C.saul, { yaw: 0.8, dist: 7.70, height: 1.9, lookY: 1.4, fov: 38 });
  S.fPullUp = { pos: [2.0, 2.4, 5.0], look: [0, 1.3, -6], fov: 42, drift: [0.4, 0.18, 0.2],
                path: [[2.2, 2.4, 5.5], [1.0, 9.0, 13.0], [-0.5, 24.0, 30.0]] };

  for (var k in S) SHOTS[k] = S[k];
  return SHOTS;
}

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
