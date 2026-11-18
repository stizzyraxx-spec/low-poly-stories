// lighting/moods.js — the light tells the story a second time.
//
// Each mood is a target set, interpolated toward every frame, so light never
// jumps on a cut. The arc: warm Jerusalem turning ominous, open noon on the
// road, the blowout, blindness draining to nothing, three days of low lamp,
// gold for the vision, warmth returning as sight returns, bright public day,
// and sunrise at the end.
//
// Safety: every exposure change is eased over at least half a second and the
// blowout holds rather than flickers. Nothing in this film alternates faster
// than ~3Hz, which keeps it clear of photosensitive-trigger territory.

var MOODS = {
  // 1 - Jerusalem: warm sandstone, but the key hardens as Saul gives orders
  jerus:     { sun: 2.5, sunCol: 0xffd9a0, amb: 0.95, ambSky: 0xb8c4d8, ambGnd: 0x8a6d4e,
               fogN: 26, fogF: 110, fogCol: 0xd8c4a4, exp: 1.00, holy: 0, white: 0, skyTop: 0x8fb4d8 },
  jerusHard: { sun: 2.9, sunCol: 0xffc078, amb: 0.78, ambSky: 0x9aa2b4, ambGnd: 0x7a5a3e,
               fogN: 22, fogF: 95,  fogCol: 0xcdb08a, exp: 0.97, holy: 0, white: 0, skyTop: 0x7f97b4 },

  // 2 - the road at noon: flat, bright, dusty
  road:      { sun: 3.1, sunCol: 0xfff0cc, amb: 1.05, ambSky: 0xbcd0e8, ambGnd: 0x9c7c58,
               fogN: 40, fogF: 220, fogCol: 0xd4c0a0, exp: 1.02, holy: 0, white: 0, skyTop: 0x7fb0e0 },

  // 3 - the light. holy rises first, then the frame washes out and HOLDS.
  holyRise:  { sun: 2.4, sunCol: 0xfff2d8, amb: 1.25, ambSky: 0xe8dcc0, ambGnd: 0xc0a480,
               fogN: 20, fogF: 120, fogCol: 0xe8dcc0, exp: 1.22, holy: 0.55, white: 0.10, skyTop: 0xcfd8d0 },
  holyFull:  { sun: 1.4, sunCol: 0xffffff, amb: 1.9,  ambSky: 0xfff6e0, ambGnd: 0xe8d8b8,
               fogN: 8,  fogF: 54,  fogCol: 0xfff6e0, exp: 1.72, holy: 1.0,  white: 0.44, skyTop: 0xfff6e0 },
  holyVoice: { sun: 1.1, sunCol: 0xffffff, amb: 2.1,  ambSky: 0xfffaf0, ambGnd: 0xf0e4cc,
               fogN: 6,  fogF: 44,  fogCol: 0xfffaf0, exp: 1.85, holy: 1.0,  white: 0.56, skyTop: 0xfffaf0 },

  // 4 - blindness: the world drains out. 'blind' drives the subjective fade.
  fade:      { sun: 1.6, sunCol: 0xe8e0d0, amb: 0.85, ambSky: 0x9a96a0, ambGnd: 0x6e6860,
               fogN: 14, fogF: 70,  fogCol: 0xa8a098, exp: 0.92, holy: 0.2, white: 0, skyTop: 0x8a8a92 },
  led:       { sun: 2.2, sunCol: 0xf0dcb8, amb: 0.9,  ambSky: 0xa8b0c0, ambGnd: 0x8a7458,
               fogN: 24, fogF: 120, fogCol: 0xc4b498, exp: 0.95, holy: 0, white: 0, skyTop: 0x90a8c4 },

  // 5 - three days: lamplight only, the room nearly dark
  dark:      { sun: 0.12, sunCol: 0x6a7a9a, amb: 0.30, ambSky: 0x3a4258, ambGnd: 0x241c14,
               fogN: 9,  fogF: 30,  fogCol: 0x2a2420, exp: 0.84, holy: 0, white: 0, skyTop: 0x1a2030 },
  darkNight: { sun: 0.04, sunCol: 0x4a5a80, amb: 0.20, ambSky: 0x242c42, ambGnd: 0x18120e,
               fogN: 7,  fogF: 24,  fogCol: 0x1c1814, exp: 0.78, holy: 0, white: 0, skyTop: 0x121826 },

  // 6 - the vision: soft gold fills a dark room
  vision:    { sun: 0.5, sunCol: 0xffd090, amb: 0.75, ambSky: 0xffdca0, ambGnd: 0x6a4e30,
               fogN: 10, fogF: 38,  fogCol: 0x6a5436, exp: 1.06, holy: 0.42, white: 0.05, skyTop: 0x2a2438 },

  // 7 - sight restored: cold room warming as the scales fall
  roomCold:  { sun: 0.7, sunCol: 0xa8b4c8, amb: 0.52, ambSky: 0x6a7490, ambGnd: 0x3a3228,
               fogN: 11, fogF: 40,  fogCol: 0x4a4440, exp: 0.90, holy: 0, white: 0, skyTop: 0x4a5468 },
  roomWarm:  { sun: 1.9, sunCol: 0xffd9a0, amb: 0.92, ambSky: 0xd8c0a0, ambGnd: 0x7a5e40,
               fogN: 16, fogF: 62,  fogCol: 0xc4a888, exp: 1.06, holy: 0.22, white: 0.04, skyTop: 0x9a8468 },

  // 8 - preaching in open daylight
  court:     { sun: 3.2, sunCol: 0xfff2d0, amb: 1.12, ambSky: 0xc4d8f0, ambGnd: 0xa88868,
               fogN: 44, fogF: 200, fogCol: 0xd8c8a8, exp: 1.03, holy: 0, white: 0, skyTop: 0x8cc0ea },

  // 9 - sunrise on the road out
  sunrise:   { sun: 2.6, sunCol: 0xffb870, amb: 1.0, ambSky: 0xf0b088, ambGnd: 0x9a7050,
               fogN: 30, fogF: 170, fogCol: 0xe8b890, exp: 1.10, holy: 0.12, white: 0, skyTop: 0xf0a070 }
};

