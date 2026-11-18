// environments/sets.js — the film's six locations.
//
// Continuity rule from the brief: the office tower the film opens on is one
// of the towers visible from the street and from both homes, so the city is
// a single consistent skyline seen from different windows. buildSkyline() is
// therefore shared, with a seeded layout that does not change between sets.

// ------------------------------------------------------------- shared city

var SKYLINE_SEED = 20261118;

function skylineRnd(state) {
  state.v = (state.v * 1103515245 + 12345) & 0x7fffffff;
  return state.v / 0x7fffffff;
}

// One deterministic skyline, reused by every set that can see the city, so
// the same towers appear from the office, both homes and the street.
function buildSkyline(opts) {
  opts = opts || {};
  var G = new THREE.Group();
  var st = { v: SKYLINE_SEED };
  // Four distinct tones so the skyline has depth. Near-identical pale
  // greys read as one white mass once fog is applied.
  var cols = [PAL.towerA, PAL.towerB, PAL.towerC, PAL.towerFar];
  var n = opts.count || 70;
  for (var i = 0; i < n; i++) {
    var w = 3 + skylineRnd(st) * 7;
    var d = 3 + skylineRnd(st) * 7;
    var h = 8 + skylineRnd(st) * 52;
    var band = Math.floor(skylineRnd(st) * 4);
    var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(cols[band]));
    var ang = skylineRnd(st) * Math.PI * 2;
    var rad = 45 + skylineRnd(st) * 190;
    b.position.set(Math.sin(ang) * rad, h / 2, -Math.abs(Math.cos(ang)) * rad - 30);
    G.add(b);

    // lit windows: a single emissive slab per face reads better at distance
    // than hundreds of quads, and costs one draw call
    if (opts.lit) {
      var winM = new THREE.MeshBasicMaterial({
        color: 0xffd9a0, transparent: true,
        opacity: 0.25 + skylineRnd(st) * 0.5
      });
      var win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.82, h * 0.86), winM);
      win.position.set(b.position.x, b.position.y, b.position.z + d / 2 + 0.06);
      G.add(win);
    }
  }
  return G;
}

function groundPlane(size, col) {
  var m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat(col));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}

function framedPhoto(w, h) {
  // The family photograph: the film's recurring object. Deliberately
  // abstract - two adults and a child as flat shapes, never a face, because
  // a legible rendered face at this scale would look worse than a suggestion.
  var G = new THREE.Group();
  var frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), mat(0x3a2f26));
  G.add(frame);
  var img = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.84, h * 0.84), mat(0x9ab0c0));
  img.position.z = 0.012;
  G.add(img);
  var figs = [[-0.26, 0.52, 0x4a5668], [0.26, 0.52, 0xb88ca0], [0, 0.40, 0x7a8f6a]];
  for (var i = 0; i < figs.length; i++) {
    var body = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.17, h * figs[i][1] * 0.42, 0.01), mat(figs[i][2]));
    body.position.set(w * figs[i][0], -h * 0.08, 0.016);
    G.add(body);
    var head = new THREE.Mesh(new THREE.BoxGeometry(w * 0.1, w * 0.1, 0.01),
                              mat(PAL.skinA));
    head.position.set(w * figs[i][0], -h * 0.08 + h * figs[i][1] * 0.26, 0.016);
    G.add(head);
  }
  return G;
}

function officeChair() {
  var G = new THREE.Group();
  var seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.1, 0.54), mat(PAL.leatherChair));
  seat.position.y = 0.46;
  seat.castShadow = true;
  G.add(seat);
  var back = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.09), mat(PAL.leatherChair));
  back.position.set(0, 0.8, -0.24);
  back.castShadow = true;
  G.add(back);
  var post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 6), mat(PAL.steelDark));
  post.position.y = 0.23;
  G.add(post);
  for (var i = 0; i < 5; i++) {
    var a = (i / 5) * Math.PI * 2;
    var leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.3), mat(PAL.steelDark));
    leg.position.set(Math.sin(a) * 0.15, 0.04, Math.cos(a) * 0.15);
    leg.rotation.y = a;
    G.add(leg);
  }
  return G;
}

// ------------------------------------------------------ 1/2: the office

