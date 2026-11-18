const { chromium } = require('playwright');
const path=require('path');
(async()=>{
  const b=await chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+path.resolve('render-mode.html'),{waitUntil:'load'});
  await p.waitForFunction('window.__filmReady === true',{timeout:120000});
  const r=await p.evaluate(()=>{
    window.__film.peek(10);
    const out={sets:{},sceneChildren:scene.children.length};
    for(const k in SETS) out.sets[k]={visible:SETS[k].visible,kids:SETS[k].children.length};
    return out;
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
