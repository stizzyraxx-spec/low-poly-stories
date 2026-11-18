// scripts/frame.js — one frame of the film.
//
// Order matters: actions set pose targets, the performance pass eases bodies
// toward them, the camera is solved from the current shot, then light and
// effects are interpolated and drawn. Everything here is a pure function of
// (t, dt) given the beat state, which is what makes the render deterministic.

function makeFilm(ctx) {
  var scene = ctx.scene, camera = ctx.camera, renderer = ctx.renderer;
  var C = ctx.cast, SETS = ctx.sets, L = ctx.lights;
  var shaft = ctx.shaft, motes = ctx.motes, dustRoad = ctx.dustRoad;

  var curScene = 0;
  var curShot = SHOTS.jAerial, prevShot = SHOTS.jAerial;
  var shotT = 1, shotStart = 0, beatStart = 0, beatDur = 1;
  var mood = {}, targetMood = MOODS.jerus;
  for (var k in MOODS.jerus) mood[k] = MOODS.jerus[k];

  var speaker = null, speakStart = 0, speakDur = 0;
  var blind = 0, blindTarget = 0;        // subjective blindness fade
  var scales = 0;                        // the scales-falling particles
  var subIdx = -1;

  var vTmp = new THREE.Vector3(), vLook = new THREE.Vector3();
  // scratch colours, reused every frame so the loop allocates nothing
  var vDer = new THREE.Vector3(), vDerLook = new THREE.Vector3();
  var cFog = new THREE.Color(), cSky = new THREE.Color();
  var cSun = new THREE.Color(), cAmbS = new THREE.Color(), cAmbG = new THREE.Color();
  var curSun = new THREE.Color(MOODS.jerus.sunCol);
  var curAmbS = new THREE.Color(MOODS.jerus.ambSky);
  var curAmbG = new THREE.Color(MOODS.jerus.ambGnd);
  var curFog = new THREE.Color(MOODS.jerus.fogCol);

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
    cutTo(SHOTS[b.cam], b.t, b.d, b.cam === "jAerial" ? 0 : 0.5);
    window.__activeCam = b.cam;
    window.__curScene = b.sc;
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
      window.__activeCam = SUBCUTS[s].cam;
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

    // walking characters actually travel
    if (C.saul.root.visible && C.saul.s.walk > 0.01) {
      C.saul.root.position.z += dt * 1.05 * C.saul.s.walk;
    }
    if (C.comp1.root.visible && C.comp1.s.walk > 0.01) {
      C.comp1.root.position.z += dt * 1.05 * C.comp1.s.walk;
      C.comp2.root.position.z += dt * 1.05 * C.comp2.s.walk;
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

    // ---- the holy shaft ----
    var holy = mood.holy;
    shaft.root.visible = holy > 0.004;
    if (shaft.root.visible) {
      var puls = 1 + Math.sin(t * 2.1) * 0.035;       // slow, never a flicker
      for (var sh = 0; sh < shaft.shells.length; sh++) {
        var S = shaft.shells[sh];
        S.material.opacity = S.userData.base * holy * puls;
        S.rotation.y = t * S.userData.spin;
      }
      shaft.core.material.opacity = holy * 0.55 * puls;
      shaft.core.scale.setScalar(1 + holy * 0.5);
      shaft.pool.material.opacity = holy * 0.34;
      L.holy.intensity = holy * 9.5;
      L.holySpot.intensity = holy * 13;
    } else {
      L.holy.intensity = 0;
      L.holySpot.intensity = 0;
    }

    // motes: visible only while the shaft is
    motes.pts.material.opacity = holy * 0.85;
    if (holy > 0.004) {
      for (var m = 0; m < motes.count; m++) {
        var sd = motes.seed[m];
        motes.pos[m * 3 + 1] = sd.y + Math.sin(t * sd.r * 0.33 + sd.p) * 0.55;
        motes.pos[m * 3] = sd.x + Math.sin(t * sd.r * 0.21 + sd.p) * 0.3;
      }
      motes.geo.attributes.position.needsUpdate = true;
    }

    // road dust under walking feet
    if (dustRoad) {
      var walking = C.saul.root.visible && C.saul.s.walk > 0.01;
      dustRoad.pts.material.opacity = walking ? 0.3 : 0;
      if (walking) {
        for (var dm = 0; dm < dustRoad.count; dm++) {
          var ds = dustRoad.seed[dm];
          dustRoad.pos[dm * 3 + 1] = (ds.y + Math.sin(t * ds.r + ds.p) * 0.1) % 0.6;
        }
        dustRoad.geo.attributes.position.needsUpdate = true;
      }
    }

    // ---- interior lamps ----
    var lampOn = (curScene === 5 || curScene === 6 || curScene === 7) ? 1 : 0;
    var flick = 1 + Math.sin(t * 5.3) * 0.05 + Math.sin(t * 2.7) * 0.04;
    L.lampA.intensity = lampOn * 1.55 * flick;
    L.lampB.intensity = lampOn * 1.25 * (2 - flick);
    var hs = curScene === 6 ? SETS.ananHouse : SETS.house;
    if (lampOn && hs && hs.userData.lamps) {
      var lm = hs.userData.lamps;
      L.lampA.position.set(lm[0].root.position.x, lm[0].root.position.y + 0.1, lm[0].root.position.z);
      if (lm[1]) L.lampB.position.set(lm[1].root.position.x, lm[1].root.position.y + 0.1, lm[1].root.position.z);
      for (var fl = 0; fl < lm.length; fl++) {
        lm[fl].flame.scale.set(1, 1 + Math.sin(t * 7.1 + fl) * 0.14, 1);
        lm[fl].flame.material.opacity = 0.9 + Math.sin(t * 6.3 + fl * 2) * 0.08;
      }
    }

    // the window carries the three-day passage: lit, dark, lit, dark, lit
    if (curScene === 5 && SETS.house.userData.winLight) {
      var u5 = Math.min(1, Math.max(0, (t - beatStart) / beatDur));
      var day = 0.5 + 0.5 * Math.cos(u5 * Math.PI * 6);   // three full cycles
      SETS.house.userData.winLight.material.opacity = 0.12 + day * 0.8;
      SETS.house.userData.winLight.material.color.setHex(day > 0.5 ? 0xffe6b0 : 0x3a4258);
    }

    // ---- subjective blindness ----
    blind += (blindTarget - blind) * (1 - Math.exp(-1.6 * dt));
    if (ctx.vignette) {
      ctx.vignette.material.opacity = blind * 0.97;
      ctx.vignette.visible = blind > 0.004;
    }

    // ---- scales falling from his eyes ----
    if (ctx.scalesFx) {
      ctx.scalesFx.pts.material.opacity = scales * 0.9;
      ctx.scalesFx.pts.visible = scales > 0.01;
      if (scales > 0.01) {
        for (var sf = 0; sf < ctx.scalesFx.count; sf++) {
          var ss = ctx.scalesFx.seed[sf];
          var fall = ((t - ctx.scalesT) * (0.4 + ss.r * 0.5)) % 1.0;
          ctx.scalesFx.pos[sf * 3 + 1] = ss.y - fall * 0.55;
          ctx.scalesFx.pos[sf * 3] = ss.x + Math.sin(t * 2 + ss.p) * 0.015;
        }
        ctx.scalesFx.geo.attributes.position.needsUpdate = true;
        ctx.scalesFx.pts.position.set(
          C.saul.root.position.x, 1.52 + C.saul.root.position.y, C.saul.root.position.z + 0.18);
      }
      scales *= Math.exp(-0.55 * dt);
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
