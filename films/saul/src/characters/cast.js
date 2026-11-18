// characters/cast.js — who is in the film, and where they stand in each scene.
//
// Saul is built once and reused across every scene, so his identity cannot
// drift. His robe swaps colour at the baptism (dark -> pale) because that is
// the one costume change the story actually makes; nothing else about him
// changes.
//
// Crowds are built from the same rig with varied height, build, skin, robe and
// headwear, and each extra carries its own idle phase so a crowd never moves
// as one body.

function buildCast() {
  var C = {};

  // ---- principals ----
  C.saul = buildPerson({
    skin: PAL.skinS, robe: PAL.robeSaulDark, under: 0x2f2a33,
    hair: PAL.hairDark, beard: true, belt: true, mantle: 0x332c38,
    height: 1.02, eye: 0x3a2a1e
  });
  C.anan = buildPerson({
    skin: PAL.skinA, robe: PAL.robeAnanias, under: 0x8e8775,
    hair: PAL.hairGrey, beard: true, beardColor: PAL.hairGrey,
    headwrap: 0x9a9281, height: 0.99, build: 1.04, eye: 0x3b2d22
  });
  C.comp1 = buildPerson({
    skin: PAL.skinD, robe: PAL.robeCrowdB, hair: PAL.hairMid, beard: true,
    headwrap: 0x6d6456, belt: true, height: 1.0
  });
  C.comp2 = buildPerson({
    skin: PAL.skinC, robe: PAL.robeCrowdD, hair: PAL.hairDark,
    headwrap: 0x7a6e5e, belt: true, height: 0.97, build: 1.06
  });
  C.chris = buildPerson({
    skin: PAL.skinC, robe: PAL.robeCrowdC, hair: PAL.hairMid, beard: true,
    height: 0.98
  });
  C.citA = buildPerson({
    skin: PAL.skinA, robe: PAL.robeCrowdA, hair: PAL.hairMid, beard: true,
    headwrap: 0x857a63, height: 1.0, build: 1.05
  });
  C.citB = buildPerson({
    skin: PAL.skinD, robe: PAL.robeCrowdE, hair: PAL.hairGrey, beard: true,
    beardColor: PAL.hairGrey, height: 0.96, build: 1.02
  });

  // ---- extras ----
  // Two guards for Jerusalem, a family being arrested, a crowd for Damascus.
  C.guards = [];
  for (var g = 0; g < 2; g++) {
    C.guards.push(buildPerson({
      skin: g ? PAL.skinD : PAL.skinA, robe: 0x5e5a52, under: 0x4a463e,
      hair: PAL.hairDark, helmet: true, belt: true,
      height: 1.03 + g * 0.02, build: 1.08
    }));
  }

  C.persecuted = [];
  var pcfg = [
    { skin: PAL.skinC, robe: PAL.robeCrowdC, h: 0.99, hair: PAL.hairMid, beard: true },
    { skin: PAL.skinA, robe: PAL.robeCrowdA, h: 0.94, hair: PAL.hairDark, wrap: 0x8d7f6a },
    { skin: PAL.skinD, robe: PAL.robeCrowdD, h: 0.79, hair: PAL.hairDark },   // a child
    { skin: PAL.skinS, robe: PAL.robeCrowdB, h: 0.97, hair: PAL.hairGrey, beard: true },
    { skin: PAL.skinC, robe: PAL.robeCrowdE, h: 0.92, hair: PAL.hairMid, wrap: 0x9c8d72 }
  ];
  for (var p = 0; p < pcfg.length; p++) {
    var pc = pcfg[p];
    C.persecuted.push(buildPerson({
      skin: pc.skin, robe: pc.robe, hair: pc.hair, beard: !!pc.beard,
      headwrap: pc.wrap || null, height: pc.h, build: 0.98 + (p % 3) * 0.04
    }));
  }

  C.crowd = [];
  var robes = [PAL.robeCrowdA, PAL.robeCrowdB, PAL.robeCrowdC, PAL.robeCrowdD, PAL.robeCrowdE];
  var skins = [PAL.skinS, PAL.skinA, PAL.skinC, PAL.skinD];
  var hairs = [PAL.hairDark, PAL.hairMid, PAL.hairGrey];
  for (var i = 0; i < 14; i++) {
    C.crowd.push(buildPerson({
      skin: skins[i % 4], robe: robes[i % 5], hair: hairs[i % 3],
      beard: i % 3 !== 1, headwrap: i % 4 === 0 ? robes[(i + 2) % 5] : null,
      height: 0.90 + (i % 5) * 0.035, build: 0.96 + (i % 4) * 0.045
    }));
  }

  return C;
}

// Flatten the cast to a list, for the per-frame animation pass.
function castList(C) {
  var all = [C.saul, C.anan, C.comp1, C.comp2, C.chris, C.citA, C.citB];
  return all.concat(C.guards, C.persecuted, C.crowd);
}

function hideAll(C) {
  var l = castList(C);
  for (var i = 0; i < l.length; i++) l[i].root.visible = false;
}

