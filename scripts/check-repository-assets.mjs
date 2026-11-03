import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
  .split('\0').filter(Boolean);
const asset = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|pdf|mp4|mkv|mov|m4a|mp3|wav|flac|zip|7z|tar|gz|docx?|xlsx?|pptx?|woff2?|ttf)$/i;
const errors = [];
let images = 0;

for (const file of files) {
  if (file.startsWith('docs/public/images/') || asset.test(file)) {
    errors.push(`Tracked resource: ${file}`);
  }
  if (!file.startsWith('docs/') || !file.endsWith('.md')) continue;
  const text = readFileSync(resolve(root, file), 'utf8');
  const urls = [
    ...[...text.matchAll(/!\[[^\]]*\]\(\s*<?([^\s)>]+)>?(?:\s+[^)]*)?\)/g)].map(m => m[1]),
    ...[...text.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m => m[1]),
  ];
  for (const url of urls) {
    images += 1;
    if (!url.startsWith('https://learn.luovista.com/')) {
      errors.push(`Image must use R2: ${file}: ${url}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Asset check passed: no tracked resources; ${images} image references use R2.`);
}
