// electron-builder afterPack hook. Linux only: put a launcher in front of the real binary that keeps
// Chromium's OS sandbox on wherever the system allows it.
//
// Chromium sandboxes renderers with unprivileged user namespaces. Ubuntu 23.10+ blocks those for apps
// without an AppArmor profile, and an AppImage can't carry the setuid helper that is the other way in,
// so there Electron refuses to start. This check has to happen before Electron starts (main.cjs runs too
// late), so the launcher only adds --no-sandbox on systems where the sandbox can't work.
const fs = require('node:fs');
const path = require('node:path');

exports.default = async function afterPack({ electronPlatformName, appOutDir, packager }) {
  if (electronPlatformName !== 'linux') return;
  const name = packager.executableName;
  const bin = path.join(appOutDir, name);
  fs.renameSync(bin, `${bin}.bin`);
  fs.writeFileSync(bin, `#!/bin/sh
here="$(dirname "$(readlink -f "$0")")"
if unshare --user --map-root-user true 2>/dev/null; then
  exec "$here/${name}.bin" "$@"
fi
echo "${name}: this system blocks unprivileged user namespaces, so Chromium's sandbox can't start; running without it." >&2
exec "$here/${name}.bin" --no-sandbox "$@"
`, { mode: 0o755 });
};
