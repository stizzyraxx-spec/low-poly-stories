const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const W=1280,H=720,FPS=30;
const FROM=+process.env.FROM, TO=+process.env.TO, OUT=process.env.OUT;
const PAGE=path.resolve(process.env.PAGE);
const first=Math.round(FROM*FPS), last=Math.round(TO*FPS);
const frameFile=f=>path.join(OUT,'f'+String(f).padStart(6,'0')+'.jpg');

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  let f=first;
  while(f<=last){
    // skip frames already on disk (resume after a crash)
    while(f<=last && fs.existsSync(frameFile(f))) f++;
    if(f>last) break;
    let browser;
    try{
      browser=await chromium.launch({channel:'chrome',args:[
        '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',
        '--disable-dev-shm-usage','--no-sandbox','--hide-scrollbars',
        '--force-device-scale-factor=1','--disable-gpu-shader-disk-cache',
        '--disable-background-networking','--disable-sync','--disable-features=GCM']});
      const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
      await page.goto('file://'+PAGE,{waitUntil:'load'});
      await page.waitForFunction('window.__filmReady === true',{timeout:120000});
      await page.evaluate(()=>document.fonts.ready).catch(()=>{});
      await page.waitForTimeout(400);
      await page.evaluate('window.__film.reset()');
      if(f>0) await page.evaluate(`window.__film.seekTo(${f/FPS})`);
      const t0=Date.now(), startF=f;
      for(; f<=last; f++){
        const d=await page.evaluate(`window.__film.grab(${f/FPS})`);
        fs.writeFileSync(frameFile(f),Buffer.from(d.slice(d.indexOf(',')+1),'base64'));
        if((f-startF)%200===0&&f>startF){
          const done=f-startF, el=(Date.now()-t0)/1000;
          console.log(`  ${f}/${last} ${(done/el).toFixed(2)}fps`);
        }
      }
    }catch(e){
      console.log('RESTART at frame',f,'-',String(e.message).split('\n')[0]);
    }finally{ try{await browser?.close()}catch(_){} }
  }
  console.log('SHARD DONE', first,'-',last);
})();
