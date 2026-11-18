// animations/acts.js — one function per beat.
//
// Acts set targets only; perform.js eases toward them, so a cut never lands
// on a snapped pose. Listeners are posed too: a scene where only the speaker
// moves reads as two machines taking turns, and most of this film is two
// people in a room talking.

function buildActs(film) {
  function face(c, other) {
    if (!c || !other) return;
    var dx = other.root.position.x - c.root.position.x;
    var dz = other.root.position.z - c.root.position.z;
    var want = Math.atan2(dx, dz) - c.root.rotation.y;
    while (want > Math.PI) want -= Math.PI * 2;
    while (want < -Math.PI) want += Math.PI * 2;
    c.s.headTurn = Math.max(-1, Math.min(1, want / 0.5));
  }

  var A = {};

  // ---------------------------------------------------- 1: the empire
  A.s1_enter = function (C) {
    C.man.s.lean = 0.1;
    C.man.s.browRaise = 0.15;
    C.asst.s.walk = 0.45;
    C.asst.s.browRaise = 0.5;       // already worried
    face(C.asst, C.man);
  };
  A.s1_reply = function (C) {
    C.asst.s.walk = 0;
    C.man.s.headTurn = 0;
    C.man.s.browRaise = 0.25;
    C.man.s.armUpR = 0.2;           // mid-gesture, a busy man
    face(C.man, C.asst);
  };

  // ------------------------------------------------- 2: the collapse
  A.s2_news = function (C) {
    C.asst.s.reach = 0.55;          // holding the tablet out
    C.asst.s.browRaise = 0.7;
    C.asst.s.lean = 0.15;
    C.man.s.browRaise = 0.5;
    face(C.man, C.asst);
  };
  A.s2_disbelief = function (C) {
    C.man.s.browRaise = 1;
    C.man.s.lean = 0.3;
    C.man.s.armUpR = 0.5;
    C.asst.s.reach = 0.35;
    C.asst.s.headDown = 0.2;
  };
  A.s2_bankrupt = function (C) {
    C.asst.s.reach = 0.7;
    C.asst.s.headDown = 0.3;
    C.asst.s.browRaise = 0.6;
    C.man.s.browRaise = 0.8;
    C.man.s.lean = 0.2;
  };
  A.s2_anger = function (C) {
    C.man.s.browAngle = 1;          // inner brows down: anger, not fear
    C.man.s.point = 0.8;
    C.man.s.lean = 0.35;
    C.man.s.armUpR = 0.6;
    C.asst.s.slump = 0.3;
    C.asst.s.headDown = 0.4;
    C.asst.s.reach = 0;
  };
  A.s2_sorry = function (C) {
    C.asst.s.headDown = 0.5;
    C.asst.s.slump = 0.4;
    C.asst.s.browRaise = 0.4;
    C.man.s.point = 0.2;
    C.man.s.browAngle = 0.6;
  };
  A.s2_sink = function (C) {
    var s = C.man.s;
    s.point = 0; s.browAngle = 0; s.browRaise = 0.3;
    s.slump = 0.6; s.headDown = 0.45; s.armUpR = 0; s.lean = 0;
    C.asst.s.headDown = 0.35;
  };

  // ----------------------------------------------- 3: the phone call
  A.s3_call = function (C) {
    var s = C.man.s;
    s.armUpR = 1.15;                // phone to the ear
    s.headTilt = 0.2;
    s.slump = 0.4;
    s.browRaise = 0.4;
  };
  A.s3_what = function (C) {
    var s = C.man.s;
    s.armUpR = 1.15; s.browRaise = 0.9; s.lean = 0.2; s.headTilt = 0.25;
  };
  A.s3_son = function (C) {
    var s = C.man.s;
    s.armUpR = 1.1; s.browRaise = 1; s.slump = 0.55; s.headDown = 0.3;
  };

  // ------------------------------------------------- 4: the hospital
  A.s4_arrive = function (C) {
    var s = C.man.s;
    s.armUpR = 0; s.walk = 0.9; s.lean = 0.25; s.browRaise = 0.9;
    C.wife.s.slump = 0.7;
    C.wife.s.headDown = 0.6;
    C.doc.s.walk = 0.35;
  };
  A.s4_news = function (C) {
    C.man.s.walk = 0;
    C.man.s.browRaise = 1;
    C.doc.s.walk = 0;
    C.doc.s.headDown = 0.35;
    C.doc.s.slump = 0.2;
    C.doc.s.browRaise = 0.3;
    face(C.doc, C.man);
    face(C.man, C.doc);
  };
  A.s4_collapse = function (C) {
    var s = C.man.s;
    s.headTurn = 0; s.browRaise = 1; s.slump = 1; s.headDown = 0.8;
    s.kneel = 0.9;                  // down onto his knees
    s.armUpL = 0.3; s.armUpR = 0.3;
    C.wife.s.reach = 0.6;
    C.wife.s.lean = 0.3;
    C.wife.s.slump = 0.6;
    C.doc.s.headDown = 0.45;
  };

  // -------------------------------------------- 5: the empty house
  A.s5_why = function (C) {
    var s = C.man.s;
    s.kneel = 0.95; s.slump = 0.7; s.headDown = 0.4; s.browRaise = 0.4;
    s.armUpL = 0.15; s.armUpR = 0.15;
    C.wife.s.headTurn = 0.2;
    C.wife.s.slump = 0.3;
  };
  A.s5_bitter = function (C) {
    C.wife.s.lean = 0.2;
    C.wife.s.browAngle = 0.4;       // exhausted and angry, not cruel
    C.wife.s.browRaise = 0.3;
    C.wife.s.point = 0.3;
    face(C.wife, C.man);
    C.man.s.headDown = 0.55;
  };
  A.s5_curse = function (C) {
    var s = C.man.s;
    s.headDown = 0.1; s.browRaise = 0.7; s.lean = 0.2; s.armUpR = 0.4;
    C.wife.s.point = 0;
    C.wife.s.slump = 0.35;
  };
  A.s5_whatelse = function (C) {
    C.wife.s.browRaise = 0.5;
    C.wife.s.slump = 0.5;
    C.wife.s.headDown = 0.2;
    C.man.s.armUpR = 0;
    C.man.s.headDown = 0.4;
  };
  A.s5_dontknow = function (C) {
    var s = C.man.s;
    s.slump = 0.85; s.headDown = 0.7; s.browRaise = 0.2; s.lean = 0;
  };

  // ------------------------------------------ 7: the judgmental friend
  A.s7_arrive = function (C) {
    C.friend.s.kneel = 0.9;
    C.friend.s.lean = 0.15;
    C.friend.s.browRaise = 0.4;
    face(C.friend, C.man);
    C.man.s.headDown = 0.3;
    C.man.s.slump = 0.55;
  };
  A.s7_thanks = function (C) {
    C.man.s.headTurn = 0.3;
    C.man.s.headDown = 0.2;
    C.man.s.browRaise = 0.2;
    face(C.man, C.friend);
  };
  A.s7_ask = function (C) {
    C.friend.s.lean = 0.25;
    C.friend.s.browRaise = 0.5;
    C.friend.s.armUpR = 0.25;
    C.man.s.headTurn = 0.35;
  };
  A.s7_mean = function (C) {
    C.man.s.browRaise = 0.6;
    C.man.s.lean = 0.1;
    C.friend.s.armUpR = 0.1;
  };
  A.s7_accuse = function (C) {
    // the face hardens while the voice stays friendly
    C.friend.s.browAngle = 0.55;
    C.friend.s.point = 0.5;
    C.friend.s.lean = 0.3;
    C.man.s.slump = 0.5;
    C.man.s.headDown = 0.35;
    C.man.s.browRaise = 0.3;
  };
  A.s7_thousand = function (C) {
    C.man.s.headDown = 0.1;
    C.man.s.browAngle = 0.3;
    C.man.s.lean = 0.2;
    C.friend.s.point = 0.1;
    C.friend.s.browAngle = 0.3;
  };
  A.s7_figure = function (C) {
    C.friend.s.point = 0.4;
    C.friend.s.browAngle = 0.4;
    C.man.s.lean = 0;
    C.man.s.headDown = 0.4;
    C.man.s.slump = 0.6;
  };

  // --------------------------------------- 8: the crisis of faith
  A.s8_believed = function (C) {
    var s = C.man.s;
    s.headDown = 0.3; s.slump = 0.5; s.browRaise = 0.3; s.browAngle = 0.15;
    C.friend.s.point = 0;
    C.friend.s.browAngle = 0.1;
    C.friend.s.lean = 0.1;
  };
  A.s8_still = function (C) {
    C.friend.s.browRaise = 0.5;
    C.friend.s.lean = 0.15;
    C.man.s.headTurn = 0.25;
  };
  A.s8_broken = function (C) {
    var s = C.man.s;
    s.headTurn = -0.4;              // toward the photograph
    s.headDown = 0.2; s.browRaise = 0.4; s.slump = 0.45;
    C.friend.s.headDown = 0.15;
    C.friend.s.browAngle = 0;
  };

  // ------------------------------------------- 9: what remains
  A.s9_why = function (C) {
    C.friend.s.browRaise = 0.45;
    C.friend.s.lean = 0.2;
    C.man.s.headTurn = 0.2;
  };
  A.s9_never = function (C) {
    C.man.s.headDown = 0.1;
    C.man.s.slump = 0.35;
    C.man.s.browRaise = 0.3;
  };
  A.s9_butlost = function (C) {
    C.friend.s.browRaise = 0.4;
    C.friend.s.armUpR = 0.3;
    C.man.s.headDown = 0.25;
  };
  A.s9_know = function (C) {
    C.man.s.headDown = 0.3;
    C.man.s.browRaise = 0.25;
    C.friend.s.armUpR = 0;
  };
  A.s9_whatsleft = function (C) {
    C.friend.s.lean = 0.25;
    C.friend.s.browRaise = 0.5;
  };
  A.s9_remains = function (C) {
    // he stands and goes to the window
    var s = C.man.s;
    s.kneel = 0; s.slump = 0.25; s.headDown = 0; s.browRaise = 0.35;
    C.man.root.position.y = 0;
    C.friend.s.headTurn = -0.3;
  };
  A.s9_startover = function (C) {
    C.friend.s.browRaise = 0.45;
    C.man.s.headTurn = 0.3;
  };
  A.s9_never_again = function (C) {
    C.man.s.headDown = 0.2;
    C.man.s.slump = 0.3;
    C.man.s.browRaise = 0.2;
  };
  A.s9_whatdo = function (C) {
    C.friend.s.browRaise = 0.5;
    C.friend.s.lean = 0.2;
  };

  // -------------------------------- 10: the decision to continue
  A.s10_tomorrow = function (C) {
    // back on the couch, beside his wife, and upright for the first time
    var s = C.man.s;
    s.kneel = 0.95; s.slump = 0.1; s.headDown = 0; s.browRaise = 0.3;
    s.lean = 0.1;
    C.man.root.position.y = 0.26;
    if (C.wife.root.visible) {
      C.wife.s.kneel = 0.95;
      C.wife.s.headTurn = 0.25;
      C.wife.s.slump = 0.2;
    }
    C.friend.s.browRaise = 0.3;
    C.friend.s.lean = 0.1;
  };
  A.s10_couldnt = function (C) {
    C.friend.s.headDown = 0.2;
    C.friend.s.browRaise = 0.4;
    C.man.s.headTurn = 0.2;
  };
  A.s10_nochoice = function (C) {
    C.man.s.slump = 0.12;
    C.man.s.browRaise = 0.25;
    C.man.s.armUpL = 0.2;           // takes her hand
    if (C.wife.root.visible) C.wife.s.armUpR = 0.2;
  };

  // ------------------------------ 11: the meaning of blessings
  A.s11_blessed = function (C) {
    C.friend.s.browRaise = 0.35;
    C.friend.s.lean = 0.15;
    C.man.s.headTurn = 0.2;
  };
  A.s11_confusing = function (C) {
    C.man.s.browRaise = 0.3;
    C.man.s.slump = 0.12;
    C.man.s.headDown = 0.05;
  };
  A.s11_mean2 = function (C) {
    C.friend.s.browRaise = 0.45;
    C.friend.s.headDown = 0.1;
  };
  A.s11_favor = function (C) {
    // he looks at the bare wrist
    C.man.s.armUpL = 0.5;
    C.man.s.headDown = 0.3;
    C.man.s.browRaise = 0.2;
    C.friend.s.headDown = 0.3;      // the friend lowers his eyes
    C.friend.s.browRaise = 0.1;
  };

  // ----------------------------------- 12: a new beginning
  A.s12_walk = function (C) {
    var s = C.man.s;
    s.walk = 1; s.kneel = 0; s.slump = 0.12; s.headDown = 0;
    s.browRaise = 0.2; s.armUpL = 0; s.armUpR = 0; s.lean = 0.05;
    C.man.root.position.y = 0;
  };

  return A;
}
