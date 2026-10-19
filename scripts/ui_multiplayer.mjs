// Two-tab Chrome DevTools driver for live online-duel tests against the running Expo web app.
// Usage: node scripts/ui_multiplayer.mjs <hostEmail> <hostPassword> <guestEmail> <guestPassword> [3|5]
// (Chrome remote debugging on :9222, Expo web on :8081). Each player gets an isolated browser context,
// signs in through the app, then they play a real best-of-3 room; each designed state is captured.
import fs from 'node:fs/promises';
import { Buffer } from 'node:buffer';

const BASE = 'http://localhost:8081';
const OUT = '.ui-reconstruction/screenshots';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const [hostEmail, hostPassword, guestEmail, guestPassword, rounds = '3'] = process.argv.slice(2);
const ROUNDS = Number(rounds);
if (!guestPassword) throw new Error('Usage: node scripts/ui_multiplayer.mjs hostEmail hostPassword guestEmail guestPassword');

// Opens a tab in a fresh, isolated browser context so the two players don't share a login.
async function openTab(url) {
  const version = await (await fetch('http://localhost:9222/json/version')).json();
  const browser = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise(resolve => browser.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const call = (method, params = {}) => new Promise(resolve => {
    const mine = ++id;
    const onMessage = event => { const data = JSON.parse(event.data); if (data.id === mine) { browser.removeEventListener('message', onMessage); resolve(data.result); } };
    browser.addEventListener('message', onMessage);
    browser.send(JSON.stringify({ id: mine, method, params }));
  });
  const { browserContextId } = await call('Target.createBrowserContext', { disposeOnDetach: false });
  const { targetId } = await call('Target.createTarget', { url, browserContextId });
  browser.close();
  for (let i = 0; i < 20; i++) {
    const target = (await (await fetch('http://localhost:9222/json')).json()).find(t => t.id === targetId);
    if (target?.webSocketDebuggerUrl) return target;
    await wait(250);
  }
  throw new Error('New tab not found');
}

async function connect(target) {
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let next = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.id) { const item = pending.get(data.id); pending.delete(data.id); if (data.error) item.reject(data.error); else item.resolve(data.result); }
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description ?? data.params.exceptionDetails.text);
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') errors.push(data.params.args.map(a => a.value ?? a.description).join(' '));
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++next; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 1, mobile: false });
  // Keep timers running at full speed while the other tab is in front.
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
  const tab = {
    errors, send, evaluate,
    async goto(path) {
      await send('Page.navigate', { url: BASE + path });
      for (let i = 0; i < 90; i++) { await wait(400); if (await evaluate('!!document.querySelector(\'[data-testid="game-canvas"]\') && document.fonts.status === "loaded"')) break; }
      await tab.settle();
    },
    async settle() { for (let i = 0; i < 20; i++) { if (await evaluate('Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)')) return; await wait(250); } },
    buttons: () => evaluate('Array.from(document.querySelectorAll(\'[role="button"]\')).map(e => e.getAttribute("aria-label"))'),
    async click(label, timeout = 15000) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const clicked = await evaluate(`(() => { const e = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.getAttribute('aria-label') === ${JSON.stringify(label)} && e.getAttribute('aria-disabled') !== 'true'); if (!e) return false; e.click(); return true; })()`);
        if (clicked) { await wait(300); return; }
        await wait(200);
      }
      throw new Error(`Button not found: ${label}; visible: ${JSON.stringify(await tab.buttons())}`);
    },
    async type(label, text) {
      await evaluate(`(() => { const e = document.querySelector('[aria-label=${JSON.stringify(label)}]'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(e, ${JSON.stringify(text)}); e.dispatchEvent(new Event('input', { bubbles: true })); })()`);
      await wait(200);
    },
    text: () => evaluate('document.body.innerText'),
    async waitForText(fragment, timeout = 20000) {
      const start = Date.now();
      while (Date.now() - start < timeout) { if ((await tab.text()).includes(fragment)) return; await wait(200); }
      throw new Error(`Timed out waiting for "${fragment}"`);
    },
    async waitForButton(label, timeout = 20000) {
      const start = Date.now();
      while (Date.now() - start < timeout) { if ((await tab.buttons()).includes(label)) return; await wait(200); }
      throw new Error(`Timed out waiting for button "${label}"`);
    },
    async shot(name) {
      await tab.settle();
      const capture = await send('Page.captureScreenshot', { format: 'png' });
      await fs.writeFile(`${OUT}/${name}.png`, Buffer.from(capture.data, 'base64'));
      console.log('captured', name);
    },
    url: () => evaluate('location.pathname + location.search'),
    close: () => socket.close(),
  };
  return tab;
}

