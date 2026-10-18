// Desktop build: the same static dist/ the website uses, in its own window.
// It is served from app://game/ rather than file://, because the game fetch()es its audio
// manifest (file:// can't be fetched), music streams with byte ranges, and the saves in
// localStorage need an origin that stays the same from one launch to the next.
const { app, BrowserWindow, Menu, protocol, session, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { Readable } = require('node:stream');

const HOST = 'game';
const ORIGIN = `app://${HOST}`;
const ROOT = fs.realpathSync(path.join(__dirname, '..', 'dist'));
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.mp3': 'audio/mpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
};
// The game is one script, one inline <style>, a canvas, fetch()ed JSON and <audio>. Nothing else may load.
const CSP = [
  "default-src 'none'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data:",
  "media-src 'self'", "connect-src 'self'", "base-uri 'none'", "form-action 'none'", "frame-ancestors 'none'",
].join('; ');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

const text = (status, body, headers = {}) => new Response(body, { status, headers: { 'Content-Type': 'text/plain', ...headers } });

/** The real path of a file inside dist/ for this URL, or null. Symlinks that lead out of dist/ don't count. */
function resolve(url) {
  if (url.protocol !== 'app:' || url.host !== HOST) return null;
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { return null; }
  if (rel.includes('\0')) return null;
  if (rel === '/') rel = '/index.html';
  let file;
  try { file = fs.realpathSync(path.join(ROOT, rel)); } catch { return null; }
  const inside = path.relative(ROOT, file);
  if (!inside || inside === '..' || inside.startsWith(`..${path.sep}`) || path.isAbsolute(inside)) return null;
  return fs.statSync(file).isFile() ? file : null;
}

/** A file from dist/, with Range support so <audio> can stream and loop the music. */
function serve(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return text(405, 'Method not allowed');
  let url;
  try { url = new URL(request.url); } catch { return text(400, 'Bad request'); }
  const file = resolve(url);
  if (!file) return text(404, 'Not found');
  const size = fs.statSync(file).size;
  const headers = {
    'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
  };
  const body = (start, end) => (request.method === 'HEAD' || size === 0 ? null : Readable.toWeb(fs.createReadStream(file, { start, end })));
  const header = request.headers.get('range');
  if (!header) return new Response(body(0, size - 1), { headers: { ...headers, 'Content-Length': String(size) } });

  // one range only, as <audio> asks for: bytes=a-b, bytes=a- or bytes=-n
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  let start = NaN, end = NaN;
  if (m && (m[1] || m[2])) {
    if (m[1]) { start = Number(m[1]); end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1; }
    else { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
    return text(416, 'Range not satisfiable', { 'Content-Range': `bytes */${size}` });
  }
  return new Response(body(start, end), {
    status: 206,
    headers: { ...headers, 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${size}` },
  });
}

// The only places the game links to.
const LINKS = ['https://github.com/ivanboring/Mac-Packwala-and-the-curse-of-the-stale-cache', 'https://workflows-of-ai.com'];
function isExternalLink(url) {
  let u;
  try { u = new URL(url); } catch { return false; }
  return u.protocol === 'https:' && LINKS.some((l) => {
    const base = new URL(l);
    const path = base.pathname.replace(/\/$/, '');
    return u.origin === base.origin && (u.pathname === path || u.pathname.startsWith(`${path}/`) || (!path && u.pathname === '/'));
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 640,
    minHeight: 420,
    backgroundColor: '#0a0c10',
    show: !process.argv.includes('--smoke'),
    title: 'Mac Packwala and the Curse of the Stale Cache',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, webviewTag: false },
  });
  // the game never leaves its own page; About's links (downloads, source code) open in the browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalLink(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.on('will-redirect', (e) => e.preventDefault());
  win.loadURL(`${ORIGIN}/index.html`);
  return win;
}

app.whenReady().then(() => {
  protocol.handle('app', serve);
  // no camera, microphone, notifications, geolocation...: nothing to ask for
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => callback(permission === 'fullscreen'));
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => permission === 'fullscreen');
  app.on('web-contents-created', (_e, contents) => contents.on('will-attach-webview', (ev) => ev.preventDefault()));
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
  const win = createWindow();
  // `electron . --smoke`: load the game, check the audio manifest and a ranged music request, quit
  if (process.argv.includes('--smoke')) {
    win.webContents.once('did-finish-load', async () => {
      const result = await win.webContents.executeJavaScript(`(async () => {
        const m = await (await fetch('audio/manifest.json')).json();
        const r = await fetch('audio/music/' + m.music[0] + '.mp3', { headers: { Range: 'bytes=0-99' } });
        const bad = await fetch('audio/manifest.json', { headers: { Range: 'bytes=999999999-' } });
        const out = await fetch('..%2fpackage.json');
        const blocked = [];
        addEventListener('securitypolicyviolation', (e) => blocked.push(e.violatedDirective + ' ' + e.blockedURI));
        window.mz.newGame();
        await new Promise((r) => setTimeout(r, 3000));
        return { voices: m.voices.length, music: m.music.length, status: r.status, bytes: (await r.arrayBuffer()).byteLength,
          badRange: bad.status, escape: out.status, csp: blocked };
      })()`);
      console.log('SMOKE', JSON.stringify(result), 'sandboxed=' + !app.commandLine.hasSwitch('no-sandbox'));
      app.quit();
    });
  }
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
