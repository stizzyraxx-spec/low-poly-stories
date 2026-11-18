#!/usr/bin/env python3
"""Assemble The Conversion of Saul from the modules in this directory.

Produces two files:

  films/saul/index.html      standalone - three.js and the narration inlined,
                             so it plays from a file:// URL with no server
  films/saul/src/render-mode.html
                             the render harness drives this one: three.js from
                             CDN, no audio element driving the clock, and a
                             window.__film API that steps exact 1/30s frames

Run from films/saul/src:  python3 -I build.py
"""
import base64
import io
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'films', 'saul', 'index.html')
RM = os.path.join(HERE, 'render-mode.html')

THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js'
THREE_LOCAL = os.path.join(ROOT, 'vendor', 'three.min.js')

MODULES = [
    'materials/palette.js',
    'characters/rig.js',
    'animations/perform.js',
    'environments/sets.js',
    'lighting/moods.js',
    'cameras/shots.js',
    'animations/beats.js',
    'characters/cast.js',
    'animations/acts.js',
    'scripts/transport.js',
    'scripts/frame.js',
]


def narration_duration():
    """Read the runtime from the audio. A hardcoded value silently desyncs
    picture from sound the moment the track is replaced."""
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'csv=p=0', os.path.join(HERE, 'narration.mp3')],
        capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def check_beats_match_audio(duration):
    """Refuse to build if the beats are not the ones align.py produced for
    THIS narration. Building a film against stale timings is the single most
    expensive mistake available here, so it is a hard failure."""
    aligned = json.load(io.open(os.path.join(HERE, 'aligned.json'), encoding='utf-8'))
    beats_src = io.open(os.path.join(HERE, 'animations', 'beats.js'),
                        encoding='utf-8').read()
    import re
    found = re.findall(r'\{\s*t:([0-9.]+),\s*d:([0-9.]+),', beats_src)
    if len(found) != len(aligned):
        raise SystemExit('beats.js has %d beats but aligned.json has %d lines. '
                         'Run retime.py.' % (len(found), len(aligned)))
    for i, (t, d) in enumerate(found):
        if abs(float(t) - aligned[i]['t']) > 0.005 or \
           abs(float(d) - aligned[i]['d']) > 0.005:
            raise SystemExit(
                'beats.js line %d is timed %s/%s but aligned.json says %.2f/%.2f. '
                'Run retime.py.' % (i + 1, t, d, aligned[i]['t'], aligned[i]['d']))
    last = aligned[-1]
    if last['t'] + last['d'] > duration + 0.1:
        raise SystemExit('alignment runs past the audio (%.2f > %.2f)'
                         % (last['t'] + last['d'], duration))
    return len(aligned)


def read_modules():
    parts = []
    for m in MODULES:
        p = os.path.join(HERE, m)
        src = io.open(p, encoding='utf-8').read()
        parts.append('// ===== %s %s\n%s' % (m, '=' * max(0, 56 - len(m)), src))
    return '\n\n'.join(parts)


