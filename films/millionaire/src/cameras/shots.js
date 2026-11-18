// cameras/shots.js — the camera system.
//
// Derived shots (from cameras/solve.js) resolve against live character
// positions every frame. Fixed shots are used only where the frame is about
// the PLACE: the opening aerial, the closing pull-back. Hand-typed
// coordinates for anything involving a person go out of agreement with
// staging the moment someone moves — that cost a whole render on the
// previous film, so this one starts derived.

var SHOTS = {};

function buildShots(C) {
  var S = {};
  var BLOCK = [C.man, C.asst, C.wife, C.doc, C.friend];

  // ---- 1-3: the office ----
  // Aerial on the skyline, pushing to the tower and in through the glass.
  S.oAerial  = { pos: [0, 34, 46], look: [0, 10, -20], fov: 46,
                 drift: [0.5, 0.2, 0.3],
                 path: [[6, 34, 54], [3, 14, 22], [0.6, 2.4, 4.2]] };
  S.oManCU   = cu(C.man, { dist: 3.51, yaw: 0.42, fov: 27, blockers: BLOCK });
  S.oAsstCU  = cu(C.asst, { dist: 3.38, yaw: -0.4, fov: 28, blockers: BLOCK });
  S.oManLow  = hero(C.man, { dist: 4.29, height: 1.05, yaw: 0.3, fov: 33 });
  // the tablet: a tight shot of what she is showing him
  S.oTablet  = { derive: function (t, v, look) {
                   C.asst.armR.hand.getWorldPosition(look);
                   v.set(look.x + 0.55, look.y + 0.42, look.z + 0.75);
                 }, fov: 30, drift: [0.14, 0.07, 0.05] };
  // the office is too big for him - the frame says so
  S.oIsolate = wideOn(C.man, { yaw: 0.25, dist: 12.35, height: 2.9, fov: 44 });
  S.oTwo     = two(C.man, C.asst, { yaw: 0.3, dist: 2.99, fov: 34 });

  // ---- 4: the hospital ----
  S.hRush    = wideOn(C.man, { yaw: 2.9, dist: 5.98, height: 1.9, fov: 38 });
  S.hDocCU   = cu(C.doc, { dist: 4.0, yaw: 0.05, fov: 28, blockers: BLOCK });
  S.hManCU   = cu(C.man, { dist: 3.9, yaw: 0.2, fov: 26, blockers: BLOCK });
  S.hTwo     = two(C.man, C.wife, { yaw: 0.4, dist: 2.86, fov: 34 });
  S.hWide    = wideOn(C.man, { yaw: 2.6, dist: 9.75, height: 2.6, fov: 42 });

  // ---- 5: the luxury house ----
  S.rMan     = cu(C.man, { dist: 3.77, yaw: 0.5, rise: 0.12, fov: 30, blockers: BLOCK });
  S.rManCU   = cu(C.man, { dist: 2.86, yaw: 0.4, rise: 0.15, fov: 26, blockers: BLOCK });
  S.rWife    = cu(C.wife, { dist: 3.51, yaw: -0.45, fov: 28, blockers: BLOCK });
  S.rTwo     = two(C.man, C.wife, { yaw: -0.4, dist: 3.38, rise: 0.45, fov: 35 });
  S.rWide    = wideOn(C.man, { yaw: -0.6, dist: 9.10, height: 2.4, fov: 42 });

  // ---- 6-11: the apartment ----
  S.aDoor    = wideOn(C.friend, { yaw: 0.9, dist: 4.42, height: 1.95, fov: 36 });
  S.aManCU   = cu(C.man, { dist: 2.99, yaw: 0.42, rise: 0.10, fov: 27, blockers: BLOCK });
  S.aFriendCU= cu(C.friend, { dist: 2.99, yaw: -0.42, rise: 0.10, fov: 27, blockers: BLOCK });
  S.aTwo     = two(C.man, C.friend, { yaw: 0.45, dist: 2.86, rise: 0.5, fov: 34 });
  S.aOver    = over(C.friend, C.man, { back: 1.9, side: 0.7, rise: 0.35, fov: 35 });
  S.aWide    = wideOn(C.man, { yaw: 0.7, dist: 6.76, height: 2.2, fov: 40 });
  // he looks at the photograph: frame him with it in shot
  S.aPhoto   = { derive: function (t, v, look) {
                   headOf(C.man, look);
                   look.y -= 0.1;
                   v.set(look.x + 2.0, look.y + 0.45, look.z + 1.5);
                 }, fov: 30, drift: [0.16, 0.08, 0.06] };
  // at the window, the city carrying on behind him
  S.aWindow  = { derive: function (t, v, look) {
                   headOf(C.man, look);
                   look.y -= 0.15;
                   v.set(look.x + 1.5, look.y + 0.3, look.z + 2.4);
                 }, fov: 33, drift: [0.2, 0.09, 0.08] };
  // the bare wrist where the watch used to be
  S.aWrist   = { derive: function (t, v, look) {
                   C.man.armL.hand.getWorldPosition(look);
                   v.set(look.x + 0.62, look.y + 0.3, look.z + 0.6);
                 }, fov: 27, drift: [0.12, 0.06, 0.05] };

  // ---- 12: the street ----
  S.sWalk    = wideOn(C.man, { yaw: 0.6, dist: 6.50, height: 1.8, fov: 38 });
  S.sPullUp  = { pos: [1.5, 2.2, 7.0], look: [-6.5, 1.3, -4], fov: 42,
                 drift: [0.4, 0.18, 0.2],
                 path: [[1.5, 2.2, 7.0], [1.0, 11.0, 18.0], [-1.0, 30.0, 40.0]] };

  for (var k in S) SHOTS[k] = S[k];
  return SHOTS;
}

