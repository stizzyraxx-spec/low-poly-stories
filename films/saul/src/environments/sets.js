// environments/sets.js — the film's nine locations.
//
// Each set is a Group that is hidden until its scene. Only one is visible at a
// time, so triangle count stays low even though the film travels from
// Jerusalem to the Damascus road to three interiors and a public courtyard.
//
// Shared builders (wall, building, rock, hill, olive tree) are reused across
// sets, which is what keeps the architecture consistent between cities.

// ---------------------------------------------------------------- builders

function stoneWall(w, h, d, colA, colB) {
  // coursed masonry: alternating rows, offset by half a block
  var g = new THREE.Group();
  var bw = 1.15, bh = 0.52;
  var cols = Math.max(1, Math.round(w / bw)), rows = Math.max(1, Math.round(h / bh));
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.97, bh * 0.94, d),
        mat(r % 2 ? colA : colB));
      b.position.set(-w / 2 + c * bw + (r % 2) * bw * 0.5 + bw / 2,
                     bh / 2 + r * bh, 0);
      b.receiveShadow = true;
      b.castShadow = true;
      g.add(b);
    }
  }
  return g;
}

function building(w, h, d, opts) {
  opts = opts || {};
  var g = new THREE.Group();
  var body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
    mat(opts.col || PAL.sand));
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // parapet, so rooflines are not bare boxes
  var par = new THREE.Mesh(new THREE.BoxGeometry(w * 1.04, 0.16, d * 1.04),
    mat(opts.colTop || PAL.sandDark));
  par.position.y = h + 0.08;
  g.add(par);

  if (opts.door) {
    var dr = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.35, 0.08), mat(PAL.woodDark));
    dr.position.set(opts.doorX || 0, 0.675, d / 2 + 0.04);
    g.add(dr);
  }
  var nWin = opts.windows === undefined ? 2 : opts.windows;
  for (var i = 0; i < nWin; i++) {
    var win = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.44, 0.07),
      mat(0x2a2017));
    win.position.set(-w / 2 + (i + 1) * (w / (nWin + 1)), h * 0.62, d / 2 + 0.035);
    g.add(win);
  }
  if (opts.awning) {
    var aw = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.05, 1.5),
      mat(opts.awning));
    aw.position.set(0, h * 0.5, d / 2 + 0.75);
    aw.rotation.x = 0.13;
    aw.castShadow = true;
    g.add(aw);
    for (var p = -1; p <= 1; p += 2) {
      var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, h * 0.5, 5),
        mat(PAL.wood));
      pole.position.set(p * w * 0.35, h * 0.25, d / 2 + 1.42);
      g.add(pole);
    }
  }
  return g;
}

function rock(r, col) {
  var m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), mat(col || PAL.rock));
  m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
  m.scale.set(1, 0.62 + rnd() * 0.5, 1);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function hill(r, h, col) {
  var m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7, 1), mat(col));
  m.rotation.y = rnd() * 3;
  return m;
}

function oliveTree(s) {
  var g = new THREE.Group();
  var tr = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * s, 0.11 * s, 1.1 * s, 5),
    mat(PAL.trunk));
  tr.position.y = 0.55 * s;
  tr.castShadow = true;
  g.add(tr);
  for (var i = 0; i < 3; i++) {
    var cl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42 * s, 0), mat(PAL.olive));
    cl.position.set((rnd() - 0.5) * 0.5 * s, (1.1 + rnd() * 0.42) * s, (rnd() - 0.5) * 0.5 * s);
    cl.scale.y = 0.78;
    cl.castShadow = true;
    g.add(cl);
  }
  return g;
}

function scrub(s) {
  var m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2 * s, 0),
    mat(rnd() > 0.5 ? PAL.scrub : PAL.scrubDry));
  m.scale.set(1, 0.55, 1);
  return m;
}

function clayJug(s) {
  var g = new THREE.Group();
  var b = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * s, 0.07 * s, 0.26 * s, 7),
    mat(PAL.clay));
  b.position.y = 0.13 * s;
  b.castShadow = true;
  g.add(b);
  var nk = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * s, 0.055 * s, 0.09 * s, 6),
    mat(PAL.clayDark));
  nk.position.y = 0.3 * s;
  g.add(nk);
  return g;
}

function oilLamp() {
  var g = new THREE.Group();
  var bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.055, 7),
    mat(PAL.clayDark));
  g.add(bowl);
  var flame = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.075, 5),
    emat(PAL.lampGlow, 0.92));
  flame.position.y = 0.065;
  g.add(flame);
  return { root: g, flame: flame };
}