MAIN = r'''
// ===== main ==============================================================
  var DURATION = %(duration).2f;
  var RENDER_MODE = %(render_mode)s;

  var canvas = document.getElementById("stage");
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true,
                                           preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(1280, 720, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1280 / 720, 0.1, 400);

  var lights = buildLights(scene);

  // sets
  var SETS = {
    jerus: buildJerusalem(),
    road: buildRoad(),
    house: buildHouse({ winX: -2.4, benchX: 0.4 }),
    ananHouse: buildHouse({ winX: 2.2, benchX: -0.9,
                            lamps: [[-1.6, 1.58, -2.9], [2.0, 1.54, -2.9]] }),
    court: buildCourtyard()
  };
  for (var sk in SETS) scene.add(SETS[sk]);

  // cast
  var cast = buildCast();
  var allCast = castList(cast);
  for (var ci = 0; ci < allCast.length; ci++) {
    allCast[ci].root.visible = false;
    scene.add(allCast[ci].root);
  }

  // the holy shaft sits on the road at the conversion point
  var shaft = buildHolyShaft();
  shaft.root.position.set(0, 0, -1.8);
  scene.add(shaft.root);

  var motes = buildMotes(520, 11, 15);
  motes.pts.position.set(0, 0, -1.8);
  scene.add(motes.pts);

  var dustRoad = buildMotes(180, 4, 0.6);
  dustRoad.pts.material.size = 0.035;
  dustRoad.pts.material.color.setHex(0xc8ab82);
  scene.add(dustRoad.pts);

  // scales falling from his eyes - small translucent fragments, not gore
  var scalesFx = buildMotes(44, 0.34, 0.1);
  scalesFx.pts.material.size = 0.022;
  scalesFx.pts.material.color.setHex(0xe8dcc4);
  scalesFx.pts.visible = false;
  scene.add(scalesFx.pts);

  // a black plane locked to the camera: the subjective blindness fade
  var vignette = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true,
                                  opacity: 0, depthTest: false, depthWrite: false }));
  vignette.visible = false;
  vignette.renderOrder = 999;
  var vigCam = new THREE.Scene();
  vigCam.add(vignette);
  var orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  var ctx = {
    scene: scene, camera: camera, renderer: renderer,
    cast: cast, sets: SETS, lights: lights,
    shaft: shaft, motes: motes, dustRoad: dustRoad,
    scalesFx: scalesFx, scalesT: 0, vignette: null,
    acts: null
  };

  var film = makeFilm(ctx);
  ctx.acts = buildActs(film);

  // The blindness fade is a second pass over the finished frame.
  var baseRender = renderer.render.bind(renderer);

  var voice = document.getElementById("voice");
  voice.src = AUDIO_SRC;

  var transport = makeTransport({
    beats: BEATS, duration: DURATION,
    applyBeat: film.applyBeat,
    frame: function (t, dt) {
      film.frame(t, dt);
      if (vignette.material.opacity > 0.004) {
        renderer.autoClear = false;
        baseRender(vigCam, orthoCam);
        renderer.autoClear = true;
      }
    },
    voice: voice, renderMode: RENDER_MODE
  });
  ctx.vignette = vignette;

  // ------------------------------------------------------------- playback
  var gate = document.getElementById("gate");
  if (RENDER_MODE) {
    gate.className = "off";
    transport.reset();
    window.__film = {
      duration: DURATION,
      reset: function () { transport.reset(); },
      seekTo: function (t) { transport.advanceTo(t); },
      grab: function (t) {
        transport.advanceTo(t);
        return canvas.toDataURL("image/jpeg", 0.92);
      }
    };
    window.__filmReady = true;
  } else {
    transport.reset();
    var start = function () {
      gate.className = "off";
      transport.play();
    };
    gate.addEventListener("click", start);
    window.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") start();
    });
    window.__filmReady = true;
  }
'''


def build(render_mode, duration):
    head = io.open(os.path.join(HERE, 'shell.html'), encoding='utf-8').read()
    modules = read_modules()
    main = MAIN % {'duration': duration,
                   'render_mode': 'true' if render_mode else 'false'}

    if render_mode:
        three_tag = '<script src="%s"></script>' % THREE_CDN
        audio = ''
    else:
        if os.path.exists(THREE_LOCAL):
            three_js = io.open(THREE_LOCAL, encoding='utf-8').read()
            three_tag = '<script>%s</script>' % three_js
        else:
            three_tag = '<script src="%s"></script>' % THREE_CDN
        mp3 = open(os.path.join(HERE, 'narration.mp3'), 'rb').read()
        audio = 'data:audio/mpeg;base64,' + base64.b64encode(mp3).decode('ascii')

    body = head.replace('THREE_TAG', three_tag)
    body = body.replace('MODULES_HERE', modules)
    body = body.replace('MAIN_HERE', main)
    body = body.replace('AUDIO_PLACEHOLDER', audio)
    return body


def main():
    mp3 = os.path.join(HERE, 'narration.mp3')
    if not os.path.exists(mp3):
        raise SystemExit('narration.mp3 is missing. See NARRATION-README.md.')
    duration = narration_duration()
    n = check_beats_match_audio(duration)

    rm = build(True, duration)
    io.open(RM, 'w', encoding='utf-8').write(rm)
    print('wrote %s %d bytes' % (RM, len(rm)))

    st = build(False, duration)
    io.open(OUT, 'w', encoding='utf-8').write(st)
    print('wrote %s %d bytes' % (OUT, len(st)))
    print('%d beats, %.2fs, %d frames at 30fps'
          % (n, duration, round(duration * 30)))


if __name__ == '__main__':
    main()