function smoothstep(x) {
  x = x < 0 ? 0 : (x > 1 ? 1 : x);
  return x * x * (3 - 2 * x);
}

function bez3(p, u, out) {
  var v = 1 - u;
  out.set(
    v * v * p[0][0] + 2 * v * u * p[1][0] + u * u * p[2][0],
    v * v * p[0][1] + 2 * v * u * p[1][1] + u * u * p[2][1],
    v * v * p[0][2] + 2 * v * u * p[1][2] + u * u * p[2][2]
  );
  return out;
}

// Mid-line camera changes, each tagged with its scene so it cannot survive
// the cut into the next one.
var SUBCUTS = [
  { t: 10.20, sc: 2,  cam: "oTablet"  },
  { t: 22.60, sc: 2,  cam: "oManLow"  },
  { t: 29.90, sc: 2,  cam: "oIsolate" },
  { t: 33.80, sc: 3,  cam: "oManCU"   },
  { t: 50.40, sc: 4,  cam: "hManCU"   },
  { t: 51.90, sc: 4,  cam: "hTwo"     },
  { t: 58.60, sc: 5,  cam: "rWide"    },
  { t: 62.10, sc: 5,  cam: "rMan"     },
  { t: 73.20, sc: 5,  cam: "rTwo"     },
  { t: 99.80, sc: 7,  cam: "aOver"    },
  { t: 107.0, sc: 7,  cam: "aManCU"   },
  { t: 116.0, sc: 8,  cam: "aWide"    },
  { t: 128.5, sc: 8,  cam: "aPhoto"   },
  { t: 151.0, sc: 9,  cam: "aWindow"  },
  { t: 163.5, sc: 9,  cam: "aManCU"   },
  { t: 176.5, sc: 10, cam: "aTwo"     },
  { t: 182.0, sc: 10, cam: "aFriendCU"},
  { t: 206.5, sc: 11, cam: "aWrist"   },
  { t: 219.0, sc: 12, cam: "sWalk"    }
];
