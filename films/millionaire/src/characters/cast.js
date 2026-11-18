// characters/cast.js — six speakers plus background life.
//
// The man is built ONCE and reused in every scene. His face, proportions and
// identity never change; what changes is the jacket (removed after the
// collapse), the tie (gone by the apartment), the watch (taken off on camera
// in scene 6) and his shirt colour. The brief is explicit that the character
// must stay the same person throughout, so nothing else is allowed to vary.

function buildCast() {
  var C = {};

  C.man = buildPerson({
    modern: true, skin: PAL.skinA, robe: PAL.shirtWhite,
    trousers: PAL.suitCharcoal, jacket: PAL.suitNavy, tie: PAL.tieA,
    watch: PAL.watch, hair: PAL.hairSalt, beard: false,
    height: 1.03, build: 1.02, eye: 0x3a3028
  });

  C.asst = buildPerson({
    modern: true, skin: PAL.skinD, robe: PAL.blouse,
    trousers: PAL.skirtDark, jacket: PAL.skirtDark,
    hair: PAL.hairBlonde, height: 0.96, build: 0.95, eye: 0x3a4a3a
  });

  C.wife = buildPerson({
    modern: true, skin: PAL.skinD, robe: PAL.blouse,
    trousers: PAL.skirtDark, hair: PAL.hairWife,
    height: 0.96, build: 0.96, eye: 0x4a3828
  });

  C.doc = buildPerson({
    modern: true, skin: PAL.skinB, robe: PAL.scrubs,
    trousers: PAL.scrubs, jacket: PAL.coat,
    hair: PAL.hairDark, height: 1.0, build: 1.0, eye: 0x332a22
  });

  C.friend = buildPerson({
    modern: true, skin: PAL.skinC, robe: PAL.friendShirt,
    trousers: PAL.jeans, jacket: PAL.friendJacket,
    hair: PAL.hairDark, beard: true, height: 1.01, build: 1.06, eye: 0x2e2620
  });

  // background life: hospital staff, pedestrians. Never the focus, but the
  // brief asks for a world that keeps running, so they exist.
  C.extras = [];
  var ecfg = [
    { skin: PAL.skinB, shirt: PAL.scrubs, tr: PAL.scrubs, hair: PAL.hairDark, h: 0.97 },
    { skin: PAL.skinD, shirt: PAL.coat, tr: PAL.scrubs, hair: PAL.hairBlonde, h: 0.95 },
    { skin: PAL.skinC, shirt: PAL.plainShirt, tr: PAL.jeans, hair: PAL.hairMid, h: 1.0 },
    { skin: PAL.skinA, shirt: PAL.plainShirtAlt, tr: PAL.suitCharcoal, hair: PAL.hairGrey, h: 0.99 },
    { skin: PAL.skinD, shirt: PAL.blouse, tr: PAL.skirtDark, hair: PAL.hairWife, h: 0.94 },
    { skin: PAL.skinB, shirt: PAL.friendShirt, tr: PAL.jeans, hair: PAL.hairDark, h: 1.02 },
    { skin: PAL.skinA, shirt: PAL.plainShirt, tr: PAL.jeans, hair: PAL.hairSalt, h: 0.98 },
    { skin: PAL.skinC, shirt: PAL.shirtWhite, tr: PAL.suitNavy, hair: PAL.hairDark, h: 1.01 }
  ];
  for (var i = 0; i < ecfg.length; i++) {
    var e = ecfg[i];
    C.extras.push(buildPerson({
      modern: true, skin: e.skin, robe: e.shirt, trousers: e.tr,
      hair: e.hair, height: e.h, build: 0.95 + (i % 4) * 0.04
    }));
  }

  return C;
}

function castList(C) {
  return [C.man, C.asst, C.wife, C.doc, C.friend].concat(C.extras);
}

function hideAll(C) {
  var l = castList(C);
  for (var i = 0; i < l.length; i++) l[i].root.visible = false;
}

function place(c, x, z, ry, y) {
  c.root.visible = true;
  c.root.position.set(x, y === undefined ? 0 : y, z);
  c.root.rotation.y = ry === undefined ? 0 : ry;
}

function clearPose(c) {
  var s = c.s;
  s.lean = 0; s.slump = 0; s.headDown = 0; s.headTurn = 0; s.headTilt = 0;
  s.browAngle = 0; s.browRaise = 0; s.lidDrop = 0;
  s.armUpL = 0; s.armUpR = 0; s.reach = 0; s.point = 0; s.shield = 0;
  s.kneel = 0; s.fallen = 0; s.walk = 0;
}