function buildOffice() {
  var S = new THREE.Group();

  var floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 15), mat(PAL.stoneFloor));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  S.add(floor);

  // The ceiling is a slab, not a plane. A single-sided plane facing down
  // renders as a black hole when the opening aerial looks at the building
  // from above, which is exactly what the first render did.
  var ceil = new THREE.Mesh(new THREE.BoxGeometry(19, 0.4, 16), mat(0xbdbab4));
  ceil.position.y = 3.7;
  S.add(ceil);
  // rooftop plant, so the aerial sees a building top rather than a slab
  var plant1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.5, 3.4), mat(0x9a9890));
  plant1.position.set(-4.5, 4.65, -2.0);
  S.add(plant1);
  var plant2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 2.6), mat(0x8a8882));
  plant2.position.set(4.2, 4.4, 2.2);
  S.add(plant2);
  var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 5.5, 6), mat(0x6e6c68));
  mast.position.set(6.5, 6.6, -4.5);
  S.add(mast);

  // floor-to-ceiling glass along the front and right
  var mull = mat(PAL.steelDark);
  for (var g = 0; g < 9; g++) {
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.5, 0.1), mull);
    post.position.set(-8 + g * 2, 1.75, 5.2);
    S.add(post);
  }
  var glassF = new THREE.Mesh(new THREE.PlaneGeometry(17.6, 3.5),
    new THREE.MeshLambertMaterial({ color: PAL.glass, transparent: true,
                                    opacity: 0.17, flatShading: true,
                                    side: THREE.DoubleSide }));
  glassF.position.set(0, 1.75, 5.22);
  S.add(glassF);

  // back and left walls, panelled
  var back = new THREE.Mesh(new THREE.PlaneGeometry(18, 3.5), mat(0xd8d4ce));
  back.position.set(0, 1.75, -7);
  back.receiveShadow = true;
  S.add(back);
  var leftW = new THREE.Mesh(new THREE.PlaneGeometry(12.2, 3.5), mat(0xcdc8c2));
  leftW.position.set(-8.8, 1.75, -0.9);
  leftW.rotation.y = Math.PI / 2;
  leftW.receiveShadow = true;
  S.add(leftW);

  // the desk
  var desk = new THREE.Group();
  var top = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.09, 1.2), mat(PAL.deskTop));
  top.position.y = 0.74;
  top.castShadow = true;
  desk.add(top);
  for (var dl = -1; dl <= 1; dl += 2) {
    var sideP = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.74, 1.1), mat(PAL.deskWoodDark));
    sideP.position.set(dl * 1.28, 0.37, 0);
    desk.add(sideP);
  }
  var modesty = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.07), mat(PAL.deskWood));
  modesty.position.set(0, 0.46, -0.52);
  desk.add(modesty);
  desk.position.set(0.2, 0, -2.4);
  S.add(desk);

  var lap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.3), mat(0x2a2e34));
  lap.position.set(-0.2, 0.80, -2.3);
  S.add(lap);
  var lapScr = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.02), mat(PAL.screenLit));
  lapScr.position.set(-0.2, 0.94, -2.45);
  lapScr.rotation.x = -0.25;
  S.add(lapScr);
  for (var pp = 0; pp < 5; pp++) {
    var pap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.004, 0.3), mat(0xf4f2ee));
    pap.position.set(0.75 + pp * 0.012, 0.787 + pp * 0.005, -2.35 + pp * 0.01);
    pap.rotation.y = (pp - 2) * 0.03;
    S.add(pap);
  }

  var chair = officeChair();
  chair.position.set(0.2, 0, -3.5);
  chair.rotation.y = Math.PI;
  S.add(chair);

  // presentation screen and shelving on the back wall
  var scr = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 0.1), mat(PAL.screen));
  scr.position.set(-4.4, 1.9, -6.9);
  S.add(scr);
  var scrGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.62), mat(PAL.screenLit));
  scrGlow.position.set(-4.4, 1.9, -6.83);
  S.add(scrGlow);

  for (var sh = 0; sh < 4; sh++) {
    var shelf = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 0.34), mat(PAL.shelf));
    shelf.position.set(4.6, 0.6 + sh * 0.58, -6.8);
    S.add(shelf);
    for (var bk = 0; bk < 9; bk++) {
      var book = new THREE.Mesh(
        new THREE.BoxGeometry(0.07 + (bk % 3) * 0.02, 0.26 + (bk % 4) * 0.03, 0.22),
        mat([0x6a3a3a, 0x3a4a6a, 0x4a5a3a, 0x6a5a3a][bk % 4]));
      book.position.set(3.55 + bk * 0.13, 0.77 + sh * 0.58 + (bk % 4) * 0.015, -6.8);
      S.add(book);
    }
  }

  var art = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.05, 0.06), mat(PAL.artA));
  art.position.set(-8.72, 2.0, -2.2);
  art.rotation.y = Math.PI / 2;
  S.add(art);

  // a plant, because every office has one
  var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.42, 8), mat(PAL.plantPot));
  pot.position.set(-7.4, 0.21, 3.2);
  S.add(pot);
  for (var lf = 0; lf < 7; lf++) {
    var leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), mat(PAL.plant));
    leaf.position.set(-7.4 + (lf % 3 - 1) * 0.22, 0.62 + lf * 0.1, 3.2 + (lf % 2 - 0.5) * 0.2);
    leaf.scale.y = 0.7;
    S.add(leaf);
  }

  var conf = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 1.4), mat(PAL.deskTop));
  conf.position.set(5.4, 0.75, 1.6);
  conf.castShadow = true;
  S.add(conf);
  for (var cl = 0; cl < 4; cl++) {
    var cleg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.75, 0.09), mat(PAL.deskWoodDark));
    cleg.position.set(5.4 + (cl % 2 ? 1.5 : -1.5), 0.375, 1.6 + (cl < 2 ? 0.55 : -0.55));
    S.add(cleg);
  }
  for (var cc = 0; cc < 4; cc++) {
    var cch = officeChair();
    cch.scale.setScalar(0.92);
    cch.position.set(5.4 + (cc % 2 ? 1.1 : -1.1), 0, 1.6 + (cc < 2 ? 1.2 : -1.2));
    cch.rotation.y = cc < 2 ? Math.PI : 0;
    S.add(cch);
  }

  // The tower this office sits in. Without it the aerial showed the room
  // floating in open sky with the city hanging around it.
  //
  // The shaft and the ground go DOWN from the office floor rather than the
  // city being moved: the skydome is centred on the world origin, so
  // relocating everything below y=0 puts the aerial camera outside the dome
  // and it renders as a black mass across the sky. Keeping the office at
  // y=0 and hanging the building beneath it leaves the dome where it works.
  var shaft = new THREE.Mesh(new THREE.BoxGeometry(19, 150, 16), mat(PAL.towerA));
  shaft.position.set(0, -75.2, -0.9);
  S.add(shaft);
  for (var fl = 0; fl < 42; fl++) {
    var band = new THREE.Mesh(new THREE.BoxGeometry(19.15, 1.6, 16.15),
      mat(PAL.glassDark));
    band.position.set(0, -3.0 - fl * 3.5, -0.9);
    S.add(band);
  }

  var grd = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), mat(0x6e7276));
  grd.rotation.x = -Math.PI / 2;
  grd.position.y = -150;
  S.add(grd);

  // Neighbours rise from that ground. They are built around the origin, so
  // they are lowered and scaled tall enough to read from this height.
  var sky = buildSkyline({ count: 70 });
  sky.position.y = -150;
  sky.scale.y = 2.6;
  S.add(sky);
  S.visible = false;
  return S;
}

