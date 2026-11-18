const { chromium } = require('playwright');
const path=require('path');
(async()=>{
  const b=await chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  p.on('pageerror',e=>console.log('PAGEERROR:\n'+(e.stack||e.message)));
  p.on('console',m=>{ if(m.type()==='error') console.log('CONSOLE:',m.text()); });
  await p.goto('file://'+path.resolve('render-mode.html'),{waitUntil:'load'});
  await p.waitForTimeout(3000);
  await b.close();
})();
