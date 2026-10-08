import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const processes = [
  {
    name: 'web',
    command: process.execPath,
    args: ['node_modules/vite/bin/vite.js', '--port=3000', '--host=0.0.0.0'],
    cwd: root,
  },
  {
    name: 'api',
    command: npm,
    args: ['run', 'dev'],
    cwd: path.join(root, 'server'),
    shell: true,
  },
];

const children = [];
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null || child.signalCode) continue;
    if (process.platform === 'win32' && child.pid) {
      spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
  }
  setTimeout(() => process.exit(code), 300);
}

function pipe(stream, label) {
  let pending = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    pending += chunk;
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? '';
    for (const line of lines) process.stdout.write(`[${label}] ${line}\n`);
  });
}

console.log('Storefront  http://localhost:3000');
console.log('Admin       http://localhost:3000/admin');
console.log('API         http://localhost:4000');

for (const entry of processes) {
  const child = entry.shell
    ? spawn([entry.command, ...entry.args].join(' '), {
        cwd: entry.cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      })
    : spawn(entry.command, entry.args, {
        cwd: entry.cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
  children.push(child);
  if (child.stdout) pipe(child.stdout, entry.name);
  if (child.stderr) pipe(child.stderr, entry.name);
  child.on('exit', (code, signal) => {
    if (stopping || signal) return;
    if (code && code !== 0) {
      console.error(`[${entry.name}] exited with code ${code}`);
      stop(code);
    }
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
