#!/usr/bin/env python3
"""Build the Nathan & David film from the Two Fathers engine.

The animation core (rig, breathing, blink timers, jaw envelope, camera drift,
mood interpolation, transport) is identical and proven, so it is reused as-is.
What changes is everything above it: the room, the two men, where the camera
stands, how the light moves across the story, and the beats it is keyed to.

Run from films/nathan-david/src:  python3 -I build.py
"""
import base64
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ENGINE = os.path.join(ROOT, 'films', 'two-fathers', 'index.html')
OUT = os.path.join(ROOT, 'films', 'nathan-david', 'index.html')

DURATION = 155.25


# ------------------------------------------------------------------- set
# A hall in the palace at night: limestone, cedar beams, standing braziers,
# a dais with the throne. The bar, its bottles and the street door are gone.
SET = """  // floor
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40, 1, 1), mat(PAL.floor));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  set.add(floor);

  // back wall: dressed stone, laid in courses
  var backWall = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), mat(PAL.wall));
  backWall.position.set(0, 4.5, -4.2);
  backWall.receiveShadow = true;
  set.add(backWall);

  var bottles = [];   // kept: the ambient sway loop still reads this list
  for (var cy = 0; cy < 5; cy++) {
    for (var cx = 0; cx < 13; cx++) {
      var block = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.62, 0.12),
        mat(cy % 2 ? PAL.stone : PAL.stoneLit));
      block.position.set(-10.4 + cx * 1.8 + (cy % 2) * 0.9, 0.5 + cy * 0.66, -4.1);
      block.receiveShadow = true;
      set.add(block);
    }
  }

  // cedar beams across the ceiling
  for (var bm = 0; bm < 6; bm++) {
    var beam = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 0.34), mat(PAL.woodDark));
    beam.position.set(0, 4.25, -3.4 + bm * 1.5);
    beam.castShadow = true;
    set.add(beam);
  }

  // columns down both sides
  for (var ci = 0; ci < 4; ci++) {
    [-4.6, 4.6].forEach(function (cxp) {
      var col = new THREE.Group();
      var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 4.1, 7), mat(PAL.stoneLit));
      shaft.position.y = 2.05;
      shaft.castShadow = true;
      col.add(shaft);
      var cap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.26, 1.0), mat(PAL.stone));
      cap.position.y = 4.2;
      col.add(cap);
      var base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 0.95), mat(PAL.stone));
      base.position.y = 0.11;
      col.add(base);
      col.position.set(cxp, 0, -2.6 + ci * 2.3);
      set.add(col);
    });
  }

  // the dais and the throne, on David's side
  var dais = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 2.6), mat(PAL.stoneLit));
  dais.position.set(0.95, 0.11, 0.1);
  dais.receiveShadow = true;
  set.add(dais);
  var dais2 = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.2, 2.1), mat(PAL.stone));
  dais2.position.set(0.95, 0.31, 0.1);
  dais2.receiveShadow = true;
  set.add(dais2);

  var throne = new THREE.Group();
  var tBack = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.5, 0.14), mat(PAL.wood));
  tBack.position.set(0, 1.18, -0.42);
  tBack.castShadow = true;
  throne.add(tBack);
  for (var ta = 0; ta < 2; ta++) {
    var arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.72), mat(PAL.woodLight));
    arm.position.set(ta ? 0.43 : -0.43, 0.84, -0.08);
    throne.add(arm);
    var fin = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 5), mat(PAL.gold));
    fin.position.set(ta ? 0.43 : -0.43, 1.98, -0.42);
    throne.add(fin);
  }
  throne.position.set(0.72, 0, 0.5);
  throne.rotation.y = -0.3;
  set.add(throne);

  // banners hung between the columns
  for (var bi = 0; bi < 3; bi++) {
    var ban = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.3),
      mat(bi % 2 ? PAL.shirtB : PAL.wood, { side: THREE.DoubleSide }));
    ban.position.set(-3.3 + bi * 3.3, 2.5, -4.0);
    set.add(ban);
  }

  // a low table with the king's cup
  var tableG = new THREE.Group();
  var ttop = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.6), mat(PAL.woodLight));
  ttop.position.y = 0.52;
  ttop.castShadow = true;
  tableG.add(ttop);
  for (var tl = 0; tl < 4; tl++) {
    var tleg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.52, 5), mat(PAL.woodDark));
    tleg.position.set(tl < 2 ? -0.45 : 0.45, 0.26, tl % 2 ? -0.22 : 0.22);
    tableG.add(tleg);
  }
  tableG.position.set(2.75, 0, 1.5);
  tableG.rotation.y = -0.4;
  set.add(tableG);
"""


