const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const W = +(process.env.W || 1280);
const H = +(process.env.H || 720);
const FPS = +(process.env.FPS || 30);
const FROM = +(process.env.FROM || 0);
const TO = process.env.TO ? +process.env.TO : null;
const OUT = process.env.OUT || 'frames';
const PAGE = process.env.PAGE || 'render-mode.html';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    channel: 'chrome',
    args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',
           '--disable-dev-shm-usage','--no-sandbox','--hide-scrollbars',
           '--force-device-scale-factor=1']
  });
  const page = await browser.newPage({ viewport:{width:W,height:H}, deviceScaleFactor:1 });
  page.on('pageerror', e => console.error('PAGE ERROR:', e.message));

  await page.goto('file://' + path.resolve(PAGE), { waitUntil:'load' });
  await page.waitForFunction('window.__filmReady === true', { timeout:60000 });
  await page.evaluate(() => document.fonts.ready).catch(()=>{});
  await page.waitForTimeout(500);

  const duration = await page.evaluate('window.__film.duration');
  const end = TO === null ? duration : Math.min(TO, duration);
  const first = Math.round(FROM * FPS), last = Math.round(end * FPS);
  console.log(`frames ${first}..${last} @ ${W}x${H} ${FPS}fps  (film ${duration.toFixed(2)}s)`);

  await page.evaluate('window.__film.reset()');
  if (FROM > 0) await page.evaluate(`window.__film.seekTo(${FROM})`);

  const t0 = Date.now();
  for (let f = first; f <= last; f++) {
    const dataUrl = await page.evaluate(`window.__film.grab(${f / FPS})`);
    const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    fs.writeFileSync(path.join(OUT, 'f' + String(f).padStart(6,'0') + '.jpg'),
                     Buffer.from(b64, 'base64'));
    if ((f - first) % 120 === 0 && f > first) {
      const done = f - first + 1, total = last - first + 1;
      const el = (Date.now() - t0)/1000, rate = done/el;
      console.log(`  ${done}/${total}  ${rate.toFixed(1)}fps  eta ${((total-done)/rate/60).toFixed(1)}min`);
    }
  }
  console.log(`done ${((Date.now()-t0)/1000).toFixed(1)}s`);
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
