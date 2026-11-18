// lighting/moods.js — the light carries the three phases.
//
// SUCCESS is warm, bright and high-key: big windows, sun across a stone
// floor. SUFFERING drains the warmth out: cool fill, clinical fluorescent,
// then blue-grey night with two small lamps. FAITH warms again, but only by
// degrees and never back to the opening - the brief is explicit that this is
// quiet determination, not a man restored to his old life.
//
// No strobing anywhere; every change eases over at least half a second.

var MOODS = {
  // ---- 1-2: the office ----
  // The opening aerial looks across ~200 units of city, so the fog has to
  // reach much further than an interior's would or the skyline washes to
  // flat white and the towers lose all separation.
  empire:    { sun: 2.9, sunCol: 0xffe6c0, amb: 1.05, ambSky: 0xcfe0f0, ambGnd: 0x9a9288,
               fogN: 120, fogF: 1100, fogCol: 0xb8cce0, exp: 1.06,
               skyTop: 0x6fa6dc, lamp: 0, rain: 0 },
  cooling:   { sun: 2.1, sunCol: 0xe8dcc8, amb: 0.92, ambSky: 0xb4c0cc, ambGnd: 0x7f7a74,
               fogN: 34, fogF: 220, fogCol: 0xb8c4d0, exp: 0.99,
               skyTop: 0x7a95ad, lamp: 0, rain: 0 },
  cold:      { sun: 1.5, sunCol: 0xcdd6e0, amb: 0.78, ambSky: 0x95a4b4, ambGnd: 0x6a6660,
               fogN: 26, fogF: 180, fogCol: 0xa4b0bc, exp: 0.93,
               skyTop: 0x6e8498, lamp: 0, rain: 0 },

  // ---- 3: transit, overcast ----
  transit:   { sun: 1.2, sunCol: 0xc8ccd2, amb: 0.88, ambSky: 0x9aa4ae, ambGnd: 0x6e6e70,
               fogN: 22, fogF: 150, fogCol: 0x9aa4ae, exp: 0.95,
               skyTop: 0x8a949e, lamp: 0, rain: 0 },

  // ---- 4: the hospital. fluorescent, no warmth at all ----
  clinical:  { sun: 0.35, sunCol: 0xdce8f0, amb: 1.18, ambSky: 0xe4f0f6, ambGnd: 0xa8b4bc,
               fogN: 18, fogF: 60, fogCol: 0xcfdce4, exp: 0.97,
               skyTop: 0xc0d0dc, lamp: 0, rain: 0 },
  grief:     { sun: 0.25, sunCol: 0xcfdce4, amb: 0.95, ambSky: 0xc8d8e0, ambGnd: 0x8a949a,
               fogN: 12, fogF: 42, fogCol: 0xb8c8d2, exp: 0.90,
               skyTop: 0xb0c0cc, lamp: 0, rain: 0 },

  // ---- 5: the luxury house at night, rain outside ----
  // Night, but READABLE. The first pass at these two was so dark the man's
  // face was lost and the city outside the window disappeared entirely; the
  // brief asks for blue-grey night with isolated warm lamps, not near-black.
  // Moonlight-coloured key plus a lifted ambient keeps the figures legible
  // while the palette stays cold.
  nightHome: { sun: 0.62, sunCol: 0x8ea4cc, amb: 0.86, ambSky: 0x62789c, ambGnd: 0x3a3a46,
               fogN: 20, fogF: 110, fogCol: 0x2e3a4e, exp: 1.02,
               skyTop: 0x1e2838, lamp: 1.5, rain: 1 },
  nightCold: { sun: 0.50, sunCol: 0x8098c4, amb: 0.74, ambSky: 0x54688c, ambGnd: 0x32323e,
               fogN: 17, fogF: 92, fogCol: 0x263044, exp: 0.98,
               skyTop: 0x18202e, lamp: 1.3, rain: 1 },

  // ---- 6-8: the apartment, evening ----
  aptDusk:   { sun: 0.85, sunCol: 0xd0b094, amb: 0.80, ambSky: 0x95a0b2, ambGnd: 0x5c5248,
               fogN: 16, fogF: 60, fogCol: 0x6e7280, exp: 0.98,
               skyTop: 0x5c6c86, lamp: 1.0, rain: 0 },
  aptQuiet:  { sun: 0.70, sunCol: 0xc4a890, amb: 0.74, ambSky: 0x8a94a6, ambGnd: 0x544a40,
               fogN: 15, fogF: 56, fogCol: 0x64687a, exp: 0.95,
               skyTop: 0x4e5c74, lamp: 1.1, rain: 0 },
  aptHard:   { sun: 0.62, sunCol: 0xb0a090, amb: 0.68, ambSky: 0x78839a, ambGnd: 0x4a4238,
               fogN: 14, fogF: 52, fogCol: 0x5a5e6e, exp: 0.92,
               skyTop: 0x44526a, lamp: 1.0, rain: 0 },

  // ---- 9-11: warmth returning, by degrees ----
  aptWarm:   { sun: 0.70, sunCol: 0xd8b088, amb: 0.60, ambSky: 0x8a8a90, ambGnd: 0x584a3a,
               fogN: 15, fogF: 56, fogCol: 0x6a6258, exp: 0.94,
               skyTop: 0x54596a, lamp: 1.2, rain: 0 },
  aptHope:   { sun: 1.05, sunCol: 0xe8bc90, amb: 0.72, ambSky: 0x9a9690, ambGnd: 0x6a5842,
               fogN: 18, fogF: 68, fogCol: 0x7e7264, exp: 0.98,
               skyTop: 0x6e6a78, lamp: 1.0, rain: 0 },

  // ---- 12: sunrise. warm, but not the opening's brightness ----
  dawn:      { sun: 2.2, sunCol: 0xffb878, amb: 0.95, ambSky: 0xe8b090, ambGnd: 0x8a6a4e,
               fogN: 28, fogF: 170, fogCol: 0xe0ae8a, exp: 1.04,
               skyTop: 0xf0a878, lamp: 0, rain: 0 }
};

