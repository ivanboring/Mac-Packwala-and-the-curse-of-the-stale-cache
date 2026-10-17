// Full screen on/off, with the webkit-prefixed fallback for older Safari.
// Must be called from a user gesture (key press or click).
type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void; webkitFullscreenEnabled?: boolean };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };

const doc = document as FsDoc;

export function fullscreenSupported(): boolean {
  return !!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled);
}

export function isFullscreen(): boolean {
  return !!(doc.fullscreenElement || doc.webkitFullscreenElement);
}

export async function setFullscreen(on: boolean): Promise<void> {
  try {
    if (on && !isFullscreen()) {
      const el = document.documentElement as FsEl;
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else el.webkitRequestFullscreen?.();
      // Phones: turn the game sideways where the browser allows it (Android Chrome, in full screen only).
      const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      await o?.lock?.('landscape').catch(() => {});
    } else if (!on && isFullscreen()) {
      if (doc.exitFullscreen) await doc.exitFullscreen();
      else doc.webkitExitFullscreen?.();
    }
  } catch {
    // Refused (e.g. an iframe without allow="fullscreen"): stay windowed.
  }
}

export function toggleFullscreen(): Promise<void> {
  return setFullscreen(!isFullscreen());
}

export function onFullscreenChange(fn: () => void) {
  document.addEventListener('fullscreenchange', fn);
  document.addEventListener('webkitfullscreenchange', fn);
}