// ------------------------------------------------------- 4: the hospital

function buildHospital() {
  var S = new THREE.Group();
  S.add(groundPlane(40, PAL.hospFloor));

  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), mat(0xeef2f4));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = 3.0;
  S.add(ceil);

  // corridor walls with a coloured trim line
  for (var sd = -1; sd <= 1; sd += 2) {
    var w = new THREE.Mesh(new THREE.PlaneGeometry(22, 3.0), mat(PAL.hospWall));
    w.position.set(sd * 4.6, 1.5, -3);
    w.rotation.y = -sd * Math.PI / 2;
    w.receiveShadow = true;
    S.add(w);
    var trim = new THREE.Mesh(new THREE.BoxGeometry(22, 0.1, 0.04), mat(PAL.hospTrim));
    trim.position.set(sd * 4.56, 0.95, -3);
    trim.rotation.y = -sd * Math.PI / 2;
    S.add(trim);
  }
  var endW = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 3.0), mat(PAL.hospWallLo));
  endW.position.set(0, 1.5, -14);
  S.add(endW);

  // fluorescent panels - the scene's only light source
  var panels = [];
  for (var fp = 0; fp < 7; fp++) {
    var pan = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5),
      new THREE.MeshBasicMaterial({ color: PAL.fluoro }));
    pan.rotation.x = Math.PI / 2;
    pan.position.set(0, 2.97, 1 - fp * 2.2);
    S.add(pan);
    panels.push(pan);
  }

  // double doors at the end
  for (var dd = -1; dd <= 1; dd += 2) {
    var door = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.2, 0.08), mat(0xc8d6de));
    door.position.set(dd * 0.5, 1.1, -13.9);
    S.add(door);
    var win = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.1), mat(0x8fb0c4));
    win.position.set(dd * 0.5, 1.7, -13.86);
    S.add(win);
  }

  // reception desk
  var rec = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.05, 0.7), mat(0xdfe6ea));
  rec.position.set(-3.1, 0.52, -7.5);
  rec.castShadow = true;
  S.add(rec);
  var recTop = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.07, 0.85), mat(PAL.hospTrim));
  recTop.position.set(-3.1, 1.08, -7.5);
  S.add(recTop);

  // waiting chairs in a row
  for (var wc = 0; wc < 5; wc++) {
    var seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.48), mat(PAL.hospChair));
    seat.position.set(3.3, 0.45, -1.2 - wc * 0.62);
    seat.castShadow = true;
    S.add(seat);
    var bk2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.07), mat(PAL.hospChair));
    bk2.position.set(3.58, 0.72, -1.2 - wc * 0.62);
    bk2.rotation.z = -0.12;
    S.add(bk2);
    for (var lg2 = -1; lg2 <= 1; lg2 += 2) {
      var l2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), mat(PAL.steelDark));
      l2.position.set(3.3 + lg2 * 0.2, 0.22, -1.2 - wc * 0.62);
      S.add(l2);
    }
  }

  // a medical cart, and signage
  var cart = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.4), mat(0xdfe4e8));
  cart.position.set(-3.6, 0.4, -2.0);
  cart.castShadow = true;
  S.add(cart);
  var sign = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.26, 0.04), mat(PAL.hospTrim));
  sign.position.set(0, 2.5, -13.8);
  S.add(sign);

  S.visible = false;
  S.userData.panels = panels;
  return S;
}

