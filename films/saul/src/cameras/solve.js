// cameras/solve.js — shots computed from where people actually stand.
//
// Hand-typed camera coordinates drift out of agreement with staging the
// moment a character moves, and the error is invisible until you look at a
// rendered frame. (On the first Saul render: jSaulCU aimed at empty road
// because Saul had moved, and jFearCU sat inside a building.) These helpers
// derive a shot from a live subject instead, so staging and camera cannot
// disagree.
//
// A derived shot is resolved every frame, so it also tracks a walking subject.

var EYE = 1.62;           // eye height of an average figure, in world units

// Where is this character's head right now, in world space?
function headOf(c, out) {
  if (!c) return out.set(0, EYE, 0);
  c.head.getWorldPosition(out);
  return out;
}

// A close-up: stand off the subject's eyeline at `dist`, offset by `yaw`
// radians around them, looking at the head. `side` biases the subject off
// centre so the frame has somewhere to look.
function cu(subject, opts) {
  opts = opts || {};
  return {
    derive: function (t, v, look) {
      headOf(subject, v);
      look.copy(v);
      var yaw = (subject ? subject.root.rotation.y : 0) + Math.PI + (opts.yaw || 0);
      var d = opts.dist || 1.35;
      v.x += Math.sin(yaw) * d;
      v.z += Math.cos(yaw) * d;
      v.y = look.y + (opts.rise === undefined ? 0.06 : opts.rise);
      if (opts.side) {       // shift the camera sideways, keep the look fixed
        v.x += Math.cos(yaw) * opts.side;
        v.z -= Math.sin(yaw) * opts.side;
      }
    },
    fov: opts.fov || 27,
    drift: opts.drift || [0.16, 0.08, 0.05]
  };
}

// A two-shot: frame both subjects, backing off far enough to hold them both.
function two(a, b, opts) {
  opts = opts || {};
  var vb = new THREE.Vector3();
  return {
    derive: function (t, v, look) {
      headOf(a, v);
      headOf(b, vb);
      look.set((v.x + vb.x) / 2, (v.y + vb.y) / 2 - 0.08, (v.z + vb.z) / 2);
      var sep = v.distanceTo(vb);
      var yaw = (opts.yaw || 0) + Math.atan2(vb.x - v.x, vb.z - v.z) + Math.PI / 2;
      var d = (opts.dist || 2.1) + sep * 0.55;
      v.set(look.x + Math.sin(yaw) * d,
            look.y + (opts.rise === undefined ? 0.28 : opts.rise),
            look.z + Math.cos(yaw) * d);
    },
    fov: opts.fov || 34,
    drift: opts.drift || [0.24, 0.1, 0.1]
  };
}

// Over-the-shoulder: behind `near`, looking past them at `far`.
function over(near, far, opts) {
  opts = opts || {};
  var vf = new THREE.Vector3();
  return {
    derive: function (t, v, look) {
      headOf(near, v);
      headOf(far, vf);
      look.copy(vf);
      var dx = vf.x - v.x, dz = vf.z - v.z;
      var len = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));
      var back = opts.back || 1.0, side = opts.side === undefined ? 0.45 : opts.side;
      v.x -= (dx / len) * back - (dz / len) * side;
      v.z -= (dz / len) * back + (dx / len) * side;
      v.y += opts.rise === undefined ? 0.22 : opts.rise;
    },
    fov: opts.fov || 33,
    drift: opts.drift || [0.2, 0.09, 0.08]
  };
}

// A wide that keeps the subject in frame from a fixed direction.
function wideOn(subject, opts) {
  opts = opts || {};
  return {
    derive: function (t, v, look) {
      headOf(subject, v);
      look.set(v.x, (opts.lookY === undefined ? 1.35 : opts.lookY), v.z);
      var yaw = (opts.yaw || 0);
      var d = opts.dist || 6.5;
      v.set(look.x + Math.sin(yaw) * d,
            opts.height === undefined ? 2.4 : opts.height,
            look.z + Math.cos(yaw) * d);
    },
    fov: opts.fov || 40,
    drift: opts.drift || [0.42, 0.16, 0.2]
  };
}

// A low hero angle, looking up at the subject.
function hero(subject, opts) {
  opts = opts || {};
  return {
    derive: function (t, v, look) {
      headOf(subject, v);
      look.copy(v);
      look.y += 0.1;
      var yaw = (subject ? subject.root.rotation.y : 0) + Math.PI + (opts.yaw || 0);
      var d = opts.dist || 2.2;
      v.set(look.x + Math.sin(yaw) * d,
            opts.height === undefined ? 0.85 : opts.height,
            look.z + Math.cos(yaw) * d);
    },
    fov: opts.fov || 34,
    drift: opts.drift || [0.18, 0.1, 0.08]
  };
}

// Looking straight up from beside a fallen subject - the light overhead.
function lookUp(subject, opts) {
  opts = opts || {};
  return {
    derive: function (t, v, look) {
      headOf(subject, v);
      v.y += 0.1;
      v.x += opts.dx || 0.9;
      v.z += opts.dz || 0.8;
      look.set(v.x * 0.2, (opts.lookY || 7.0), (v.z - 1.0));
    },
    fov: opts.fov || 46,
    drift: opts.drift || [0.22, 0.1, 0.12]
  };
}

// An orbit around a subject, from `from` to `to` radians across the beat.
function orbitOn(subject, opts) {
  opts = opts || {};
  return {
    derive: function (t, v, look, u) {
      headOf(subject, look);
      look.y -= opts.drop === undefined ? 0.2 : opts.drop;
      var a = (opts.from || 0.7) + ((opts.to === undefined ? -0.5 : opts.to) - (opts.from || 0.7)) * smoothstep(u);
      var r = opts.r || 4.2;
      v.set(look.x + Math.sin(a) * r,
            opts.height === undefined ? 2.1 : opts.height,
            look.z + Math.cos(a) * r);
    },
    fov: opts.fov || 34,
    drift: opts.drift || [0.2, 0.1, 0.1]
  };
}