# --------------------------------------------------------------- braziers
# The light rig keeps its name and its wiring (updateMood drives `pendants`),
# but the fixture is a standing brazier on a tripod, not a hanging lamp, and
# it stands on the floor rather than over a bar.
BRAZ_FROM = """    var shade = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.34, 7, 1, true), mat(0x3a2b22, { side: THREE.DoubleSide }));
    shade.position.y = -0.08;
    g.add(shade);"""
BRAZ_TO = """    var shade = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.2, 0.3, 7, 1, true), mat(0x3b2a1c, { side: THREE.DoubleSide }));
    shade.position.y = -0.08;
    g.add(shade);
    for (var tri = 0; tri < 3; tri++) {
      var legA = (tri / 3) * Math.PI * 2;
      var tleg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 2.3, 5), mat(0x2b2018));
      tleg2.position.set(Math.cos(legA) * 0.17, -1.32, Math.sin(legA) * 0.17);
      tleg2.rotation.set(Math.sin(legA) * 0.09, 0, -Math.cos(legA) * 0.09);
      g.add(tleg2);
    }"""
BRAZ_CORD = """    cord.position.y = 0.75;"""
BRAZ_CORD_TO = """    cord.visible = false;
    cord.position.y = 0.75;"""
BRAZ_POS = """    g.position.set(x, 3.05, -0.1);"""
BRAZ_POS_TO = """    g.position.set(x * 1.25, 1.62, -1.25);"""
# the bar's red sign has no place in a palace hall
NEON_FROM = """  var neon = new THREE.PointLight(0xff4d6a, 0.5, 8, 2);
  neon.position.set(-4.6, 2.4, -2.2);"""
NEON_TO = """  var neon = new THREE.PointLight(0xe0762a, 0.5, 9, 2);
  neon.position.set(-4.3, 1.1, 2.6);"""


def cut(src, start_anchor, end_anchor, replacement, what):
    """Replace src[start_anchor .. end_anchor] (inclusive) with replacement."""
    i = src.index(start_anchor)
    j = src.index(end_anchor, i) + len(end_anchor)
    return src[:i] + replacement + src[j:]


# --------------------------------------------------------------- palette
# A hall at night: limestone and cedar, lit by standing braziers. The king's
# side carries Tyrian purple and gold; the prophet is undyed wool.
PAL = '''  var PAL = {
    wood:      0x4a3528,
    woodDark:  0x2e2018,
    woodLight: 0x6d5038,
    wall:      0x2a2520,
    floor:     0x211d1a,
    skinA:     0xb3794f,   // Nathan
    skinB:     0xc08a5e,   // David
    shirtA:    0x6d6150,   // Nathan: undyed wool
    shirtB:    0x4a2340,   // David: Tyrian purple
    collar:    0xd9cdb8,
    hairA:     0x6b6259,   // Nathan: grey
    hairB:     0x33261d,   // David: dark
    whiskey:   0x7a2f2f,   // wine in the king's cup
    water:     0x9fc4d8,
    glass:     0xc9a74e,   // beaten gold
    brass:     0xb98a3e,
    bottleA:   0x5c3b1e,
    bottleB:   0x2f4336,
    bottleC:   0x6a2c2c,
    photo:     0xe3d8c6,
    stone:     0x3b352e,
    stoneLit:  0x554b3f,
    gold:      0xc9a74e,
    ember:     0xe0762a
  };
'''