function groundPlane(size, col) {
  var m = new THREE.Mesh(new THREE.PlaneGeometry(size, size, 1, 1), mat(col));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}

// ------------------------------------------------------- 1: Jerusalem street

function buildJerusalem() {
  var S = new THREE.Group();
  S.add(groundPlane(160, PAL.ground));

  // a street running away from camera, buildings tight on both sides
  var awnings = [PAL.rug, PAL.rugAlt, PAL.robeCrowdB, PAL.rug];
  for (var i = 0; i < 9; i++) {
    var z = 2 - i * 4.4;
    var hL = 3.2 + rnd() * 2.6, hR = 3.0 + rnd() * 2.8;
    var bL = building(3.6, hL, 3.4, {
      col: i % 2 ? PAL.sand : PAL.sandLit, door: true,
      awning: i % 3 === 0 ? awnings[i % 4] : null, windows: 2
    });
    bL.position.set(-4.3, 0, z);
    bL.rotation.y = Math.PI / 2;
    S.add(bL);
    var bR = building(3.6, hR, 3.4, {
      col: i % 2 ? PAL.sandLit : PAL.sand, door: i % 2 === 0,
      awning: i % 3 === 1 ? awnings[(i + 2) % 4] : null, windows: 2
    });
    bR.position.set(4.3, 0, z);
    bR.rotation.y = -Math.PI / 2;
    S.add(bR);
  }

  // stone stair up to a doorway, and the city wall closing the far end
  var stair = new THREE.Group();
  for (var s = 0; s < 5; s++) {
    var st = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.46), mat(PAL.sandDark));
    st.position.set(0, 0.1 + s * 0.2, -s * 0.46);
    st.receiveShadow = true;
    stair.add(st);
  }
  stair.position.set(-2.6, 0, -16);
  S.add(stair);

  var wall = stoneWall(26, 6.4, 1.2, PAL.sandDark, PAL.sandShade);
  wall.position.set(0, 0, -34);
  S.add(wall);
  for (var t = -1; t <= 1; t += 2) {
    var tower = building(3.0, 8.2, 3.0, { col: PAL.sandDark, windows: 1 });
    tower.position.set(t * 9, 0, -34);
    S.add(tower);
  }

  // market stalls and pottery, the lived-in detail
  for (var m2 = 0; m2 < 7; m2++) {
    var stall = new THREE.Group();
    var tbl = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.8), mat(PAL.wood));
    tbl.position.y = 0.72;
    tbl.castShadow = true;
    stall.add(tbl);
    for (var lg = 0; lg < 4; lg++) {
      var L = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.72, 0.07), mat(PAL.woodDark));
      L.position.set((lg % 2 ? 0.66 : -0.66), 0.36, (lg < 2 ? 0.32 : -0.32));
      stall.add(L);
    }
    for (var j = 0; j < 3; j++) {
      var jug = clayJug(0.8);
      jug.position.set(-0.5 + j * 0.5, 0.76, 0);
      stall.add(jug);
    }
    stall.position.set(m2 % 2 ? -2.7 : 2.7, 0, -1 - m2 * 3.1);
    stall.rotation.y = m2 % 2 ? 0.3 : -0.3;
    S.add(stall);
  }
  for (var k = 0; k < 14; k++) {
    var jg = clayJug(0.7 + rnd() * 0.5);
    jg.position.set((rnd() - 0.5) * 7, 0, -rnd() * 24);
    S.add(jg);
  }

  S.visible = false;
  return S;
}

// --------------------------------------------------- 2/3/4: the Damascus road

