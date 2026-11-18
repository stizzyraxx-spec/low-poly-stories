const { chromium } = require('playwright');
const path=require('path');
(async()=>{
  const b=await chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+path.resolve('render-mode.html'),{waitUntil:'load'});
  await p.waitForFunction('window.__filmReady === true',{timeout:120000});
  for(const t of (process.env.TIMES||'10').split(',').map(Number)){
    const r=await p.evaluate(`(()=>{window.__film.peek(${t});return window.__dbg();})()`);
    console.log(t+'s cam',JSON.stringify(r.cam),'inFrustum',JSON.stringify(r.inFrustum));
  }
  await b.close();
})();
