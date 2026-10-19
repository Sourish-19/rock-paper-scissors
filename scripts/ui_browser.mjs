// Local Chrome DevTools driver. Captures the real Expo web app without a browser dependency.
import fs from 'node:fs/promises';
import { Buffer } from 'node:buffer';
const targets = await (await fetch('http://localhost:9222/json')).json();
const target = targets.find(t => t.type === 'page');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open',resolve,{once:true}));
let next = 0;
const pending = new Map();
const errors = [];
socket.addEventListener('message',event => {
  const data = JSON.parse(event.data);
  if(data.id) { const item = pending.get(data.id); pending.delete(data.id); if(data.error) item.reject(data.error); else item.resolve(data.result); }
  if(data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails);
});
const send = (method,params={}) => new Promise((resolve,reject) => { const id=++next; pending.set(id,{resolve,reject}); socket.send(JSON.stringify({id,method,params})); });
const wait = ms => new Promise(resolve => setTimeout(resolve,ms));
await send('Runtime.enable'); await send('Page.enable');
// Deliver focus/blur events even though the automated tab has no OS window focus.
await send('Emulation.setFocusEmulationEnabled',{enabled:true});
const [action='capture',arg='/home',name='home',width='393',height='852',scale='1'] = process.argv.slice(2);
await send('Emulation.setDeviceMetricsOverride',{width:Number(width),height:Number(height),deviceScaleFactor:Number(scale),mobile:false});
await fs.mkdir('.ui-reconstruction/screenshots',{recursive:true});
const imagesReadyExpr = 'Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)';
const settleImages = async () => { for(let i=0;i<20;i++){ const r=await send('Runtime.evaluate',{expression:imagesReadyExpr,returnByValue:true}); if(r.result.value)return; await wait(250); } };
if(action==='capture') {
  await send('Page.navigate',{url:`http://localhost:8081${arg}`});
  for(let i=0;i<90;i++) {
    await wait(500);
    const ready=await send('Runtime.evaluate',{expression:'!!document.querySelector(\'[data-testid="game-canvas"]\') && document.fonts.status === "loaded"',returnByValue:true});
    if(ready.result.value)break;
  }
  await settleImages(); await wait(500);
} else if(action==='click') {
  const result = await send('Runtime.evaluate',{expression:`(()=>{ const e=Array.from(document.querySelectorAll('[role="button"]')).find(e=>e.getAttribute('aria-label')===${JSON.stringify(arg)});if(!e)return false;e.click();return true;})()`,returnByValue:true});
  console.log('clicked',result.result.value); await wait(350); await settleImages();
} else if(action==='eval') {
  const result=await send('Runtime.evaluate',{expression:arg,returnByValue:true,awaitPromise:true}); console.log(JSON.stringify(result));
} else if(action==='keys') {
  // Real keyboard input into the focused element: plain text is typed; {Left} {Right} {Backspace} {Home} {End} are keys.
  const named={Left:['ArrowLeft',37],Right:['ArrowRight',39],Backspace:['Backspace',8],Home:['Home',36],End:['End',35]};
  for(const part of arg.split(/(\{[A-Za-z]+\})/).filter(Boolean)){
    const key=part.match(/^\{([A-Za-z]+)\}$/);
    if(key&&named[key[1]]){ const [code,kc]=named[key[1]]; for(const type of ['keyDown','keyUp']) await send('Input.dispatchKeyEvent',{type,key:code,code,windowsVirtualKeyCode:kc}); }
    else await send('Input.insertText',{text:part});
    await wait(60);
  }
  await wait(250);
} else if(action==='wait') await wait(Number(arg));
const capture=await send('Page.captureScreenshot',{format:'png'});
await fs.writeFile(`.ui-reconstruction/screenshots/${name}.png`,Buffer.from(capture.data,'base64'));
const state=await send('Runtime.evaluate',{expression:'({url:location.pathname,text:document.body.innerText,buttons:Array.from(document.querySelectorAll(\'[role="button"]\')).map(e=>e.getAttribute("aria-label"))})',returnByValue:true});
console.log(JSON.stringify({state:state.result.value,errors}));
socket.close();
