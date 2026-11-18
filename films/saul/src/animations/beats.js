// animations/beats.js — the shot list.
//
// One entry per spoken line. `t` and `d` are written by retime.py straight
// from aligned.json, so they are MEASURED speech onsets; everything else here
// is direction and is preserved across retimes.
//
//   sc    which scene (selects the set and who is on stage)
//   cam   a key in SHOTS
//   mood  a key in MOODS
//   who   which character speaks (drives the jaw envelope)
//   act   a named action applied to the cast when the beat starts
//
// Scene boundaries follow storyboard.md and always fall on a line onset.

var BEATS = [
  // ---- scene 1: the persecution in Jerusalem ----
  { t:0.00,   d:8.38,  sc:1, who:"saul",  cam:"jAerial",  mood:"jerus",     act:"s1_order" },
  { t:8.38,   d:4.93,  sc:1, who:"chris", cam:"jFearCU",  mood:"jerus",     act:"s1_plead" },
  { t:13.30,  d:7.58,  sc:1, who:"saul",  cam:"jSaulCU",  mood:"jerusHard", act:"s1_rage" },

  // ---- scene 2: leaving for Damascus ----
  { t:20.88,  d:2.85,  sc:2, who:"comp1", cam:"rCompCU",  mood:"road",      act:"s2_ask" },
  { t:23.74,  d:10.52, sc:2, who:"saul",  cam:"rFollow",  mood:"road",      act:"s2_march" },
  { t:34.26,  d:3.76,  sc:2, who:"comp1", cam:"rSide",    mood:"road",      act:"s2_bless" },

  // ---- scene 3: the blinding light ----
  { t:38.02,  d:5.29,  sc:3, who:"saul",  cam:"lWide",    mood:"holyRise",  act:"s3_shield" },
  { t:43.31,  d:3.15,  sc:3, who:"jesus", cam:"lOrbit",   mood:"holyFull",  act:"s3_fall" },
  { t:46.46,  d:1.12,  sc:3, who:"saul",  cam:"lFallenCU",mood:"holyFull",  act:"s3_ask" },
  { t:47.58,  d:4.17,  sc:3, who:"jesus", cam:"lUp",      mood:"holyVoice", act:"s3_declare" },
  { t:51.74,  d:1.94,  sc:3, who:"saul",  cam:"lBlowout", mood:"holyVoice", act:"s3_disbelief" },
  { t:53.68,  d:4.77,  sc:3, who:"jesus", cam:"lOrbitTight",mood:"holyFull",act:"s3_command" },

  // ---- scene 4: blindness ----
  { t:58.45,  d:3.64,  sc:4, who:"saul",  cam:"bSubj",    mood:"fade",      act:"s4_blind" },
  { t:62.09,  d:2.18,  sc:4, who:"comp1", cam:"bReach",   mood:"led",       act:"s4_concern" },
  { t:64.27,  d:6.15,  sc:4, who:"saul",  cam:"bReachCU", mood:"led",       act:"s4_grope" },
  { t:70.42,  d:2.47,  sc:4, who:"comp1", cam:"bLead",    mood:"led",       act:"s4_lead" },

  // ---- scene 5: three days in darkness ----
  { t:72.88,  d:9.24,  sc:5, who:"saul",  cam:"dRoom",    mood:"dark",      act:"s5_pray" },

  // ---- scene 6: Ananias receives the vision ----
  { t:82.13,  d:1.11,  sc:6, who:"jesus", cam:"aCU",      mood:"vision",    act:"s6_called" },
  { t:83.24,  d:0.91,  sc:6, who:"anan",  cam:"aCUtight", mood:"vision",    act:"s6_answer" },
  { t:84.15,  d:6.56,  sc:6, who:"jesus", cam:"aRoom",    mood:"vision",    act:"s6_instruct" },
  { t:90.71,  d:7.75,  sc:6, who:"anan",  cam:"aCU",      mood:"vision",    act:"s6_protest" },
  { t:98.46,  d:7.83,  sc:6, who:"jesus", cam:"aHands",   mood:"vision",    act:"s6_chosen" },
  { t:106.29, d:2.46,  sc:6, who:"anan",  cam:"aLeave",   mood:"vision",    act:"s6_obey" },

  // ---- scene 7: sight restored, and baptism ----
  { t:108.75, d:1.35,  sc:7, who:"anan",  cam:"hDoor",    mood:"roomCold",  act:"s7_enter" },
  { t:110.10, d:1.66,  sc:7, who:"saul",  cam:"hSaulCU",  mood:"roomCold",  act:"s7_who" },
  { t:111.76, d:12.50, sc:7, who:"anan",  cam:"hTwo",     mood:"roomCold",  act:"s7_explain" },
  { t:124.26, d:3.29,  sc:7, who:"saul",  cam:"hSaulCU",  mood:"roomCold",  act:"s7_evenme" },
  { t:127.55, d:2.13,  sc:7, who:"anan",  cam:"hHands",   mood:"roomWarm",  act:"s7_layhands" },
  { t:129.68, d:5.35,  sc:7, who:"saul",  cam:"hEyes",    mood:"roomWarm",  act:"s7_see" },
  { t:135.03, d:2.65,  sc:7, who:"anan",  cam:"hBaptism", mood:"roomWarm",  act:"s7_baptize" },
  { t:137.68, d:6.07,  sc:7, who:"saul",  cam:"hTwo",     mood:"roomWarm",  act:"s7_reflect" },
  { t:143.75, d:2.07,  sc:7, who:"anan",  cam:"hAnanCU",  mood:"roomWarm",  act:"s7_whatnow" },

  // ---- scene 8: preaching in Damascus ----
  { t:145.82, d:5.28,  sc:8, who:"saul",  cam:"pSaul",    mood:"court",     act:"s8_declare" },
  { t:151.10, d:3.96,  sc:8, who:"citA",  cam:"pCrowdA",  mood:"court",     act:"s8_recognise" },
  { t:155.06, d:6.57,  sc:8, who:"citB",  cam:"pCrowdB",  mood:"court",     act:"s8_accuse" },
  { t:161.64, d:13.80, sc:8, who:"saul",  cam:"pSaulCU",  mood:"court",     act:"s8_testify" },
  { t:175.44, d:1.34,  sc:8, who:"citA",  cam:"pOver",    mood:"court",     act:"s8_andnow" },
  { t:176.78, d:7.06,  sc:8, who:"saul",  cam:"pSaulHero",mood:"court",     act:"s8_proclaim" },
  { t:183.84, d:2.78,  sc:8, who:"citB",  cam:"pCrowdB",  mood:"court",     act:"s8_evenafter" },
  { t:186.62, d:6.03,  sc:8, who:"saul",  cam:"pGrow",    mood:"court",     act:"s8_mercy" },

  // ---- scene 9: the road out ----
  { t:192.64, d:6.33,  sc:9, who:"narr",  cam:"fPullUp",  mood:"sunrise",   act:"s9_walk" }
];

