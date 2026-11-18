// characters/rig.js — one jointed low-poly body, reused for every character.
//
// The joint stack is hips -> torso -> chest -> neck -> head, so a curved spine
// and a lowered head compose instead of fighting each other. Faces have no
// blend shapes: expression is brow angle, eyelid position, jaw opening and the
// line of the shoulders, which is all that reads at these shot sizes anyway.
//
// Every character is built from this one function. Variation comes from cfg
// (skin, robe, hair, height, build, headwear) rather than from separate
// meshes, so a crowd is cheap and no two figures are identical.

function buildPerson(cfg) {
  cfg = cfg || {};
  var P = new THREE.Group();
  var skin = mat(cfg.skin || PAL.skinA);
  var cloth = mat(cfg.robe || PAL.robeCrowdA);
  var under = mat(cfg.under || cfg.robe || PAL.robeCrowdB);
  var hairM = mat(cfg.hair || PAL.hairDark);
  var scale = cfg.height || 1;
  var build = cfg.build || 1;          // 1 = average, >1 heavier
  P.scale.setScalar(scale);

  // ---- hips / torso / chest ----
  var hips = new THREE.Group();
  hips.position.y = 0.92;
  P.add(hips);

  var torso = new THREE.Group();
  hips.add(torso);

  var pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.40 * build, 0.24, 0.26), cloth);
  pelvis.position.y = 0.10;
  pelvis.castShadow = true;
  torso.add(pelvis);

  var chest = new THREE.Group();
  chest.position.y = 0.26;
  torso.add(chest);

  var ribs = new THREE.Mesh(new THREE.BoxGeometry(0.46 * build, 0.40, 0.28), cloth);
  ribs.position.y = 0.18;
  ribs.castShadow = true;
  chest.add(ribs);

  // Silhouette below the waist. `modern` gives trousers (the legs read on
  // their own); otherwise a tapered skirt, which is what sells a robe.
  // `robe` is returned either way so a costume change can recolour one thing.
  var robe;
  if (cfg.modern) {
    robe = new THREE.Mesh(new THREE.BoxGeometry(0.38 * build, 0.30, 0.27),
                          mat(cfg.trousers || cfg.robe || PAL.suitCharcoal));
    robe.position.y = -0.09;
    robe.castShadow = true;
    torso.add(robe);
  } else {
    robe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.30 * build, 0.42 * build, 0.95, 7, 1, true), cloth);
    robe.position.y = -0.38;
    robe.castShadow = true;
    torso.add(robe);
  }

  // A suit jacket: two front panels with a gap, open over the shirt. Worn
  // open so the shirt colour stays visible, which is what makes the later
  // jacket-off change legible at a glance.
  var jacket = null;
  if (cfg.jacket) {
    jacket = new THREE.Group();
    var jm = mat(cfg.jacket);
    for (var js = -1; js <= 1; js += 2) {
      var panel = new THREE.Mesh(new THREE.BoxGeometry(0.19 * build, 0.66, 0.30), jm);
      panel.position.set(js * 0.145 * build, 0.04, 0.012);
      panel.castShadow = true;
      jacket.add(panel);
    }
    var back = new THREE.Mesh(new THREE.BoxGeometry(0.50 * build, 0.66, 0.08), jm);
    back.position.set(0, 0.04, -0.125);
    back.castShadow = true;
    jacket.add(back);
    var collarL = new THREE.Mesh(new THREE.BoxGeometry(0.10 * build, 0.20, 0.10), jm);
    collarL.position.set(-0.13 * build, 0.30, 0.10);
    collarL.rotation.z = 0.3;
    jacket.add(collarL);
    var collarR = collarL.clone();
    collarR.position.x = 0.13 * build;
    collarR.rotation.z = -0.3;
    jacket.add(collarR);
    chest.add(jacket);
  }

  // The tie is its own object so it can come off with the suit.
  var tie = null;
  if (cfg.tie) {
    tie = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.34, 0.025), mat(cfg.tie));
    tie.position.set(0, 0.16, 0.148);
    chest.add(tie);
  }

  // The watch is its own object so it can come off on camera later.
  var watch = null;
  if (cfg.watch) {
    watch = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.035, 0.09),
                           mat(cfg.watch));
    watch.position.y = -0.255;
  }

  if (cfg.sash) {
    var sash = new THREE.Mesh(new THREE.BoxGeometry(0.48 * build, 0.09, 0.30), mat(cfg.sash));
    sash.position.y = 0.00;
    chest.add(sash);
  }
  if (cfg.belt) {
    var belt = new THREE.Mesh(new THREE.BoxGeometry(0.42 * build, 0.07, 0.28), mat(PAL.leather));
    belt.position.y = 0.00;
    torso.add(belt);
  }
  if (cfg.mantle) {   // a cloak over one shoulder
    var mantle = new THREE.Mesh(new THREE.BoxGeometry(0.50 * build, 0.52, 0.10), mat(cfg.mantle));
    mantle.position.set(0, 0.10, -0.17);
    chest.add(mantle);
  }

  // ---- neck / head ----
  var neck = new THREE.Group();
  neck.position.y = 0.40;
  chest.add(neck);

  var neckM = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.13, 6), skin);
  neckM.position.y = 0.05;
  neck.add(neckM);

  var head = new THREE.Group();
  head.position.y = 0.17;
  neck.add(head);

  var skull = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.27, 0.235), skin);
  skull.castShadow = true;
  head.add(skull);

  var brow = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.03), skin);
  brow.position.set(0, 0.055, 0.122);
  head.add(brow);

  // jaw hinges at the back so the chin swings, as a jaw does
  var jaw = new THREE.Group();
  jaw.position.set(0, -0.085, -0.06);
  head.add(jaw);
  var jawM = new THREE.Mesh(new THREE.BoxGeometry(0.205, 0.085, 0.215), skin);
  jawM.position.set(0, -0.02, 0.085);
  jaw.add(jawM);

  var mouth = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.022, 0.012), mat(0x4a2c22));
  mouth.position.set(0, -0.012, 0.196);
  jaw.add(mouth);

  function eye(sx) {
    var g = new THREE.Group();
    g.position.set(sx * 0.062, 0.008, 0.108);
    var white = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.040, 0.012), mat(0xf0e6d8));
    g.add(white);
    var iris = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.026, 0.014), mat(cfg.eye || 0x3b2a1c));
    iris.position.z = 0.004;
    g.add(iris);
    // lid slides down over the eye - blinks and the half-lidded blind look
    var lid = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.044, 0.016), skin);
    lid.position.set(0, 0.044, 0.006);
    g.add(lid);
    var browBar = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.016, 0.014), hairM);
    browBar.position.set(0, 0.052, 0.012);
    g.add(browBar);
    head.add(g);
    return { g: g, lid: lid, brow: browBar, iris: iris };
  }
  var eyeL = eye(-1), eyeR = eye(1);

  // ---- hair / beard / headwear ----
  if (!cfg.bald) {
    var cap = new THREE.Mesh(new THREE.BoxGeometry(0.252, 0.10, 0.252), hairM);
    cap.position.y = 0.125;
    head.add(cap);
    var backHair = new THREE.Mesh(new THREE.BoxGeometry(0.248, 0.16, 0.06), hairM);
    backHair.position.set(0, 0.03, -0.106);
    head.add(backHair);
  }
  if (cfg.beard) {
    var beard = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.12, 0.075), mat(cfg.beardColor || cfg.hair || PAL.hairDark));
    beard.position.set(0, -0.055, 0.145);
    jaw.add(beard);
  }
  if (cfg.headwrap) {
    var wrap = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.095, 0.27), mat(cfg.headwrap));
    wrap.position.y = 0.145;
    head.add(wrap);
    var tail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.05), mat(cfg.headwrap));
    tail.position.set(0.09, 0.0, -0.12);
    head.add(tail);
  }
  if (cfg.helmet) {
    var helm = new THREE.Mesh(new THREE.BoxGeometry(0.265, 0.13, 0.265), mat(PAL.armour));
    helm.position.y = 0.135;
    head.add(helm);
    var crest = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.085, 0.24), mat(PAL.armourLit));
    crest.position.y = 0.21;
    head.add(crest);
  }

  // ---- arms ----
  function arm(side) {
    var sh = new THREE.Group();
    sh.position.set(side * 0.255 * build, 0.30, 0);
    chest.add(sh);
    var upper = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.30, 0.095), cloth);
    upper.position.y = -0.15;
    upper.castShadow = true;
    sh.add(upper);
    var el = new THREE.Group();
    el.position.y = -0.30;
    sh.add(el);
    var fore = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.28, 0.082), skin);
    fore.position.y = -0.14;
    fore.castShadow = true;
    el.add(fore);
    var hand = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.10, 0.075), skin);
    hand.position.y = -0.31;
    el.add(hand);
    sh.rotation.z = side * 0.09;
    return { sh: sh, el: el, hand: hand };
  }
  var armL = arm(-1), armR = arm(1);
  if (watch) armL.el.add(watch);     // worn on the left wrist

  // ---- legs (hidden under the robe but they carry the walk) ----
  function leg(side) {
    var hip = new THREE.Group();
    hip.position.set(side * 0.115, 0.0, 0);
    hips.add(hip);
    var thigh = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.42, 0.13), under);
    thigh.position.y = -0.21;
    hip.add(thigh);
    var knee = new THREE.Group();
    knee.position.y = -0.42;
    hip.add(knee);
    var shin = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.42, 0.11), under);
    shin.position.y = -0.21;
    knee.add(shin);
    var foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.055, 0.225), mat(PAL.leather));
    foot.position.set(0, -0.45, 0.045);
    knee.add(foot);
    return { hip: hip, knee: knee, foot: foot };
  }
  var legL = leg(-1), legR = leg(1);

  return {
    root: P, hips: hips, torso: torso, chest: chest, neck: neck, head: head,
    jaw: jaw, mouth: mouth, brow: brow, eyeL: eyeL, eyeR: eyeR,
    armL: armL, armR: armR, legL: legL, legR: legR, robe: robe,
    jacket: jacket, watch: watch, tie: tie, shirt: ribs,
    // per-character animation state, eased toward targets every frame
    s: {
      lean: 0, slump: 0, headDown: 0, headTurn: 0, headTilt: 0,
      browAngle: 0, browRaise: 0, lidDrop: 0, jawOpen: 0,
      armUpL: 0, armUpR: 0, reach: 0, point: 0, shield: 0,
      kneel: 0, fallen: 0, walk: 0, walkPhase: 0, talking: 0,
      blinkT: rnd() * 3, breathT: rnd() * 6.28, sway: rnd() * 6.28
    }
  };
}
