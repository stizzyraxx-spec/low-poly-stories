// Verify through the REAL transport path (advanceTo), not peek: peek resets
// beatIdx and re-arms subIdx differently, so it cannot confirm a subcut fix.
const { chromium } = require('playwright');
const path=require('path');
(async()=>{
  const b=await chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+path.resolve('render-mode.html'),{waitUntil:'load'});
  await p.waitForFunction('window.__filmReady === true',{timeout:120000});
  await p.evaluate('window.__film.reset()');
  for(const t of [150,165,180,190]){
    const r=await p.evaluate(`(()=>{window.__film.seekTo(${t});return window.__dbg();})()`);
    console.log(t+'s cam',JSON.stringify(r.cam),'inFrustum',JSON.stringify(r.inFrustum),'crowd',r.crowdInFrustum);
  }
  await b.close();
})();
