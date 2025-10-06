import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

// Absolute root of the project resolved at runtime
const projectRoot = path.resolve(process.cwd());
const baseDir = path.join(projectRoot, 'media-assets', 'scripts');

const mimeByExt: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

export const GET: RequestHandler = async ({ params }) => {
  try {
    const reqPath = params.path || '';
    const safePath = path.normalize(reqPath).replace(/^\/+/, '');
    const filePath = path.join(baseDir, safePath);

    // Security: ensure resolved path stays within baseDir
    if (!filePath.startsWith(baseDir)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return new Response('Not found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = mimeByExt[ext] || 'application/octet-stream';
    const data = fs.readFileSync(filePath);
    return new Response(data, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return new Response('Internal Server Error', { status: 500 });
  }
};





