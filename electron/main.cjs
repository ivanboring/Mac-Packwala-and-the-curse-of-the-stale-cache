// Desktop build: the same static dist/ the website uses, in its own window.
// It is served from app://game/ rather than file://, because the game fetch()es its audio
// manifest (file:// can't be fetched), music streams with byte ranges, and the saves in
// localStorage need an origin that stays the same from one launch to the next.
const { app, BrowserWindow, Menu, protocol, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'dist');
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.mp3': 'audio/mpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
};

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

/** A file from dist/, with Range support so <audio> can stream and loop the music. */
function serve(request) {
  const url = new URL(request.url);
  const file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return new Response('Not found', { status: 404 });
  const size = fs.statSync(file).size;
  const type = TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
  const range = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') ?? '');
  if (!range) {
    return new Response(fs.readFileSync(file), { headers: { 'Content-Type': type, 'Content-Length': String(size), 'Accept-Ranges': 'bytes' } });
  }
  const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  const fd = fs.openSync(file, 'r');
  const body = Buffer.alloc(end - start + 1);
  fs.readSync(fd, body, 0, body.length, start);
  fs.closeSync(fd);
  return new Response(body, {
    status: 206,
    headers: { 'Content-Type': type, 'Content-Length': String(body.length), 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes' },
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
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  // links (workflows-of-ai.com) open in the real browser, not inside the game
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('app://')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); }
  });
  win.loadURL('app://game/index.html');
  return win;
}

app.whenReady().then(() => {
  protocol.handle('app', serve);
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
  const win = createWindow();
  // `electron . --smoke`: load the game, check the audio manifest and a ranged music request, quit
  if (process.argv.includes('--smoke')) {
    win.webContents.once('did-finish-load', async () => {
      const result = await win.webContents.executeJavaScript(`(async () => {
        const m = await (await fetch('audio/manifest.json')).json();
        const r = await fetch('audio/music/' + m.music[0] + '.mp3', { headers: { Range: 'bytes=0-99' } });
        return { voices: m.voices.length, music: m.music.length, status: r.status, bytes: (await r.arrayBuffer()).byteLength, game: !!window.mz };
      })()`);
      console.log('SMOKE', JSON.stringify(result));
      app.quit();
    });
  }
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
