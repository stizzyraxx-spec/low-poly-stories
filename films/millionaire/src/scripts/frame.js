// scripts/frame.js — one frame of the film.
//
// Order matters: actions set pose targets, the performance pass eases bodies
// toward them, the camera is solved from the current shot, then light and
// effects are interpolated and drawn. Everything here is a pure function of
// (t, dt) given the beat state, which is what makes the render deterministic.

function makeFilm(ctx) {
  var scene = ctx.scene, camera = ctx.camera, renderer = ctx.renderer;
  var C = ctx.cast, SETS = ctx.sets, L = ctx.lights;

  var curScene = 0;
  var curShot = SHOTS.oAerial, prevShot = SHOTS.oAerial;
  var shotT = 1, shotStart = 0, beatStart = 0, beatDur = 1;
  var mood = {}, targetMood = MOODS.empire;
  for (var k in MOODS.empire) mood[k] = MOODS.empire[k];

  var speaker = null, speakStart = 0, speakDur = 0;
  var blind = 0, blindTarget = 0;        // subjective blindness fade
  var scales = 0;                        // the scales-falling particles
  var subIdx = -1;

  var vTmp = new THREE.Vector3(), vLook = new THREE.Vector3();
  // scratch colours, reused every frame so the loop allocates nothing
  var vDer = new THREE.Vector3(), vDerLook = new THREE.Vector3();
  var cFog = new THREE.Color(), cSky = new THREE.Color();
  var cSun = new THREE.Color(), cAmbS = new THREE.Color(), cAmbG = new THREE.Color();
  var curSun = new THREE.Color(MOODS.empire.sunCol);
  var curAmbS = new THREE.Color(MOODS.empire.ambSky);
  var curAmbG = new THREE.Color(MOODS.empire.ambGnd);
  var curFog = new THREE.Color(MOODS.empire.fogCol);

  // Colour fields are eased in RGB, never as packed hex: lerping 0x3a4258
  // toward 0xffe6b0 as a NUMBER passes through greens that are in neither
  // colour. Everything else in a mood is a scalar and eases normally.
  var COLOR_KEYS = { sunCol: 1, ambSky: 1, ambGnd: 1, fogCol: 1, skyTop: 1 };

  // ----------------------------------------------------------- the beat
  function applyBeat(b, i, t) {
    if (b.sc !== curScene) {
      stageScene(b.sc, C, SETS);
      curScene = b.sc;
    }
    cutTo(SHOTS[b.cam], b.t, b.d, b.cam === "oAerial" ? 0 : 0.5);
    targetMood = MOODS[b.mood];
    speaker = C[b.who] || null;
    speakStart = b.t;
    speakDur = b.d;
    beatStart = b.t;
    beatDur = b.d;
    // read ctx.acts live: buildActs needs the film object, so the acts are
    // attached to ctx after makeFilm returns. Snapshotting it here would
    // capture null and every beat would be a no-op.
    var acts = ctx.acts;
    if (acts && acts[b.act]) acts[b.act](C, b, ctx);
    // reset the subcut cursor so a seek re-arms the right one
    subIdx = -1;
    for (var s = 0; s < SUBCUTS.length; s++) if (SUBCUTS[s].t <= t) subIdx = s;
  }

  function cutTo(shot, at, dur, blend) {
    if (!shot || shot === curShot) return;
    prevShot = sampleShot(curShot, at);
    curShot = shot;
    shotStart = at;
    shotT = (blend === undefined ? 0.5 : blend) <= 0 ? 1 : 0;
    curShot._blend = blend === undefined ? 0.5 : blend;
    curShot._in = at;
    curShot._dur = dur;
  }

  // Resolve a shot to a concrete position/look at time t, including its
  // Bezier path, its orbit and its drift. Returned as a plain object so a
  // blend can interpolate from where the previous shot actually was.
  function sampleShot(shot, t) {
    var inT = shot._in === undefined ? 0 : shot._in;
    var dur = shot._dur === undefined ? 4 : shot._dur;
    var u = dur > 0 ? Math.min(1, Math.max(0, (t - inT) / dur)) : 0;
    var eu = smoothstep(u);

    var px, py, pz;
    if (shot.derive) {
      // A derived shot is solved from live character positions, so it cannot
      // fall out of agreement with staging the way typed coordinates do.
      shot.derive(t, vDer, vDerLook, eu);
      px = vDer.x; py = vDer.y; pz = vDer.z;
      var d0 = shot.drift || [0.2, 0.1, 0.1];
      px += Math.sin(t * 0.17 + 1.3) * d0[0] * 0.14;
      py += Math.sin(t * 0.23 + 2.1) * d0[1] * 0.12;
      pz += Math.sin(t * 0.13 + 0.7) * d0[2] * 0.14;
      return { x: px, y: py, z: pz,
               lx: vDerLook.x, ly: vDerLook.y, lz: vDerLook.z,
               fov: shot.fov };
    }
    if (shot.path) {
      bez3(shot.path, eu, vTmp);
      px = vTmp.x; py = vTmp.y; pz = vTmp.z;
    } else if (shot.orbit) {
      var o = shot.orbit;
      var a = o.from + (o.to - o.from) * eu;
      px = o.c[0] + Math.sin(a) * o.r;
      py = o.y;
      pz = o.c[2] + Math.cos(a) * o.r;
    } else {
      px = shot.pos[0]; py = shot.pos[1]; pz = shot.pos[2];
    }

    // drift: a slow wander so nothing is ever locked off
    var d = shot.drift || [0.3, 0.12, 0.12];
    px += Math.sin(t * 0.17 + 1.3) * d[0] * 0.14;
    py += Math.sin(t * 0.23 + 2.1) * d[1] * 0.12;
    pz += Math.sin(t * 0.13 + 0.7) * d[2] * 0.14;

    var lk = shot.orbit ? shot.orbit.c : shot.look;
    return { x: px, y: py, z: pz,
             lx: lk[0], ly: lk[1], lz: lk[2], fov: shot.fov };
  }

  function solveCamera(t, dt) {
    // mid-line subcuts
    for (var s = subIdx + 1; s < SUBCUTS.length; s++) {
      if (SUBCUTS[s].t > t) break;
      subIdx = s;
      // A subcut belongs to its scene. Without this check a late subcut
      // survives the cut into the next scene and re-aims the camera at an
      // interior shot while an exterior is on stage - at t=150 the active
      // camera was hSaulCU, a scene-7 room shot, with scene 8 staged.
      if (SUBCUTS[s].sc !== undefined && SUBCUTS[s].sc !== curScene) continue;
      cutTo(SHOTS[SUBCUTS[s].cam], SUBCUTS[s].t, 3.2, 0.42);
    }

    var now = sampleShot(curShot, t);
    if (shotT < 1) {
      shotT = Math.min(1, shotT + dt / Math.max(0.0001, curShot._blend));
      var e = smoothstep(shotT);
      camera.position.set(
        prevShot.x + (now.x - prevShot.x) * e,
        prevShot.y + (now.y - prevShot.y) * e,
        prevShot.z + (now.z - prevShot.z) * e);
      vLook.set(
        prevShot.lx + (now.lx - prevShot.lx) * e,
        prevShot.ly + (now.ly - prevShot.ly) * e,
        prevShot.lz + (now.lz - prevShot.lz) * e);
      camera.fov = prevShot.fov + (now.fov - prevShot.fov) * e;
    } else {
      camera.position.set(now.x, now.y, now.z);
      vLook.set(now.lx, now.ly, now.lz);
      camera.fov = now.fov;
    }
    camera.lookAt(vLook);
    window.__lastLook = vLook;
    camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------- the frame
  function frame(t, dt) {
    // ---- performances ----
    var all = castList(C);
    for (var i = 0; i < all.length; i++) {
      var c = all[i];
      if (!c.root.visible) continue;
      // the speaker's jaw rides its own line's envelope; everyone else is shut
      var isSp = (c === speaker);
      c.s.talking = isSp ? 1 : 0;
      c.s.jawOpen = isSp ? jawEnvelope(t, speakStart, speakDur, i * 1.7) : 0;
      animatePerson(c, t, dt);
    }

    // Walking characters actually travel, along their own facing. Driven
    // off the pose state rather than named characters, so a cast change
    // cannot leave a dangling reference here.
    for (var w = 0; w < all.length; w++) {
      var wc = all[w];
      if (!wc.root.visible || wc.s.walk <= 0.01) continue;
      var spd = dt * 1.15 * wc.s.walk;
      wc.root.position.x += Math.sin(wc.root.rotation.y) * spd;
      wc.root.position.z += Math.cos(wc.root.rotation.y) * spd;
    }

    // ---- camera ----
    solveCamera(t, dt);

    // ---- light ----
    var kMood = 1 - Math.exp(-2.6 * dt);
    for (var k in targetMood) {
      if (COLOR_KEYS[k]) { mood[k] = targetMood[k]; continue; }
      var cur = mood[k], tg = targetMood[k];
      mood[k] = typeof tg === 'number' ? cur + (tg - cur) * kMood : tg;
    }
    curSun.lerp(cSun.setHex(mood.sunCol), kMood);
    curAmbS.lerp(cAmbS.setHex(mood.ambSky), kMood);
    curAmbG.lerp(cAmbG.setHex(mood.ambGnd), kMood);
    curFog.lerp(cFog.setHex(mood.fogCol), kMood);
    L.sun.intensity = mood.sun;
    L.sun.color.copy(curSun);
    L.amb.intensity = mood.amb;
    L.amb.color.copy(curAmbS);
    L.amb.groundColor.copy(curAmbG);
    scene.fog.near = mood.fogN;
    scene.fog.far = mood.fogF;
    scene.fog.color.copy(curFog);

    // The sky meets the fog at the horizon, so the ground plane's edge is
    // never visible as a seam. Both are eased as colours, not as numbers:
    // interpolating packed hex would travel through the wrong hues.
    if (L.skyMat) {
      L.skyMat.uniforms.bottom.value.copy(curFog);
      L.skyMat.uniforms.top.value.lerp(cSky.setHex(mood.skyTop), kMood);
    }
    renderer.toneMappingExposure = mood.exp * (1 - blind * 0.92);

    // ---- practicals ----
    // Lamp intensity comes from the mood, so it rises and falls with the
    // scene instead of being switched by scene number.
    var hs = SETS.residence.visible ? SETS.residence
           : (SETS.apartment.visible ? SETS.apartment : null);
    var lampWant = mood.lamp || 0;
    var flick = 1 + Math.sin(t * 1.7) * 0.015;      // steady; these are bulbs
    L.lampA.intensity = lampWant * 1.5 * flick;
    L.lampB.intensity = lampWant * 1.1 * (2 - flick);
    if (hs && hs.userData.lamps && hs.userData.lamps.length) {
      var lm = hs.userData.lamps;
      L.lampA.position.fromArray(lm[0].pos);
      if (lm[1]) L.lampB.position.fromArray(lm[1].pos);
      else L.lampB.intensity = 0;
    } else {
      L.lampA.intensity = 0;
      L.lampB.intensity = 0;
    }
    // the hospital's ceiling panels, which are the only light in scene 4
    L.fluoro.intensity = SETS.hospital.visible ? 1.5 : 0;

    // Fill: park it just behind and above the camera, aimed into the scene,
    // so the speaker's face is lit from roughly the lens axis. Interiors
    // only - exteriors have the sun.
    var interior = SETS.residence.visible || SETS.apartment.visible;
    L.fill.intensity = interior ? (mood.fill === undefined ? 1.5 : mood.fill) : 0;
    if (L.fill.intensity > 0) {
      L.fill.position.set(camera.position.x, camera.position.y + 0.5,
                          camera.position.z);
    }

    // ---- rain outside the residence glass ----
    if (SETS.residence.visible && SETS.residence.userData.rain) {
      var R = SETS.residence.userData.rain;
      R.pts.material.opacity = (mood.rain || 0) * 0.5;
      if ((mood.rain || 0) > 0.01) {
        for (var ri = 0; ri < R.count; ri++) {
          var rs = R.seed[ri];
          R.pos[ri * 3 + 1] = 14 - ((t * rs.s + rs.y) % 14);
        }
        R.geo.attributes.position.needsUpdate = true;
      }
    }


    // ---- subjective blindness ----
    blind += (blindTarget - blind) * (1 - Math.exp(-1.6 * dt));
    if (ctx.vignette) {
      ctx.vignette.material.opacity = blind * 0.97;
      ctx.vignette.visible = blind > 0.004;
    }


    renderer.render(scene, camera);
  }

  return {
    applyBeat: applyBeat, frame: frame,
    setBlind: function (v) { blindTarget = v; },
    dropScales: function (t) { scales = 1; ctx.scalesT = t; },
    get mood() { return mood; }
  };
}