function place(c, x, z, ry) {
  c.root.visible = true;
  c.root.position.x = x;
  c.root.position.z = z;
  c.root.rotation.y = ry === undefined ? 0 : ry;
}

// Reset the voluntary pose targets. Involuntary state (breath/blink phase) is
// deliberately left alone so nobody resyncs on a scene change.
function clearPose(c) {
  var s = c.s;
  s.lean = 0; s.slump = 0; s.headDown = 0; s.headTurn = 0; s.headTilt = 0;
  s.browAngle = 0; s.browRaise = 0; s.lidDrop = 0;
  s.armUpL = 0; s.armUpR = 0; s.reach = 0; s.point = 0; s.shield = 0;
  s.kneel = 0; s.fallen = 0; s.walk = 0;
}

// -------------------------------------------------------------- staging
// Each scene places only the characters it needs and hides the rest, which is
// also what keeps the draw call count down.

function stageScene(n, C, SETS) {
  hideAll(C);
  for (var k in SETS) if (SETS[k]) SETS[k].visible = false;
  var l = castList(C);
  for (var i = 0; i < l.length; i++) clearPose(l[i]);

  if (n === 1) {
    SETS.jerus.visible = true;
    place(C.saul, 0.2, 1.2, Math.PI);          // facing away, down the street
    place(C.guards[0], -1.3, 1.9, Math.PI);
    place(C.guards[1], 1.6, 2.1, Math.PI);
    place(C.chris, -1.1, -4.6, 0);
    place(C.persecuted[0], 0.3, -5.4, 0.2);
    place(C.persecuted[1], -2.2, -5.9, -0.3);
    place(C.persecuted[2], -1.5, -4.0, 0.1);   // the child, close to the adults
    place(C.persecuted[3], 1.7, -6.3, -0.2);
    place(C.persecuted[4], 2.4, -4.9, 0.4);
    return;
  }

  if (n === 2 || n === 3 || n === 4) {
    SETS.road.visible = true;
    // Saul on the road, companions flanking and slightly behind
    place(C.saul, 0, -1.8, Math.PI);
    place(C.comp1, -1.6, -0.5, Math.PI);
    place(C.comp2, 1.7, -0.2, Math.PI);
    if (n === 2) {
      C.saul.s.walk = 1; C.comp1.s.walk = 1; C.comp2.s.walk = 1;
    }
    return;
  }

  if (n === 5) {
    SETS.house.visible = true;
    place(C.saul, 0.3, -0.9, 0.25);
    C.saul.s.kneel = 1;
    C.saul.s.headDown = 0.85;
    C.saul.s.lidDrop = 1;
    C.saul.s.armUpL = 0.3; C.saul.s.armUpR = 0.3;
    return;
  }

  if (n === 6) {
    SETS.ananHouse.visible = true;
    place(C.anan, -0.1, -0.85, 0.1);
    C.anan.s.kneel = 1;
    C.anan.s.armUpL = 0.45; C.anan.s.armUpR = 0.45;
    return;
  }

  if (n === 7) {
    SETS.house.visible = true;
    place(C.saul, 0.35, -0.85, 0.3);
    C.saul.s.kneel = 1;
    C.saul.s.lidDrop = 1;
    C.saul.s.headDown = 0.4;
    place(C.anan, -1.5, -0.2, 1.1);
    return;
  }

  if (n === 8) {
    SETS.court.visible = true;
    // Saul on the steps facing +z; the crowd stands in front of him, which
    // is also between him and the wide cameras, so a wide shot of him
    // preaching actually contains an audience. (First pass staged the crowd
    // behind every camera, so he appeared to preach to an empty courtyard.)
    place(C.saul, -0.15, -5.4, 0);
    C.saul.root.position.y = 0.72;
    place(C.citA, -2.9, -2.4, Math.PI - 0.35);
    place(C.citB, 3.0, -2.2, Math.PI + 0.3);
    // the crowd in a loose arc, nobody on a grid
    // a loose arc in front of the steps, nobody on a grid
    var arc = [
      [-4.4, -1.2, -0.30], [-2.6, -0.5, -0.18], [-1.0, -1.4, 0.05], [0.7, -0.6, 0.0],
      [2.3, -1.3, 0.14], [4.1, -0.7, 0.30], [-3.7, 1.0, -0.26], [-1.7, 1.5, -0.10],
      [0.4, 0.9, 0.0], [2.5, 1.4, 0.18], [4.6, 1.1, 0.28], [-5.4, 0.4, -0.40],
      [5.6, 0.2, 0.40], [1.3, 2.7, 0.05]
    ];
    for (var ci = 0; ci < C.crowd.length; ci++) {
      place(C.crowd[ci], arc[ci][0], arc[ci][1], arc[ci][2] + Math.PI);
      C.crowd[ci].s.headTurn = (rnd() - 0.5) * 0.3;
    }
    return;
  }

  if (n === 9) {
    SETS.road.visible = true;
    place(C.saul, 0, 0.5, Math.PI);
    C.saul.s.walk = 1;
    return;
  }
}