// Build the light rig. Returns the handles the frame loop drives.
function buildLights(scene) {
  var amb = new THREE.HemisphereLight(0xb8c4d8, 0x8a6d4e, 0.95);
  scene.add(amb);

  var sun = new THREE.DirectionalLight(0xffd9a0, 2.5);
  sun.position.set(-14, 22, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -26;
  sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 26;
  sun.shadow.camera.bottom = -26;
  sun.shadow.bias = -0.0012;
  scene.add(sun);

  // the holy source: a point light at the centre of the shaft, plus a
  // downward spot that puts a hard pool on the road
  var holy = new THREE.PointLight(0xfff6e0, 0, 60, 1.6);
  holy.position.set(0, 7.5, -2);
  scene.add(holy);

  var holySpot = new THREE.SpotLight(0xffffff, 0, 48, 0.52, 0.42, 1.1);
  holySpot.position.set(0, 16, -2);
  holySpot.target.position.set(0, 0, -2);
  scene.add(holySpot);
  scene.add(holySpot.target);

  // lamp light for the interiors
  var lampA = new THREE.PointLight(PAL.lampGlow, 0, 9, 1.8);
  var lampB = new THREE.PointLight(PAL.lampGlow, 0, 9, 1.8);
  scene.add(lampA);
  scene.add(lampB);

  scene.fog = new THREE.Fog(0xd8c4a4, 26, 110);

  // A skydome, not a background colour: the aerial shots look out past the
  // edge of the ground plane, so without geometry up there the frame shows
  // the clear colour as a hard black band. The dome takes the fog colour at
  // the horizon and a deeper tint overhead, which also hides the seam where
  // the ground plane ends.
  var skyGeo = new THREE.SphereGeometry(320, 18, 12);
  var skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      top: { value: new THREE.Color(0x8fb4d8) },
      bottom: { value: new THREE.Color(0xd8c4a4) }
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

  return { amb: amb, sun: sun, holy: holy, holySpot: holySpot,
           lampA: lampA, lampB: lampB, sky: sky, skyMat: skyMat };
}

// The volumetric shaft: nested cones of additive haze. Cheap, and it reads as
// light with substance because each shell rotates at its own rate and the
// whole stack breathes.
function buildHolyShaft() {
  var G = new THREE.Group();
  var shells = [];
  var specs = [
    [0.9, 26, 0.26], [2.0, 26, 0.17], [3.4, 26, 0.10], [5.2, 26, 0.055]
  ];
  for (var i = 0; i < specs.length; i++) {
    var geo = new THREE.ConeGeometry(specs[i][0], specs[i][1], 18, 1, true);
    var m = new THREE.MeshBasicMaterial({
      color: i < 2 ? PAL.holyWhite : PAL.holyGold,
      transparent: true, opacity: 0, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var sh = new THREE.Mesh(geo, m);
    sh.position.y = specs[i][1] / 2;
    sh.userData.base = specs[i][2];
    sh.userData.spin = (i % 2 ? 1 : -1) * (0.05 + i * 0.03);
    G.add(sh);
    shells.push(sh);
  }

  // the hot core where the shaft meets the ground
  var core = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0,
                                  blending: THREE.AdditiveBlending, depthWrite: false }));
  core.position.y = 0.6;
  G.add(core);

  // ground glow where the light lands
  var pool = new THREE.Mesh(new THREE.CircleGeometry(4.6, 24),
    new THREE.MeshBasicMaterial({ color: PAL.holyWhite, transparent: true, opacity: 0,
                                  blending: THREE.AdditiveBlending, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.03;
  G.add(pool);

  G.visible = false;
  return { root: G, shells: shells, core: core, pool: pool };
}

// Dust motes that only exist to be lit by the shaft.
function buildMotes(count, spread, height) {
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(count * 3);
  var seed = [];
  for (var i = 0; i < count; i++) {
    var x = (rnd() - 0.5) * spread;
    var y = rnd() * height;
    var z = (rnd() - 0.5) * spread;
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    seed.push({ x: x, y: y, z: z, r: 0.2 + rnd() * 0.9, p: rnd() * 6.28 });
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xfff2d0, size: 0.055, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
  return { pts: pts, geo: geo, pos: pos, seed: seed, count: count };
}