function buildRoad() {
  var S = new THREE.Group();
  S.add(groundPlane(400, PAL.groundDry));

  // the road itself, a long pale strip running to the horizon
  var road = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 300), mat(PAL.road));
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.012, -120);
  road.receiveShadow = true;
  S.add(road);

  // rocks lining the road - these cast the hard shadows in the light scene
  for (var i = 0; i < 90; i++) {
    var side = rnd() > 0.5 ? 1 : -1;
    var r = rock(0.25 + rnd() * 0.85, rnd() > 0.6 ? PAL.rockDark : PAL.rock);
    r.position.set(side * (3.1 + rnd() * 14), 0, 8 - rnd() * 150);
    S.add(r);
  }
  // a few big boulders near the conversion point for shadow drama
  var bigs = [[-4.6, -3.2, 1.5], [5.2, -6.0, 1.9], [-6.4, -9.5, 1.3], [6.8, -1.5, 1.1]];
  for (var b = 0; b < bigs.length; b++) {
    var bb = rock(bigs[b][2], PAL.rockDark);
    bb.position.set(bigs[b][0], 0, bigs[b][1]);
    S.add(bb);
  }

  for (var s2 = 0; s2 < 70; s2++) {
    var sc = scrub(0.7 + rnd() * 0.9);
    sc.position.set((rnd() - 0.5) * 60, 0.05, 10 - rnd() * 160);
    S.add(sc);
  }
  for (var tr = 0; tr < 14; tr++) {
    var ot = oliveTree(0.9 + rnd() * 0.7);
    ot.position.set((rnd() > 0.5 ? 1 : -1) * (7 + rnd() * 22), 0, -rnd() * 130);
    S.add(ot);
  }

  // dry hills, then mountains, then the far haze - three depth bands
  for (var h = 0; h < 22; h++) {
    var hl = hill(9 + rnd() * 16, 4 + rnd() * 7, h % 2 ? PAL.hill : PAL.hillFar);
    hl.position.set((rnd() - 0.5) * 220, 0, -60 - rnd() * 90);
    S.add(hl);
  }
  for (var mt = 0; mt < 12; mt++) {
    var mm = hill(26 + rnd() * 34, 15 + rnd() * 22, mt % 2 ? PAL.mtn : PAL.mtnFar);
    mm.position.set((rnd() - 0.5) * 340, 0, -190 - rnd() * 110);
    S.add(mm);
  }

  S.visible = false;
  return S;
}

// ------------------------------------------- 5/7: the house on Straight Street

function buildHouse(cfg) {
  cfg = cfg || {};
  var S = new THREE.Group();

  var fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), mat(PAL.clayDark));
  fl.rotation.x = -Math.PI / 2;
  fl.receiveShadow = true;
  S.add(fl);

  // three plastered walls, rough and warm
  var back = new THREE.Mesh(new THREE.PlaneGeometry(13, 5.2), mat(PAL.plaster));
  back.position.set(0, 2.6, -3.3);
  back.receiveShadow = true;
  S.add(back);
  var left = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.2), mat(PAL.plasterDark));
  left.position.set(-4.4, 2.6, 0.5);
  left.rotation.y = Math.PI / 2;
  left.receiveShadow = true;
  S.add(left);
  var right = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.2), mat(PAL.plasterCool));
  right.position.set(4.4, 2.6, 0.5);
  right.rotation.y = -Math.PI / 2;
  right.receiveShadow = true;
  S.add(right);

  // beamed ceiling
  for (var bm = 0; bm < 7; bm++) {
    var beam = new THREE.Mesh(new THREE.BoxGeometry(9, 0.17, 0.17), mat(PAL.woodDark));
    beam.position.set(0, 3.5, -3.0 + bm * 1.1);
    S.add(beam);
  }

  // the narrow window that carries the day/night passage
  var winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.25, 0.12), mat(PAL.plasterDark));
  winFrame.position.set(cfg.winX === undefined ? -2.4 : cfg.winX, 2.3, -3.26);
  S.add(winFrame);
  var winLight = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.12), emat(0xffe6b0, 0.9));
  winLight.position.set(cfg.winX === undefined ? -2.4 : cfg.winX, 2.3, -3.18);
  S.add(winLight);

  // furniture: a low bench, a mat, jugs, a shelf
  var bench = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.62), mat(PAL.wood));
  bench.position.set(cfg.benchX === undefined ? 0.4 : cfg.benchX, 0.42, -1.1);
  bench.castShadow = true;
  S.add(bench);
  for (var bl = 0; bl < 4; bl++) {
    var bL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.1), mat(PAL.woodDark));
    bL.position.set((cfg.benchX === undefined ? 0.4 : cfg.benchX) + (bl % 2 ? 0.62 : -0.62),
                    0.21, -1.1 + (bl < 2 ? 0.22 : -0.22));
    S.add(bL);
  }

  var rug = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 2.2), mat(PAL.rug));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0.2, 0.013, 0.3);
  S.add(rug);
  var rug2 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), mat(PAL.rugAlt));
  rug2.rotation.x = -Math.PI / 2;
  rug2.position.set(-2.1, 0.014, 1.1);
  S.add(rug2);

  for (var jj = 0; jj < 4; jj++) {
    var jg2 = clayJug(0.9 + rnd() * 0.4);
    jg2.position.set(-3.4 + jj * 0.55, 0, -2.6);
    S.add(jg2);
  }
  var shelf = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.09, 0.4), mat(PAL.wood));
  shelf.position.set(2.6, 1.5, -3.0);
  S.add(shelf);

  // oil lamps, the only light in the dark stretch
  var lamps = [];
  var lampPos = cfg.lamps || [[-1.9, 1.56, -2.9], [2.3, 1.6, -2.9]];
  for (var lp = 0; lp < lampPos.length; lp++) {
    var lm = oilLamp();
    lm.root.position.set(lampPos[lp][0], lampPos[lp][1], lampPos[lp][2]);
    S.add(lm.root);
    lamps.push(lm);
  }

  S.visible = false;
  S.userData.lamps = lamps;
  S.userData.winLight = winLight;
  return S;
}

