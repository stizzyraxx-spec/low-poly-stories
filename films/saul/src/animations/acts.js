// animations/acts.js — one function per beat.
//
// An act only sets TARGETS; perform.js eases bodies toward them. That means a
// cut never catches a snapped pose, and an act can be re-applied on a seek
// without the frame looking different from a continuous play.
//
// Listeners get reactions too. A two-hander where only the speaker moves
// reads as two robots taking turns, so each act also says what the other
// people in frame are doing.

function buildActs(film) {
  function face(c, other) {
    // turn one figure's head toward another, in that figure's local frame
    if (!c || !other) return;
    var dx = other.root.position.x - c.root.position.x;
    var dz = other.root.position.z - c.root.position.z;
    var want = Math.atan2(dx, dz) - c.root.rotation.y;
    while (want > Math.PI) want -= Math.PI * 2;
    while (want < -Math.PI) want += Math.PI * 2;
    c.s.headTurn = Math.max(-1, Math.min(1, want / 0.5));
  }

  var A = {};

  // ---------------------------------------------------- 1: persecution
  A.s1_order = function (C) {
    var s = C.saul.s;
    s.point = 1; s.browAngle = 1; s.lean = 0.3; s.walk = 0.45;
    for (var g = 0; g < C.guards.length; g++) C.guards[g].s.walk = 0.45;
    for (var p = 0; p < C.persecuted.length; p++) {
      C.persecuted[p].s.browRaise = 0.8;
      C.persecuted[p].s.headTurn = 0.3;
    }
    C.chris.s.browRaise = 1;
  };
  A.s1_plead = function (C) {
    C.saul.s.point = 0.5; C.saul.s.walk = 0; C.saul.s.browAngle = 0.9;
    var c = C.chris.s;
    c.armUpL = 0.75; c.armUpR = 0.75; c.browRaise = 1; c.lean = 0.2;
    face(C.chris, C.saul);
    for (var p = 0; p < C.persecuted.length; p++) {
      C.persecuted[p].s.browRaise = 0.9;
      C.persecuted[p].s.slump = 0.3;
    }
  };
  A.s1_rage = function (C) {
    var s = C.saul.s;
    s.browAngle = 1; s.point = 1; s.lean = 0.45; s.headTurn = 0;
    C.chris.s.slump = 0.6; C.chris.s.headDown = 0.5;
    C.chris.s.armUpL = 0.2; C.chris.s.armUpR = 0.2;
    for (var g = 0; g < C.guards.length; g++) C.guards[g].s.lean = 0.15;
  };

  // ------------------------------------------------------ 2: the road
  A.s2_ask = function (C) {
    C.comp1.s.headTurn = 0; C.comp1.s.browRaise = 0.4;
    face(C.comp1, C.saul);
    C.saul.s.walk = 1; C.comp1.s.walk = 1; C.comp2.s.walk = 1;
  };
  A.s2_march = function (C) {
    var s = C.saul.s;
    s.walk = 1; s.lean = 0.12; s.browAngle = 0.55; s.point = 0.3;
    C.comp1.s.walk = 1; C.comp2.s.walk = 1;
    face(C.comp1, C.saul);
  };
  A.s2_bless = function (C) {
    C.comp1.s.armUpR = 0.4; C.comp1.s.browRaise = 0.25;
    C.saul.s.point = 0; C.saul.s.walk = 1;
    C.comp1.s.walk = 1; C.comp2.s.walk = 1;
  };

  // --------------------------------------------------- 3: the light
  A.s3_shield = function (C) {
    var s = C.saul.s;
    s.walk = 0; s.shield = 1; s.browRaise = 1; s.headDown = -0.3;
    s.headTilt = 0.3; s.lean = -0.25;
    C.comp1.s.walk = 0; C.comp2.s.walk = 0;
    C.comp1.s.shield = 0.7; C.comp2.s.shield = 0.6;
    C.comp1.s.browRaise = 1; C.comp2.s.browRaise = 1;
  };
  A.s3_fall = function (C) {
    var s = C.saul.s;
    s.fallen = 1; s.shield = 0.8; s.kneel = 0.6; s.headDown = 0.3;
    s.browRaise = 1;
    C.comp1.s.shield = 0.9; C.comp2.s.shield = 0.85;
    C.comp1.s.kneel = 0.4; C.comp2.s.kneel = 0.35;
  };
  A.s3_ask = function (C) {
    var s = C.saul.s;
    s.fallen = 1; s.shield = 0.45; s.headDown = -0.5; s.browRaise = 1;
    s.armUpR = 0.3;
  };
  A.s3_declare = function (C) {
    var s = C.saul.s;
    s.fallen = 1; s.shield = 0.95; s.headDown = 0.2; s.browRaise = 1;
    C.comp1.s.shield = 1; C.comp2.s.shield = 0.95;
  };
  A.s3_disbelief = function (C) {
    var s = C.saul.s;
    s.fallen = 1; s.shield = 0.3; s.headDown = -0.4; s.browRaise = 1;
    s.headTilt = -0.2;
  };
  A.s3_command = function (C) {
    var s = C.saul.s;
    s.fallen = 1; s.shield = 0.6; s.headDown = 0.55; s.browRaise = 0.8;
    s.kneel = 0.8;
  };

  // ------------------------------------------------- 4: blindness
  A.s4_blind = function (C, b) {
    var s = C.saul.s;
    s.fallen = 0.35; s.shield = 0; s.kneel = 0.25; s.lidDrop = 1;
    s.browRaise = 0.9; s.reach = 0.55; s.headTurn = 0.2;
    film.setBlind(1);                    // subjective fade to black
    C.comp1.s.kneel = 0; C.comp2.s.kneel = 0;
    C.comp1.s.browRaise = 0.6;
  };
  A.s4_concern = function (C) {
    film.setBlind(0);                    // back to an external camera
    C.saul.s.reach = 0.8; C.saul.s.lidDrop = 1; C.saul.s.kneel = 0.15;
    C.comp1.s.lean = 0.3; C.comp1.s.reach = 0.4; C.comp1.s.browRaise = 0.7;
    face(C.comp1, C.saul);
  };
  A.s4_grope = function (C) {
    var s = C.saul.s;
    s.reach = 1; s.lidDrop = 1; s.kneel = 0; s.headDown = 0.25;
    s.headTurn = -0.3; s.browRaise = 0.8;
    C.comp1.s.reach = 0.65; C.comp2.s.reach = 0.5;
    C.comp1.s.lean = 0.25;
  };
  A.s4_lead = function (C) {
    var s = C.saul.s;
    s.reach = 0.5; s.lidDrop = 1; s.headDown = 0.4; s.walk = 0.55;
    C.comp1.s.walk = 0.55; C.comp2.s.walk = 0.55;
    C.comp1.s.armUpR = 0.35; C.comp2.s.armUpL = 0.3;
  };

  // --------------------------------------------- 5: three days dark
  A.s5_pray = function (C) {
    var s = C.saul.s;
    s.kneel = 1; s.headDown = 0.9; s.lidDrop = 1; s.slump = 0.5;
    s.armUpL = 0.35; s.armUpR = 0.35; s.walk = 0;
  };

  // ------------------------------------------------- 6: the vision
  A.s6_called = function (C) {
    var s = C.anan.s;
    s.kneel = 1; s.headDown = -0.3; s.browRaise = 1; s.armUpL = 0.5; s.armUpR = 0.5;
  };
  A.s6_answer = function (C) {
    C.anan.s.headDown = -0.45; C.anan.s.browRaise = 0.9;
  };
  A.s6_instruct = function (C) {
    C.anan.s.headDown = -0.2; C.anan.s.browRaise = 0.6; C.anan.s.lidDrop = 0.2;
  };
  A.s6_protest = function (C) {
    var s = C.anan.s;
    s.browRaise = 1; s.headDown = 0.1; s.armUpR = 0.8; s.lean = 0.25;
    s.headTilt = 0.15;
  };
  A.s6_chosen = function (C) {
    var s = C.anan.s;
    s.browRaise = 0.4; s.headDown = 0.5; s.armUpL = 0.4; s.armUpR = 0.4;
    s.lean = -0.1;
  };
  A.s6_obey = function (C) {
    var s = C.anan.s;
    s.kneel = 0; s.headDown = 0.2; s.browRaise = 0.2; s.armUpL = 0; s.armUpR = 0;
  };

  // --------------------------------------- 7: sight restored, baptism
  A.s7_enter = function (C) {
    C.anan.s.walk = 0.5; C.anan.s.browRaise = 0.5;
    C.saul.s.kneel = 1; C.saul.s.lidDrop = 1; C.saul.s.headDown = 0.45;
  };
  A.s7_who = function (C) {
    C.anan.s.walk = 0;
    var s = C.saul.s;
    s.headDown = 0; s.headTurn = -0.5; s.lidDrop = 1; s.browRaise = 0.7;
    s.reach = 0.3;
  };
  A.s7_explain = function (C) {
    C.anan.s.lean = 0.2; C.anan.s.armUpR = 0.3;
    face(C.anan, C.saul);
    C.saul.s.headTurn = -0.35; C.saul.s.lidDrop = 1; C.saul.s.browRaise = 0.5;
  };
  A.s7_evenme = function (C) {
    var s = C.saul.s;
    s.headDown = 0.35; s.slump = 0.45; s.lidDrop = 1; s.browRaise = 0.3;
    s.browAngle = -0.3;
    C.anan.s.lean = 0.15; C.anan.s.browRaise = 0.3;
  };
  A.s7_layhands = function (C, b) {
    C.anan.s.kneel = 0.75; C.anan.s.reach = 1; C.anan.s.lean = 0.3;
    C.saul.s.headDown = 0.1; C.saul.s.lidDrop = 1;
    film.dropScales(b.t + 1.1);          // the scales fall as he speaks
  };
  A.s7_see = function (C) {
    var s = C.saul.s;
    s.lidDrop = 0; s.browRaise = 1; s.headDown = -0.25; s.kneel = 0.6;
    s.armUpL = 0.4; s.armUpR = 0.4; s.reach = 0;
    C.anan.s.reach = 0.3; C.anan.s.browRaise = 0.5; C.anan.s.kneel = 0.6;
  };
  A.s7_baptize = function (C) {
    C.saul.s.kneel = 0.4; C.saul.s.headDown = 0.3; C.saul.s.lidDrop = 0;
    C.anan.s.armUpR = 0.9; C.anan.s.kneel = 0.4; C.anan.s.reach = 0.4;
    // the one costume change in the film: the dark robe becomes pale
    C.saul.robe.material.color.setHex(PAL.robeSaulLight);
  };
  A.s7_reflect = function (C) {
    var s = C.saul.s;
    s.kneel = 0; s.headDown = 0.2; s.slump = 0.2; s.lidDrop = 0;
    s.browAngle = -0.2; s.armUpL = 0; s.armUpR = 0;
    C.anan.s.kneel = 0; C.anan.s.reach = 0; C.anan.s.armUpR = 0;
    face(C.anan, C.saul);
  };
  A.s7_whatnow = function (C) {
    C.anan.s.browRaise = 0.5; C.anan.s.lean = 0.15;
    C.saul.s.headTurn = -0.3;
  };

  // ----------------------------------------------- 8: preaching
  A.s8_declare = function (C) {
    var s = C.saul.s;
    s.point = 0.8; s.lean = 0.2; s.browRaise = 0.6; s.headDown = -0.15;
    s.armUpR = 0.5; s.lidDrop = 0; s.kneel = 0; s.slump = 0;
    for (var i = 0; i < C.crowd.length; i++) C.crowd[i].s.headTurn = (rnd() - 0.5) * 0.2;
  };
  A.s8_recognise = function (C) {
    C.saul.s.point = 0.3;
    C.citA.s.lean = 0.25; C.citA.s.browRaise = 0.9; C.citA.s.point = 0.5;
    face(C.citA, C.citB);
    for (var i = 0; i < C.crowd.length; i++) {
      C.crowd[i].s.headTurn = (rnd() - 0.5) * 0.6;
      C.crowd[i].s.browRaise = 0.4;
    }
  };
  A.s8_accuse = function (C) {
    C.citB.s.point = 0.8; C.citB.s.browAngle = 0.6; C.citB.s.lean = 0.3;
    C.citA.s.point = 0.2; C.citA.s.headTurn = 0.3;
    C.saul.s.headDown = 0.1; C.saul.s.point = 0;
  };
  A.s8_testify = function (C) {
    var s = C.saul.s;
    s.point = 0.6; s.lean = 0.25; s.browRaise = 0.5; s.armUpR = 0.6;
    C.citB.s.point = 0; C.citB.s.browAngle = 0.2;
    C.citA.s.point = 0;
    for (var i = 0; i < C.crowd.length; i++) {
      C.crowd[i].s.headTurn = (rnd() - 0.5) * 0.15;
      C.crowd[i].s.browRaise = 0.2;
    }
  };
  A.s8_andnow = function (C) {
    C.citA.s.browRaise = 0.8; C.citA.s.lean = 0.2;
    C.saul.s.point = 0.3;
  };
  A.s8_proclaim = function (C) {
    var s = C.saul.s;
    s.point = 1; s.armUpR = 0.9; s.lean = 0.15; s.browRaise = 0.8;
    s.headDown = -0.3;
    for (var i = 0; i < C.crowd.length; i++) C.crowd[i].s.browRaise = 0.5;
  };
  A.s8_evenafter = function (C) {
    C.citB.s.browRaise = 0.7; C.citB.s.lean = 0.2; C.citB.s.point = 0.3;
    C.saul.s.point = 0.2; C.saul.s.armUpR = 0.2;
  };
  A.s8_mercy = function (C) {
    var s = C.saul.s;
    s.point = 0.2; s.armUpL = 0.45; s.armUpR = 0.45; s.lean = 0;
    s.browRaise = 0.3; s.headDown = 0;
    C.citB.s.point = 0; C.citB.s.browAngle = 0; C.citB.s.headDown = 0.2;
    C.citA.s.headDown = 0.15;
  };

  // --------------------------------------------- 9: the road out
  A.s9_walk = function (C) {
    var s = C.saul.s;
    s.walk = 1; s.lean = 0.06; s.headDown = 0; s.browRaise = 0.2;
    s.point = 0; s.armUpL = 0; s.armUpR = 0; s.lidDrop = 0;
  };

  return A;
}