// ------------------------------------------- 5: the luxury residence (night)

function buildResidence() {
  var S = new THREE.Group();
  S.add(groundPlane(30, PAL.homeFloor));

  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), mat(0xbfb8ae));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = 3.2;
  S.add(ceil);

  // the panoramic window wall, looking at the city
  for (var g = 0; g < 7; g++) {
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 3.2, 0.09), mat(PAL.steelDark));
    post.position.set(-6 + g * 2, 1.6, 4.6);
    S.add(post);
  }
  var pane = new THREE.Mesh(new THREE.PlaneGeometry(13, 3.2),
    new THREE.MeshLambertMaterial({ color: PAL.glassDark, transparent: true,
                                    opacity: 0.2, flatShading: true,
                                    side: THREE.DoubleSide }));
  pane.position.set(0, 1.6, 4.62);
  S.add(pane);

  var back = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.2), mat(PAL.homeWall));
  back.position.set(0, 1.6, -6);
  back.receiveShadow = true;
  S.add(back);
  var leftW = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 3.2), mat(PAL.homeWallDark));
  leftW.position.set(-7, 1.6, -0.7);
  leftW.rotation.y = Math.PI / 2;
  S.add(leftW);

  // couch, facing the window
  var couch = new THREE.Group();
  var cseat = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.42, 0.95), mat(PAL.couch));
  cseat.position.y = 0.33;
  cseat.castShadow = true;
  couch.add(cseat);
  var cback = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.62, 0.24), mat(PAL.couchDark));
  cback.position.set(0, 0.74, -0.46);
  couch.add(cback);
  for (var ca = -1; ca <= 1; ca += 2) {
    var arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.5, 0.95), mat(PAL.couchDark));
    arm2.position.set(ca * 1.37, 0.47, 0);
    couch.add(arm2);
  }
  couch.position.set(-0.6, 0, 0.4);
  S.add(couch);

  var rug = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.0), mat(PAL.rugHome));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(-0.4, 0.014, 1.5);
  S.add(rug);

  var cof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.7), mat(PAL.deskWood));
  cof.position.set(-0.5, 0.42, 1.8);
  cof.castShadow = true;
  S.add(cof);

  // kitchen counter along the back
  var counter = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.95, 0.7), mat(PAL.counter));
  counter.position.set(4.0, 0.47, -5.4);
  counter.castShadow = true;
  S.add(counter);
  var ctop = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.07, 0.8), mat(0xb8b2a8));
  ctop.position.set(4.0, 0.98, -5.4);
  S.add(ctop);

  var dine = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 1.1), mat(PAL.deskTop));
  dine.position.set(4.2, 0.76, -2.6);
  S.add(dine);
  for (var dlg = 0; dlg < 4; dlg++) {
    var dl2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.76, 0.08), mat(PAL.deskWoodDark));
    dl2.position.set(4.2 + (dlg % 2 ? 0.85 : -0.85), 0.38, -2.6 + (dlg < 2 ? 0.42 : -0.42));
    S.add(dl2);
  }

  // table lamps: the only warm light in the scene
  var lamps = [];
  var lp = [[-2.6, 0.62, -0.4], [3.4, 1.12, -5.0]];
  for (var li = 0; li < lp.length; li++) {
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.3, 7), mat(0x3a3a40));
    base.position.set(lp[li][0], lp[li][1], lp[li][2]);
    S.add(base);
    var shade = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.24, 9),
      new THREE.MeshBasicMaterial({ color: PAL.lampWarm, transparent: true, opacity: 0.85 }));
    shade.position.set(lp[li][0], lp[li][1] + 0.26, lp[li][2]);
    S.add(shade);
    lamps.push({ pos: [lp[li][0], lp[li][1] + 0.26, lp[li][2]], shade: shade });
  }

  var photo = framedPhoto(0.34, 0.26);
  photo.position.set(1.9, 1.12, -5.9);
  S.add(photo);
  var art2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 0.05), mat(PAL.artB));
  art2.position.set(-3.4, 2.0, -5.95);
  S.add(art2);

  S.add(buildSkyline({ count: 70, lit: true }));

  // rain: vertical streaks outside the glass, animated by the frame loop
  var rainCount = 700;
  var rgeo = new THREE.BufferGeometry();
  var rpos = new Float32Array(rainCount * 3);
  var rseed = [];
  for (var ri = 0; ri < rainCount; ri++) {
    var rx = (rnd() - 0.5) * 26, ry = rnd() * 14, rz = 5 + rnd() * 16;
    rpos[ri * 3] = rx; rpos[ri * 3 + 1] = ry; rpos[ri * 3 + 2] = rz;
    rseed.push({ x: rx, y: ry, z: rz, s: 5 + rnd() * 6 });
  }
  rgeo.setAttribute('position', new THREE.BufferAttribute(rpos, 3));
  var rain = new THREE.Points(rgeo, new THREE.PointsMaterial({
    color: PAL.rain, size: 0.07, transparent: true, opacity: 0.5,
    depthWrite: false, sizeAttenuation: true
  }));
  S.add(rain);

  S.visible = false;
  S.userData.lamps = lamps;
  S.userData.rain = { pts: rain, geo: rgeo, pos: rpos, seed: rseed, count: rainCount };
  return S;
}

