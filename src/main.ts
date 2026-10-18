import { BrowserGame } from './engine/game';
import { content } from './content/index';
import { fullscreenSupported, setFullscreen } from './engine/fullscreen';
import { initAnalytics } from './engine/analytics';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
new BrowserGame(canvas, content);
initAnalytics();

// "Turn your phone sideways" overlay (shown by CSS on touch screens in portrait).
const SKIP_KEY = 'mac-zakpackin:rotate-skipped'; // old name kept, like the save prefix
try { if (sessionStorage.getItem(SKIP_KEY)) document.body.classList.add('rotate-dismissed'); } catch { /* no storage */ }
const fsBtn = document.getElementById('rotate-fs') as HTMLButtonElement;
fsBtn.hidden = !fullscreenSupported();
fsBtn.addEventListener('click', () => setFullscreen(true));
document.getElementById('rotate-skip')!.addEventListener('click', () => {
  document.body.classList.add('rotate-dismissed');
  try { sessionStorage.setItem(SKIP_KEY, '1'); } catch { /* no storage */ }
});
