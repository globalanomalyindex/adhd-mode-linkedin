#!/usr/bin/env node

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const portFlag = process.argv.indexOf('--port');
const port = Number(
  portFlag >= 0 ? process.argv[portFlag + 1] : process.env.PORT || 4173,
);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

function resolveRequest(url) {
  const pathname = decodeURIComponent(
    new URL(url, 'http://localhost').pathname,
  );
  const candidate = resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return null;

  try {
    const stats = statSync(candidate);
    return stats.isDirectory() ? join(candidate, 'index.html') : candidate;
  } catch {
    return null;
  }
}

const server = createServer((request, response) => {
  const file = resolveRequest(request.url || '/');
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'cache-control': 'no-store',
    'content-type':
      contentTypes[extname(file).toLowerCase()] || 'application/octet-stream',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(file).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static server listening at http://127.0.0.1:${port}`);
});