# ----------------------------------------------------------------- shots
# Nathan stands; David is on the throne. The camera favours whoever holds the
# moral ground, and crosses the line once -- at "You are the man".
SHOTS = '''  var SHOTS = {
    wide:        { pos:[0.1, 2.15, 6.2],   look:[0.05, 1.45, 0.3],  fov:40, drift:[0.5, 0.16, 0.10] },
    wideSlow:    { pos:[-1.8, 2.05, 5.6],  look:[0.05, 1.45, 0.3],  fov:38, drift:[0.22, 0.1, 0.05] },
    hall:        { pos:[0.05, 1.85, 3.6],  look:[0.05, 1.35, -0.2], fov:38, drift:[0.4, 0.14, 0.12] },
    twoN:        { pos:[-2.5, 1.85, 3.5],  look:[0.15, 1.55, 0.45], fov:36, drift:[0.35, 0.12, 0.08] },
    twoD:        { pos:[2.6, 1.88, 3.4],   look:[-0.1, 1.55, 0.45], fov:36, drift:[0.35, 0.12, 0.08] },
    cuN:         { pos:[1.25, 1.80, 3.05], look:[-0.62, 1.70, 0.62],fov:26, drift:[0.2, 0.09, 0.05] },
    cuNtight:    { pos:[0.75, 1.78, 2.62], look:[-0.62, 1.70, 0.62],fov:23, drift:[0.12, 0.06, 0.03] },
    cuD:         { pos:[-1.05, 1.82, 3.1], look:[0.72, 1.70, 0.62], fov:26, drift:[0.2, 0.09, 0.05] },
    cuDtight:    { pos:[-0.6, 1.80, 2.68], look:[0.72, 1.70, 0.62], fov:23, drift:[0.12, 0.06, 0.03] },
    throne:      { pos:[-0.3, 1.84, 2.95], look:[0.72, 1.68, 0.62], fov:30, drift:[0.18, 0.07, 0.06] },
    accuse:      { pos:[-0.45, 1.78, 2.45],look:[0.72, 1.72, 0.62], fov:24, drift:[0.1, 0.05, 0.04] },
    lowD:        { pos:[-0.5, 1.30, 2.6],  look:[0.72, 1.74, 0.62], fov:30, drift:[0.14, 0.07, 0.05] },
    handsD:      { pos:[0.1, 1.72, 2.5],   look:[0.4, 1.22, -0.15], fov:30, drift:[0.18, 0.07, 0.06] },
    overN:       { pos:[-1.6, 2.15, 2.5],  look:[0.72, 1.55, 0.62], fov:34, drift:[0.25, 0.1, 0.07] },
    finalWide:   { pos:[0.2, 2.45, 7.2],   look:[0.05, 1.45, 0.3],  fov:40, drift:[0.5, 0.2, 0.14] }
  };
'''

# ----------------------------------------------------------------- moods
# Braziers burn steady while the parable is told, flare on David's verdict,
# then drain cold the moment the parable turns on him. One warm return at the end.
MOODS = '''  var MOODS = {
    lamp:    { pend: 2.5, key: 2.1, cold: 0.08, amb: 1.02, neon: 0.46, fogN: 9.0, fogF: 34 },
    hot:     { pend: 3.0, key: 2.5, cold: 0.04, amb: 1.12, neon: 0.6,  fogN: 9.5, fogF: 36 },
    cold:    { pend: 1.5, key: 1.25, cold: 0.78, amb: 0.72, neon: 0.22, fogN: 6.2, fogF: 24 },
    low:     { pend: 1.15, key: 0.95, cold: 0.62, amb: 0.6, neon: 0.16, fogN: 5.4, fogF: 21 },
    warm:    { pend: 2.2, key: 1.85, cold: 0.14, amb: 0.95, neon: 0.4,  fogN: 8.2, fogF: 31 }
  };
'''