function buildLights(scene) {
  var amb = new THREE.HemisphereLight(0xcfe0f0, 0x9a9288, 1.05);
  scene.add(amb);

  var sun = new THREE.DirectionalLight(0xffe6c0, 2.9);
  sun.position.set(16, 26, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 110;
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -30;
  sun.shadow.bias = -0.0012;
  scene.add(sun);

  // interior practicals: the table lamps, and the hospital's ceiling wash
  var lampA = new THREE.PointLight(PAL.lampGlow, 0, 7, 1.8);
  var lampB = new THREE.PointLight(PAL.lampGlow, 0, 7, 1.8);
  scene.add(lampA);
  scene.add(lampB);

  var fluoro = new THREE.DirectionalLight(PAL.fluoro, 0);
  fluoro.position.set(0, 12, 2);
  scene.add(fluoro);

  scene.fog = new THREE.Fog(0xc8d8e8, 40, 260);

  // Skydome: the interiors have big windows and the exteriors look at a
  // horizon, so without geometry up there the frame shows the clear colour
  // as a hard band. Horizon takes the fog colour so the ground never seams.
  // Radius must exceed the farthest camera position: the opening aerial
  // sits at y=34, z=46, and a dome smaller than that puts the camera
  // OUTSIDE it, where its back faces render as a black mass.
  var skyGeo = new THREE.SphereGeometry(900, 20, 14);
  var skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      top: { value: new THREE.Color(0x7fb0e0) },
      bottom: { value: new THREE.Color(0xc8d8e8) }
    },
    vertexShader:
      'varying float h;\n' +
      'void main(){ vec4 w = modelMatrix * vec4(position,1.0);' +
      ' h = normalize(w.xyz).y;' +
      ' gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader:
      'uniform vec3 top; uniform vec3 bottom; varying float h;\n' +
      'void main(){ float m = clamp(h*1.5+0.18, 0.0, 1.0);' +
      ' m = m*m*(3.0-2.0*m);' +
      ' gl_FragColor = vec4(mix(bottom, top, m), 1.0); }'
  });
  var sky = new THREE.Mesh(skyGeo, skyMat);
  sky.renderOrder = -1;
  scene.add(sky);

  return { amb: amb, sun: sun, lampA: lampA, lampB: lampB, fluoro: fluoro,
           sky: sky, skyMat: skyMat };
}