// ------------------------------------------- 6-11: the modest apartment

function buildApartment() {
  var S = new THREE.Group();
  S.add(groundPlane(22, PAL.aptFloor));

  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(9, 8), mat(0xb8b2a6));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = 2.5;
  S.add(ceil);

  var back = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.5), mat(PAL.aptWall));
  back.position.set(0, 1.25, -3.6);
  back.receiveShadow = true;
  S.add(back);
  var leftW = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 2.5), mat(PAL.aptWallDark));
  leftW.position.set(-4.4, 1.25, -0.1);
  leftW.rotation.y = Math.PI / 2;
  leftW.receiveShadow = true;
  S.add(leftW);
  var rightW = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 2.5), mat(PAL.aptWall));
  rightW.position.set(4.4, 1.25, -0.1);
  rightW.rotation.y = -Math.PI / 2;
  rightW.receiveShadow = true;
  S.add(rightW);

  // the small window: this film's counterpart to the office glass
  var wf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.3, 0.1), mat(0x8a8274));
  wf.position.set(1.6, 1.5, -3.56);
  S.add(wf);
  var wg = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 1.14), mat(PAL.nightSky));
  wg.position.set(1.6, 1.5, -3.49);
  S.add(wg);
  var curtL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.5, 0.05), mat(PAL.curtain));
  curtL.position.set(0.72, 1.5, -3.46);
  S.add(curtL);
  var curtR = curtL.clone();
  curtR.position.x = 2.48;
  S.add(curtR);

  // couch
  var couch = new THREE.Group();
  var cs = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.38, 0.85), mat(PAL.aptCouch));
  cs.position.y = 0.3;
  cs.castShadow = true;
  couch.add(cs);
  var cb = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.56, 0.2), mat(PAL.aptCouchDark));
  cb.position.set(0, 0.67, -0.4);
  couch.add(cb);
  for (var a = -1; a <= 1; a += 2) {
    var ar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.44, 0.85), mat(PAL.aptCouchDark));
    ar.position.set(a * 1.1, 0.42, 0);
    couch.add(ar);
  }
  couch.position.set(-1.1, 0, -1.6);
  couch.rotation.y = 0.22;
  S.add(couch);

  // a second chair, for the friend
  var chair = new THREE.Group();
  var chs = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.36, 0.6), mat(PAL.aptCouch));
  chs.position.y = 0.3;
  chs.castShadow = true;
  chair.add(chs);
  var chb = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.54, 0.16), mat(PAL.aptCouchDark));
  chb.position.set(0, 0.63, -0.28);
  chair.add(chb);
  chair.position.set(1.9, 0, -0.5);
  chair.rotation.y = -0.85;
  S.add(chair);

  var cof = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.58), mat(PAL.pine));
  cof.position.set(0.1, 0.4, -0.65);
  cof.castShadow = true;
  S.add(cof);
  for (var cl2 = 0; cl2 < 4; cl2++) {
    var c2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), mat(PAL.deskWoodDark));
    c2.position.set(0.1 + (cl2 % 2 ? 0.47 : -0.47), 0.2, -0.65 + (cl2 < 2 ? 0.22 : -0.22));
    S.add(c2);
  }

  // kitchenette
  var kc = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.88, 0.6), mat(0x9a9488));
  kc.position.set(-3.0, 0.44, -3.2);
  S.add(kc);
  var kt = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 0.66), mat(0x7a7468));
  kt.position.set(-3.0, 0.9, -3.2);
  S.add(kt);

  // moving boxes - the evidence of the move, left unpacked
  var boxes = [[3.3, -2.6, 0.55], [3.5, -1.9, 0.45], [-3.6, -1.4, 0.5], [3.1, -2.2, 0.4]];
  for (var bi = 0; bi < boxes.length; bi++) {
    var sz = boxes[bi][2];
    var bx = new THREE.Mesh(new THREE.BoxGeometry(sz, sz * 0.8, sz),
      mat(bi % 2 ? PAL.box : PAL.boxDark));
    bx.position.set(boxes[bi][0], sz * 0.4, boxes[bi][1]);
    bx.rotation.y = (bi - 1.5) * 0.2;
    bx.castShadow = true;
    S.add(bx);
  }

  // the photograph, moved from the big house to a small shelf
  var shelf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.22), mat(PAL.pine));
  shelf.position.set(-2.4, 1.3, -3.5);
  S.add(shelf);
  var photo = framedPhoto(0.28, 0.22);
  photo.position.set(-2.4, 1.44, -3.46);
  S.userData.photo = photo;
  S.add(photo);

  var lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.26, 7), mat(0x55504a));
  lampBase.position.set(-3.3, 1.03, -3.0);
  S.add(lampBase);
  var lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.2, 9),
    new THREE.MeshBasicMaterial({ color: PAL.lampWarm, transparent: true, opacity: 0.85 }));
  lampShade.position.set(-3.3, 1.26, -3.0);
  S.add(lampShade);

  S.visible = false;
  S.userData.lamps = [{ pos: [-3.3, 1.26, -3.0], shade: lampShade }];
  S.userData.window = wg;
  return S;
}