await fs.mkdir(OUT, { recursive: true });
const host = await connect(await openTab(`${BASE}/login`));
const guest = await connect(await openTab(`${BASE}/login`));
const log = (...args) => console.log(...args);

// Both players sign in through the real login screen.
for (const [tab, email, password] of [[host, hostEmail, hostPassword], [guest, guestEmail, guestPassword]]) {
  await tab.goto('/login');
  await tab.type('Email address', email);
  await tab.type('Password', password);
  await tab.click('SIGN IN');
  await tab.waitForButton('ONLINE DUEL', 20000);
}
log('both players signed in');

// Host creates a best-of-3 room through the normal flow.
// Online Duel opens the lobby directly; only the host picks the length, when creating the room.
await host.click('ONLINE DUEL');
await host.waitForButton('CREATE ROOM');
log('host after ONLINE DUEL:', await host.url());
await host.shot('mp_entry');
await host.click('CREATE ROOM');
await host.waitForButton(ROUNDS === 5 ? 'BEST OF 5' : 'BEST OF 3');
log('host after CREATE ROOM:', await host.url());
await host.click(ROUNDS === 5 ? 'BEST OF 5' : 'BEST OF 3');
await host.waitForText('Waiting for player');
const code = (await host.text()).match(/\b\d{6}\b/)?.[0];
log('room code', code);
await host.shot('mp_create');

// Guest joins with the code.
await guest.click('ONLINE DUEL');
log('guest after ONLINE DUEL:', await guest.url(), '| sees mode buttons:', (await guest.buttons()).some(b => /BEST OF/.test(b ?? '')));
await guest.click('JOIN ROOM');
await guest.type('Room code', code);
await guest.shot('mp_join_typed');
await guest.click('JOIN');
await guest.shot('mp_joining');
await guest.waitForText('Waiting for host');
await guest.shot('mp_joined');
await host.waitForButton('START MATCH');
await host.shot('mp_hosted_ready');

// Host starts; both see the entering-match dialog, then the arena.
await host.click('START MATCH');
await wait(250);
await host.shot('mp_entering_host');
await guest.shot('mp_entering_guest');
await host.waitForButton('Choose rock');
await guest.waitForButton('Choose rock');
await host.shot('mp_game_start');

// The host wins every round (rock beats scissors) until the match is decided.
for (let round = 1; round <= Math.ceil(ROUNDS / 2); round++) {
  await host.click('Choose rock');
  await host.shot(`mp_r${round}_waiting`);
  await guest.click('Choose scissors');
  await wait(2900);
  await host.shot(`mp_r${round}_reveal`);
  await wait(700);
  await host.shot(`mp_r${round}_feedback`);
  await guest.shot(`mp_r${round}_feedback_guest`);
  if (round < Math.ceil(ROUNDS / 2)) await wait(2500);
}

// Results on both devices (online results have no Next button; they advance to Rematch/Home by themselves).
// The result page shows for 4s before switching to Rematch/Home, so catch it as soon as each match ends.
await Promise.all([host.waitForButton('Share result', 20000), guest.waitForButton('Share result', 20000)]);
log('host url', await host.url(), 'guest url', await guest.url());
await host.shot('mp_victory');
await guest.shot('mp_defeat');

// Rematch request and acceptance.
await guest.waitForButton('REMATCH', 10000);
await guest.shot('mp_post_defeat');
await guest.click('REMATCH');
await host.waitForButton('Accept rematch', 15000).catch(async () => { log('host has no accept button; host buttons', await host.buttons()); });
await host.shot('mp_rematch_request');
await host.click('Accept rematch');
await host.waitForButton('Choose rock', 15000);
await guest.waitForButton('Choose rock', 15000);
log('rematch started on both tabs');
await host.shot('mp_rematch_game');

// Host quits; guest is told their friend left.
await host.click('Pause game');
await host.click('QUIT MATCH');
await host.click('YES,EXIT');
await guest.waitForText('LEFT', 15000);
await guest.shot('mp_friend_left');

log(JSON.stringify({ code, hostErrors: host.errors, guestErrors: guest.errors }, null, 1));
host.close(); guest.close();
