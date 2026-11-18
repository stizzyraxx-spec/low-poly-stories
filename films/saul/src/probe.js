const { chromium } = require('playwright');
const fs=require('fs'), path=require('path');
const TIMES=[14.0, 25.0, 44.5, 50.0, 60.0, 77.0, 92.0, 113.0, 132.0, 150.0, 165.0, 195.0];
(async()=>{
  const b=await chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox','--hide-scrollbars','--force-device-scale-factor=1']});
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