# --------------------------------------------------------------- actions
# A = Nathan (standing, still, deliberate). B/P = David (throned, then undone).
ACTIONS = '''  function fireAction(tag) {
    switch (tag) {
      case "tell":     A.handUp = 0.35; A.lean = 0.15; A.brow = 0; break;
      case "tender":   A.handUp = 0.2; A.lean = 0.1; A.brow = 0.25; break;
      case "accuse":   A.handUp = 1; A.lean = 0.8; A.brow = -0.8; A.headTurn = 0; break;
      case "lean":     P.lean = 0.7; P.brow = 0.2; break;
      case "anger":    P.lean = 1; P.brow = -0.9; P.handUp = 0.8; break;
      case "rage":     P.lean = 1; P.brow = -1; P.handUp = 1; P.smile = 0; break;
      case "freeze":   P.lean = 0; P.brow = 0.9; P.handUp = 0; P.headTurn = 0; break;
      case "falter":   P.lean = 0.1; P.brow = 0.4; P.headDown = 0.35; P.handUp = 0; break;
      case "break":    P.slump = 1; P.headDown = 0.85; P.brow = -0.7; P.lean = 0; break;
      case "headDown": P.headDown = 0.8; P.slump = 0.7; break;
      case "kneel":    P.slump = 1; P.headDown = 1; P.cry = 0.6; P.reach = 0.4; break;
    }
  }
'''


# The throne room has no street door, so the SET replacement below drops
# doorPanel and doorGlow. The per-frame loop still animated them, which threw
# `doorPanel is not defined` on the first frame and failed every render.
# Remove the two orphaned lines from both outputs.
DOOR_ANIM = """    // door swings as he reaches it, cold street light spills in
    doorPanel.rotation.y = ease(doorPanel.rotation.y, doorOpen * -0.85, 2.2, dt);
    doorGlow.material.opacity = 0.22 + doorOpen * 0.3 + Math.sin(t * 0.5) * 0.02;
"""
DOOR_ANIM_TO = """    // (no door in the throne room - the bar's door animation is gone)
"""


# The SET swap replaced the room but not the bar's PROPS. A whiskey tumbler,
# the photograph and the bartender were still built and added to the scene, and
# the stool was built inside buildPerson, so both men sat on an invisible stool
# in the throne room. Remove the props; seat only David, and stand Nathan up.

# 1. the pastor's glass of water / whiskey tumbler on the bar
GLASS_FROM = """  waterGlass.position.set(0.74, 1.16, -0.42);
  set.add(waterGlass);"""
GLASS_TO = """  waterGlass.visible = false;   // no drinks in the throne room"""

# 2. the photograph from the wallet - a modern prop, no place here
PHOTO_FROM = """    photo.visible = photoOut > 0.03;"""
PHOTO_TO = """    photo.visible = false;   // no photograph in this story"""

# 3. the bartender working the back bar
BARTENDER_FROM = """  bartender.position.set(-2.4, 0, -2.3);
  set.add(bartender);"""
BARTENDER_TO = """  bartender.visible = false;   // no bartender in the throne room"""

# 4. the stool, built into every character. David sits on the throne, which the
#    set provides; Nathan stands. Neither needs a bar stool.
STOOL_FROM = """    P.add(stool);"""
STOOL_TO = """    stool.visible = false;   // David has the throne, Nathan stands
    P.add(stool);"""

# 5. Nathan is a prophet who came to confront the king: he is on his feet for
#    the whole film. `stand` already exists in the rig, so hold it at 1 for him
#    rather than inventing a new pose. David keeps the seated pose on the throne.
STAND_FROM = """    var lean = c.lean || 0, slump = c.slump || 0, stand = c.stand || 0, away = c.away || 0;"""
STAND_TO = """    var lean = c.lean || 0, slump = c.slump || 0, stand = c.stand || 0, away = c.away || 0;
    // Nathan stands throughout; David is seated on the throne.
    if (isAtheist) stand = 1;"""


def strip_props(text, label):
    """Remove the bar's props and stand Nathan up. Each edit must apply once."""
    for frm, to, what in (
        (GLASS_FROM, GLASS_TO, 'water glass'),
        (PHOTO_FROM, PHOTO_TO, 'photograph'),
        (BARTENDER_FROM, BARTENDER_TO, 'bartender'),
        (STOOL_FROM, STOOL_TO, 'stool'),
        (STAND_FROM, STAND_TO, 'standing pose'),
    ):
        assert text.count(frm) == 1, '%s not found once in %s' % (what, label)
        text = text.replace(frm, to)
    return text


