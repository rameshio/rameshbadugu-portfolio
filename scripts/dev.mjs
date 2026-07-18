import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = join(root, 'node_modules', 'vite', 'bin', 'vite.js');

const processes = [
  spawn(process.execPath, [join(root, 'server', 'index.js')], {
    cwd: root,
    env: { ...process.env, CONTACT_DELIVERY_MODE: process.env.CONTACT_DELIVERY_MODE || 'console' },
    stdio: 'inherit',
  }),
  spawn(process.execPath, [vite], { cwd: root, stdio: 'inherit' }),
];

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of processes) child.kill();
  process.exitCode = code;
}

for (const child of processes) {
  child.on('exit', (code, signal) => {
    if (!shuttingDown && code && signal !== 'SIGTERM') shutdown(code);
  });
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
