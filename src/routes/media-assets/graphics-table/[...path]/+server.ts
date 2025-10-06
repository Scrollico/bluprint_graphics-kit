import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

// Serve static files from media-assets/graphics-table so canvas JSON can be fetched client-side
export async function GET({ params }) {
  const rel = params.path as string | string[];
  const segments = Array.isArray(rel) ? rel : [rel];
  const safe = segments.join('/');
  const baseDir = path.resolve(process.cwd(), 'media-assets/graphics-table');
  const filePath = path.resolve(baseDir, safe);
  if (!filePath.startsWith(baseDir)) throw error(403, 'Forbidden');
  try {
    const data = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === '.json' ? 'application/json' : ext === '.csv' ? 'text/csv' : 'application/octet-stream';
    return new Response(data, {
      headers: {
        'content-type': type,
        'cache-control': 'public, max-age=3600'
      }
    });
  } catch {
    throw error(404, 'Not found');
  }
}