def strip_door(text, label):
    """Drop the bar-door animation; assert it was there exactly once."""
    assert text.count(DOOR_ANIM) == 1, 'door anim not found once in ' + label
    return text.replace(DOOR_ANIM, DOOR_ANIM_TO)


def main():
    src = io.open(ENGINE, encoding='utf-8').read()

    for _f, _t in ((BRAZ_CORD, BRAZ_CORD_TO), (BRAZ_FROM, BRAZ_TO),
                   (BRAZ_POS, BRAZ_POS_TO), (NEON_FROM, NEON_TO)):
        assert src.count(_f) == 1, _f[:40]
        src = src.replace(_f, _t)

    # --- set: bar -> throne room ---------------------------------------
    SET_FROM = '  // floor\n'
    SET_TO = '  // =====================================================================\n  //  CHARACTER RIG'
    i = src.index(SET_FROM)
    j = src.index(SET_TO, i)
    src = src[:i] + SET + '\n' + src[j:]

    # --- palette -------------------------------------------------------
    src = cut(src, '  var PAL = {', '  };\n', PAL, 'palette')

    # --- shots ---------------------------------------------------------
    i = src.index('  var SHOTS = {')
    j = src.index('\n  };\n', i) + len('\n  };\n')
    src = src[:i] + SHOTS + src[j:]

    # --- moods ---------------------------------------------------------
    i = src.index('  var MOODS = {')
    j = src.index('\n  };\n', i) + len('\n  };\n')
    src = src[:i] + MOODS + src[j:]

    # --- actions -------------------------------------------------------
    i = src.index('  function fireAction(tag) {')
    j = src.index('\n  }\n', src.index('switch (tag)', i)) + len('\n  }\n')
    src = src[:i] + ACTIONS + src[j:]

    # --- beats ---------------------------------------------------------
    beats = io.open(os.path.join(HERE, 'beats.js'), encoding='utf-8').read()
    i = src.index('  var BEATS = [')
    j = src.index('\n  ];\n', i) + len('\n  ];\n')
    src = src[:i] + beats + src[j:]

    # --- duration ------------------------------------------------------
    src = src.replace('  var DURATION = 284.45;',
                      '  var DURATION = %.2f;' % DURATION)

    # --- speaker map: a/p -> n/d ---------------------------------------
    src = src.replace('var NAMES = { a: "The Atheist", p: "The Pastor", n: "" };',
                      'var NAMES = { n: "Nathan", d: "David" };')
    # the two talking flags key off the speaker code
    src = src.replace('speaking && b.spk === "a" ? 1 : 0', 'speaking && b.spk === "n" ? 1 : 0')
    src = src.replace('speaking && b.spk === "p" ? 1 : 0', 'speaking && b.spk === "d" ? 1 : 0')

    # --- narration ------------------------------------------------------
    mp3_path = os.path.join(HERE, 'narration.mp3')
    if not os.path.exists(mp3_path):
        raise SystemExit(
            'narration.mp3 is missing. See NARRATION-README.md: the only\n'
            'recording on hand narrates Job, not Nathan and David, and the\n'
            'beats are still timed to it. Supply the real narration and\n'
            're-run the alignment before building.')
    mp3 = io.open(mp3_path, 'rb').read()
    b64 = base64.b64encode(mp3).decode('ascii')
    i = src.index('  var AUDIO_SRC = "data:audio/mpeg;base64,')
    j = src.index('";\n', i) + len('";\n')
    src = src[:i] + '  var AUDIO_SRC = "data:audio/mpeg;base64,' + b64 + '";\n' + src[j:]

    # --- copy -----------------------------------------------------------
    src = src.replace('<title>Two Fathers', '<title>You Are the Man')
    src = src.replace('<h1><em>A short film</em>Two Fathers</h1>',
                      '<h1><em>A short film</em>You Are the Man</h1>')
    src = src.replace(
        'An atheist and a pastor at closing time. Four minutes and forty-four seconds, narrated &mdash; sound on, the voice carries the story.',
        'The prophet Nathan brings King David a story about a stolen lamb. Two minutes thirty-five, narrated &mdash; sound on, the voice carries it.')
    src = src.replace(
        "Sometimes the deepest conversations about God don't end with someone winning an argument.",
        'Before you judge the sins of another, examine your own heart.')
    src = src.replace('Two Fathers &mdash; 1280x720 MP4', 'You Are the Man &mdash; 1280x720 MP4')
    # the old release link/size belongs to the other film
    src = re.sub(r'Download the MP4 &mdash; 43 MB', 'Download the MP4', src)

    # The first beat starts at t=0, so nothing has driven the camera when
    # frame 0 is grabbed and it renders from the origin, inside the floor.
    # Snap it onto the opening shot during setup so frame 0 is composed.
    PRIME_FROM = """  seek(0);
  window.__filmReady = true;"""
    PRIME_TO = """  seek(0);
  updateCamera(0, 0);
  shotT = 1;
  updateCamera(0, 0);
  window.__filmReady = true;"""
    assert src.count(PRIME_FROM) <= 1

    if PRIME_FROM in src: src = src.replace(PRIME_FROM, PRIME_TO)
    src = strip_door(src, 'index.html')
    src = strip_props(src, 'index.html')
    io.open(OUT, 'w', encoding='utf-8').write(src)
    print('wrote', OUT, len(src), 'bytes')

    # render-mode twin: same transform applied to the deterministic variant
    rm_in = os.path.join(ROOT, 'films', 'two-fathers', 'src', 'render-mode.html')
    rm = io.open(rm_in, encoding='utf-8').read()
    for _f, _t in ((BRAZ_CORD, BRAZ_CORD_TO), (BRAZ_FROM, BRAZ_TO),
                   (BRAZ_POS, BRAZ_POS_TO), (NEON_FROM, NEON_TO)):
        rm = rm.replace(_f, _t)
    i = rm.index(SET_FROM)
    j = rm.index(SET_TO, i)
    rm = rm[:i] + SET + '\n' + rm[j:]
    for a, b in [('  var PAL = {', PAL), ('  var SHOTS = {', SHOTS),
                 ('  var MOODS = {', MOODS)]:
        i = rm.index(a)
        j = rm.index('\n  };\n', i) + len('\n  };\n')
        rm = rm[:i] + b + rm[j:]
    i = rm.index('  function fireAction(tag) {')
    j = rm.index('\n  }\n', rm.index('switch (tag)', i)) + len('\n  }\n')
    rm = rm[:i] + ACTIONS + rm[j:]
    i = rm.index('  var BEATS = [')
    j = rm.index('\n  ];\n', i) + len('\n  ];\n')
    rm = rm[:i] + beats + rm[j:]
    rm = rm.replace('  var DURATION = 284.45;', '  var DURATION = %.2f;' % DURATION)
    rm = rm.replace('var NAMES = { a: "The Atheist", p: "The Pastor", n: "" };',
                    'var NAMES = { n: "Nathan", d: "David" };')
    rm = rm.replace('speaking && b.spk === "a" ? 1 : 0', 'speaking && b.spk === "n" ? 1 : 0')
    rm = rm.replace('speaking && b.spk === "p" ? 1 : 0', 'speaking && b.spk === "d" ? 1 : 0')
    # render-mode renders picture only; mux.sh pairs the frames with the
    # original full-quality audio, so it keeps its empty AUDIO_SRC.
    assert '  var AUDIO_SRC = "";' in rm
    rm = rm.replace('<title>Two Fathers', '<title>You Are the Man')
    if PRIME_FROM in rm: rm = rm.replace(PRIME_FROM, PRIME_TO)
    rm = strip_door(rm, 'render-mode.html')
    rm = strip_props(rm, 'render-mode.html')
    rm_out = os.path.join(HERE, 'render-mode.html')
    io.open(rm_out, 'w', encoding='utf-8').write(rm)
    print('wrote', rm_out, len(rm), 'bytes')


if __name__ == '__main__':
    main()