// ------------------------------------------------------- 12: the street

function buildStreet() {
  var S = new THREE.Group();
  S.add(groundPlane(200, PAL.asphalt));

  // sidewalk both sides, road down the middle
  for (var sd = -1; sd <= 1; sd += 2) {
    var sw = new THREE.Mesh(new THREE.BoxGeometry(5, 0.16, 120), mat(PAL.sidewalk));
    sw.position.set(sd * 6.5, 0.08, -40);
    sw.receiveShadow = true;
    S.add(sw);
  }
  for (var dash = 0; dash < 30; dash++) {
    var d2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 1.6), mat(0xc8c4b4));
    d2.position.set(0, 0.02, 4 - dash * 4);
    S.add(d2);
  }

  // shopfronts
  for (var sh2 = 0; sh2 < 12; sh2++) {
    var side = sh2 % 2 ? 1 : -1;
    var h = 4 + (sh2 % 3) * 2.5;
    var shop = new THREE.Mesh(new THREE.BoxGeometry(6, h, 7),
      mat(sh2 % 2 ? PAL.shopA : PAL.shopB));
    shop.position.set(side * 12.5, h / 2, -2 - Math.floor(sh2 / 2) * 9);
    shop.castShadow = true;
    shop.receiveShadow = true;
    S.add(shop);
    var win2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 4.4), mat(PAL.glassLit));
    win2.position.set(side * 9.45, 1.4, -2 - Math.floor(sh2 / 2) * 9);
    S.add(win2);
    var awn = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 4.6),
      mat(sh2 % 3 ? 0x8a4a42 : 0x3a5a6a));
    awn.position.set(side * 8.7, 2.6, -2 - Math.floor(sh2 / 2) * 9);
    awn.rotation.z = side * 0.12;
    S.add(awn);
  }

  // street trees and lamp posts
  for (var t = 0; t < 10; t++) {
    var side2 = t % 2 ? 1 : -1;
    var tr = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 2.4, 6), mat(PAL.trunk));
    tr.position.set(side2 * 5.2, 1.3, -4 - t * 7);
    tr.castShadow = true;
    S.add(tr);
    for (var cl3 = 0; cl3 < 3; cl3++) {
      var can = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), mat(PAL.treeGreen));
      can.position.set(side2 * 5.2 + (cl3 - 1) * 0.45, 2.9 + cl3 * 0.3, -4 - t * 7 + (cl3 % 2) * 0.4);
      can.castShadow = true;
      S.add(can);
    }
    var lpst = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 6), mat(PAL.lampPost));
    lpst.position.set(-side2 * 5.4, 2.1, -7 - t * 7);
    S.add(lpst);
    var head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.26), mat(PAL.lampPost));
    head.position.set(-side2 * 5.4, 4.2, -7 - t * 7);
    S.add(head);
  }

  // parked cars
  var carCols = [PAL.carA, PAL.carB, PAL.carC];
  for (var c3 = 0; c3 < 8; c3++) {
    var side3 = c3 % 2 ? 1 : -1;
    var car = new THREE.Group();
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.62, 4.2), mat(carCols[c3 % 3]));
    body.position.y = 0.62;
    body.castShadow = true;
    car.add(body);
    var cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.52, 2.1), mat(carCols[c3 % 3]));
    cab.position.set(0, 1.14, -0.2);
    car.add(cab);
    var gl = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.34, 2.0), mat(0x2a3038));
    gl.position.set(0, 1.2, -0.2);
    car.add(gl);
    for (var wl = 0; wl < 4; wl++) {
      var wh = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 8), mat(0x1e1e22));
      wh.rotation.z = Math.PI / 2;
      wh.position.set((wl % 2 ? 0.88 : -0.88), 0.33, wl < 2 ? 1.35 : -1.35);
      car.add(wh);
    }
    car.position.set(side3 * 3.6, 0, -5 - c3 * 8);
    S.add(car);
  }

  S.add(buildSkyline({ count: 60 }));
  S.visible = false;
  return S;
}