// ------------------------------------------------ 8: Damascus synagogue court

function buildCourtyard() {
  var S = new THREE.Group();
  S.add(groundPlane(120, PAL.sandLit));

  // paving
  for (var px = 0; px < 11; px++) {
    for (var pz = 0; pz < 9; pz++) {
      var sl = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 1.5),
        mat((px + pz) % 2 ? PAL.sand : PAL.sandLit));
      sl.position.set(-7.5 + px * 1.52, 0.026, 2 - pz * 1.52);
      sl.receiveShadow = true;
      S.add(sl);
    }
  }

  // the synagogue front: steps, columns, architrave
  var steps = new THREE.Group();
  for (var sp = 0; sp < 3; sp++) {
    var stp = new THREE.Mesh(new THREE.BoxGeometry(11 - sp * 0.7, 0.24, 3.4 - sp * 0.5),
      mat(PAL.sandDark));
    stp.position.set(0, 0.12 + sp * 0.24, -8.2 + sp * 0.3);
    stp.receiveShadow = true;
    steps.add(stp);
  }
  S.add(steps);

  for (var c2 = 0; c2 < 6; c2++) {
    var col = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.37, 4.3, 9),
      mat(PAL.column));
    col.position.set(-4.4 + c2 * 1.76, 2.87, -8.6);
    col.castShadow = true;
    S.add(col);
    var cap = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.26, 0.88), mat(PAL.columnDark));
    cap.position.set(-4.4 + c2 * 1.76, 5.12, -8.6);
    S.add(cap);
    var base = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.2, 0.86), mat(PAL.columnDark));
    base.position.set(-4.4 + c2 * 1.76, 0.82, -8.6);
    S.add(base);
  }
  var arch = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.7, 1.5), mat(PAL.sandDark));
  arch.position.set(0, 5.6, -8.6);
  arch.castShadow = true;
  S.add(arch);
  var pedi = new THREE.Mesh(new THREE.ConeGeometry(6.2, 1.5, 4, 1), mat(PAL.sand));
  pedi.rotation.y = Math.PI / 4;
  pedi.scale.set(1, 1, 0.22);
  pedi.position.set(0, 6.7, -8.6);
  S.add(pedi);

  // benches for the crowd
  for (var bn = 0; bn < 4; bn++) {
    var bench2 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 0.5), mat(PAL.wood));
    bench2.position.set(bn % 2 ? 4.3 : -4.3, 0.44, -1.6 - Math.floor(bn / 2) * 1.5);
    bench2.castShadow = true;
    S.add(bench2);
    for (var b2 = 0; b2 < 4; b2++) {
      var bl2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.44, 0.1), mat(PAL.woodDark));
      bl2.position.set((bn % 2 ? 4.3 : -4.3) + (b2 % 2 ? 1.5 : -1.5), 0.22,
                       -1.6 - Math.floor(bn / 2) * 1.5 + (b2 < 2 ? 0.18 : -0.18));
      S.add(bl2);
    }
  }

  // surrounding city, so the courtyard sits inside Damascus
  for (var bg = 0; bg < 16; bg++) {
    var bd = building(3 + rnd() * 3, 3 + rnd() * 4, 3 + rnd() * 2.5,
      { col: bg % 2 ? PAL.sand : PAL.sandLit, windows: 2, door: rnd() > 0.5 });
    var ang = (bg / 16) * Math.PI * 2;
    bd.position.set(Math.sin(ang) * (17 + rnd() * 8), 0, -4 + Math.cos(ang) * (16 + rnd() * 9));
    bd.rotation.y = rnd() * 3;
    S.add(bd);
  }
  for (var t2 = 0; t2 < 6; t2++) {
    var ot2 = oliveTree(1.1 + rnd() * 0.5);
    ot2.position.set((rnd() - 0.5) * 22, 0, 3 + rnd() * 6);
    S.add(ot2);
  }

  S.visible = false;
  return S;
}