// Mid-beat camera changes: scene 8's long testimony (13.8s) and scene 3's
// orbit need to move inside a single line, which the brief asks for. Each
// entry re-aims the camera at an absolute time without touching the beat.
var SUBCUTS = [
  { t:40.60,  cam:"lOrbit"     },  // the light rises: start the orbit early
  { t:55.90,  cam:"lFallen"    },  // back out to see him on the ground
  { t:60.90,  cam:"bHands"     },  // his hands, searching
  { t:76.40,  cam:"dPray"      },  // push in on the praying figure
  { t:79.60,  cam:"dPrayCU"    },
  { t:87.20,  cam:"aCU"        },
  { t:94.60,  cam:"aCUtight"   },  // the protest, close
  { t:102.10, cam:"aCU"        },
  { t:116.40, cam:"hAnanCU"    },  // Ananias explaining, close
  { t:120.60, cam:"hSaulCU"    },  // Saul listening to it
  { t:131.90, cam:"hTwo"       },  // he sees the man in front of him
  { t:140.20, cam:"hSaulCU"    },
  { t:165.30, cam:"pOver"      },  // the testimony, from the crowd
  { t:168.90, cam:"pCrowdA"    },  // a face in that crowd
  { t:171.40, cam:"pSaulCU"    },
  { t:179.80, cam:"pWide"      },  // the audience has grown
  { t:189.40, cam:"pSaulHero"  },
  { t:195.80, cam:"fRoad"      }   // last look at him on the road
];