// The man's decline, applied as a single function so it can never get out of
// step with itself. 0 = the opening, 1 = the apartment.
function setDecline(C, level) {
  var m = C.man;
  if (m.jacket) m.jacket.visible = level < 0.5;
  m.robe.material.color.setHex(level < 0.5 ? PAL.suitCharcoal : PAL.jeans);
  // posture floor: he never fully straightens again until scene 10
  m.s.slump = Math.max(m.s.slump, level * 0.35);
}

function setWatch(C, on) {
  if (C.man.watch) C.man.watch.visible = !!on;
}

// --------------------------------------------------------------- staging

function stageScene(n, C, SETS) {
  hideAll(C);
  for (var k in SETS) if (SETS[k]) SETS[k].visible = false;
  var l = castList(C);
  for (var i = 0; i < l.length; i++) clearPose(l[i]);

  // 1-2: the executive office
  if (n === 1 || n === 2) {
    SETS.office.visible = true;
    setDecline(C, 0);
    setWatch(C, true);
    // cu() stands in FRONT of a face, i.e. along the subject's own facing,
    // so whatever a character faces ends up BEHIND the camera and whatever
    // is at their back becomes the backdrop. The office's furniture sits at
    // z=-2.4 (desk) to -6.9 (screen, shelves) and the glass wall at +5.2, so
    // the pair stand deep in the room with their backs to the furniture,
    // facing +z. Their close-ups then frame desk and shelves behind them.
    // Staged the other way round - which the first two passes did - every
    // face shot backs onto empty sky.
    place(C.man, 0.5, -3.3, 0.10);
    place(C.asst, -1.5, -4.4, 0.32);
    return;
  }

  // 3: the call - still the office, he is alone
  if (n === 3) {
    SETS.office.visible = true;
    setDecline(C, 0);
    setWatch(C, true);
    place(C.man, 0.45, -3.1, 0.08);
    return;
  }

  // 4: the hospital corridor
  if (n === 4) {
    SETS.hospital.visible = true;
    setDecline(C, 0.2);
    setWatch(C, true);
    place(C.man, 0.1, -3.2, Math.PI);          // facing down the corridor
    place(C.doc, -0.2, -7.4, 0);
    place(C.wife, 2.6, -2.0, -0.7);
    // staff at a distance, deliberately not the subject
    place(C.extras[0], -3.2, -9.5, 0.4);
    place(C.extras[1], 2.9, -10.2, -0.3);
    C.extras[0].s.walk = 0.4;
    C.extras[1].s.walk = 0.3;
    return;
  }

  // 5: the luxury house at night
  if (n === 5) {
    SETS.residence.visible = true;
    setDecline(C, 0.45);
    setWatch(C, true);
    place(C.man, -0.6, 0.55, 0.12);            // seated on the couch
    C.man.root.position.y = 0.30;
    C.man.s.kneel = 0.95;                      // reads as sitting
    C.man.s.slump = 0.7;
    C.man.s.headDown = 0.55;
    place(C.wife, 1.9, 2.2, Math.PI - 0.9);
    return;
  }

  // 6-11: the modest apartment
  if (n >= 6 && n <= 11) {
    SETS.apartment.visible = true;
    setDecline(C, 1);
    setWatch(C, n >= 7 ? false : true);        // the watch comes off in 6
    place(C.man, -1.1, -1.25, 0.30);
    C.man.root.position.y = 0.26;
    C.man.s.kneel = 0.95;
    C.man.s.slump = n <= 8 ? 0.55 : 0.3;
    if (n >= 7) {
      place(C.friend, 1.85, -0.5, -0.85);
      C.friend.root.position.y = 0.26;
      C.friend.s.kneel = 0.95;
    }
    if (n >= 10) {
      place(C.wife, -0.2, -1.5, 0.25);
      C.wife.root.position.y = 0.26;
      C.wife.s.kneel = 0.95;
    }
    return;
  }

  // 12: the street at sunrise
  if (n === 12) {
    SETS.street.visible = true;
    setDecline(C, 1);
    setWatch(C, false);
    place(C.man, -5.0, 2.0, Math.PI);
    C.man.s.walk = 1;
    C.man.s.slump = 0.12;
    // the city keeps running
    var ped = [[-6.2, -7, 0], [-4.4, -14, Math.PI], [5.6, -5, Math.PI],
               [6.4, -12, 0], [-5.8, -20, Math.PI], [5.2, -18, 0]];
    for (var p = 0; p < ped.length && p < C.extras.length; p++) {
      place(C.extras[p], ped[p][0], ped[p][1], ped[p][2]);
      C.extras[p].s.walk = 0.75 + (p % 3) * 0.12;
    }
    return;
  }
}
