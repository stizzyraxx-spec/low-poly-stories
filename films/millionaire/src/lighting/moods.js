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
  empire:    { sun: 2.9, sunCol: 0xffe6c0, amb: 1.05, ambSky: 0xcfe0f0, ambGnd: 0x9a9288,
               fogN: 40, fogF: 260, fogCol: 0xc8d8e8, exp: 1.06,
               skyTop: 0x7fb0e0, lamp: 0, rain: 0 },
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
  nightHome: { sun: 0.10, sunCol: 0x6a80a8, amb: 0.34, ambSky: 0x3a4a66, ambGnd: 0x24242c,
               fogN: 14, fogF: 70, fogCol: 0x222a38, exp: 0.86,
               skyTop: 0x141a26, lamp: 1.5, rain: 1 },
  nightCold: { sun: 0.06, sunCol: 0x5a7098, amb: 0.26, ambSky: 0x2e3a52, ambGnd: 0x1c1c22,
               fogN: 11, fogF: 56, fogCol: 0x1a2230, exp: 0.82,
               skyTop: 0x101620, lamp: 1.2, rain: 1 },

  // ---- 6-8: the apartment, evening ----
  aptDusk:   { sun: 0.55, sunCol: 0xc8a888, amb: 0.52, ambSky: 0x7a8496, ambGnd: 0x4a4238,
               fogN: 13, fogF: 48, fogCol: 0x5a5e68, exp: 0.90,
               skyTop: 0x4a5a70, lamp: 1.0, rain: 0 },
  aptQuiet:  { sun: 0.40, sunCol: 0xbca088, amb: 0.46, ambSky: 0x6e7888, ambGnd: 0x423c34,
               fogN: 12, fogF: 44, fogCol: 0x4e525c, exp: 0.88,
               skyTop: 0x3e4c60, lamp: 1.1, rain: 0 },
  aptHard:   { sun: 0.34, sunCol: 0xa89888, amb: 0.40, ambSky: 0x60697a, ambGnd: 0x383228,
               fogN: 11, fogF: 40, fogCol: 0x464a54, exp: 0.85,
               skyTop: 0x36424f, lamp: 1.0, rain: 0 },

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
  var skyGeo = new THREE.SphereGeometry(360, 18, 12);
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
