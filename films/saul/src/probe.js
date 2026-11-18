// Grab one representative frame per scene. Times must be ascending: grab()
// advances the transport forward, so walking the list in order costs one
// pass through the film instead of one pass per sample.
const { chromium } = require('playwright');
const fs=require('fs'), path=require('path');
const TIMES=(process.env.TIMES||'14,25,44.5,50,60,77,92,113,132,150,165,195')
  .split(',').map(Number);
(async()=>{
  const b=await chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox','--hide-scrollbars',
    '--force-device-scale-factor=1']});
  const p=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
  p.on('pageerror',e=>console.log('PAGE ERROR:',e.message));
  await p.goto('file://'+path.resolve('render-mode.html'),{waitUntil:'load'});
  await p.waitForFunction('window.__filmReady === true',{timeout:120000});
  await p.waitForTimeout(400);
  const out=process.env.OUT; fs.mkdirSync(out,{recursive:true});
  for(const t of TIMES){
    const d=await p.evaluate(`window.__film.grab(${t})`);
    fs.writeFileSync(path.join(out,'t'+String(Math.round(t)).padStart(3,'0')+'.jpg'),
      Buffer.from(d.slice(d.indexOf(',')+1),'base64'));
    console.log('grabbed',t);
  }
  await b.close();
})();
