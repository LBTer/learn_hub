import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
loadEnv({ path: join(projectRoot, ".env"), quiet: true });

const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

const CONTENT_TYPES = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const targets = args.filter((arg) => !arg.startsWith("--"));
const concurrencyArg = [...flags].find((flag) => flag.startsWith("--concurrency="));
const concurrency = Number(concurrencyArg?.split("=")[1] ?? 3);

if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 32) {
  fail("--concurrency must be an integer between 1 and 32");
}

const options = {
  all: flags.has("--all"),
  check: flags.has("--check"),
  dryRun: flags.has("--dry-run"),
  force: flags.has("--force"),
  rewrite: flags.has("--rewrite"),
};

const knownFlags = new Set(["--all", "--check", "--dry-run", "--force", "--rewrite"]);
const unknownFlags = [...flags].filter(
  (flag) => !knownFlags.has(flag) && !flag.startsWith("--concurrency="),
);
if (unknownFlags.length > 0) fail(`Unknown option: ${unknownFlags.join(", ")}`);
if (options.all && targets.length > 0) fail("Use either --all or explicit paths, not both");
if (options.check && (options.all || targets.length > 0)) {
  fail("--check cannot be combined with upload targets");
}
if (!options.check && !options.all && targets.length === 0) {
  printHelp();
  process.exit(1);
}
if (options.dryRun && options.rewrite) fail("--rewrite cannot be used with --dry-run");

const env = getConfig();
const imageRoot = resolve(projectRoot, env.localImageRoot);
assertInside(projectRoot, imageRoot, "R2_LOCAL_IMAGE_ROOT");

const client = new S3Client({
  region: "auto",
  endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  maxAttempts: 8,
  retryMode: "standard",
  credentials: {
    accessKeyId: env.accessKeyId,
    secretAccessKey: env.secretAccessKey,
  },
});

if (options.check) {
  await client.send(new ListObjectsV2Command({ Bucket: env.bucket, MaxKeys: 1 }));
  console.log(`R2 connection OK: ${env.bucket}`);
  console.log(`Public base URL: ${env.publicBaseUrl}`);
  process.exit(0);
}

const inputPaths = options.all ? [imageRoot] : targets.map(resolveInputPath);
const files = [...new Set((await Promise.all(inputPaths.map(collectImages))).flat())].sort();
if (files.length === 0) fail("No supported images found");

console.log(`${options.dryRun ? "Would process" : "Processing"} ${files.length} image(s)`);

const results = await mapLimit(files, concurrency, async (file) => {
  const relativePath = toPosix(relative(imageRoot, file));
  assertInside(imageRoot, file, "image path");
  const key = joinKey(env.keyPrefix, relativePath);
  const publicUrl = `${env.publicBaseUrl}/${encodeKey(key)}`;

  if (options.dryRun) {
    console.log(`[dry-run] ${relativePath} -> ${key}`);
    return { status: "dry-run", relativePath, key, publicUrl };
  }

  const body = await readFile(file);
  const sha256 = createHash("sha256").update(body).digest("hex");

  if (!options.force && (await remoteMatches(key, sha256, body.length))) {
    console.log(`[skip] ${key}`);
    return { status: "skipped", relativePath, key, publicUrl };
  }

  await client.send(
    new PutObjectCommand({
      Bucket: env.bucket,
      Key: key,
      Body: body,
      ContentLength: body.length,
      ContentType: CONTENT_TYPES[extname(file).toLowerCase()],
      CacheControl: env.cacheControl,
      Metadata: { sha256 },
    }),
  );
  console.log(`[upload] ${key}`);
  return { status: "uploaded", relativePath, key, publicUrl };
});

if (options.rewrite) {
  const changed = await rewriteMarkdownLinks(results);
  console.log(`Rewrote image links in ${changed} Markdown file(s)`);
}

const uploaded = results.filter((result) => result.status === "uploaded").length;
const skipped = results.filter((result) => result.status === "skipped").length;
console.log(`Done: ${uploaded} uploaded, ${skipped} unchanged, ${files.length} total`);

async function remoteMatches(key, sha256, contentLength) {
  try {
    const response = await client.send(
      new HeadObjectCommand({ Bucket: env.bucket, Key: key }),
    );
    return response.Metadata?.sha256 === sha256 && response.ContentLength === contentLength;
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode;
    if (status === 404 || error?.name === "NotFound" || error?.name === "NoSuchKey") return false;
    throw error;
  }
}

async function collectImages(inputPath) {
  const info = await stat(inputPath).catch(() => null);
  if (!info) fail(`Path does not exist: ${relative(projectRoot, inputPath)}`);
  assertInside(imageRoot, inputPath, "upload target");
  if (info.isFile()) return IMAGE_EXTENSIONS.has(extname(inputPath).toLowerCase()) ? [inputPath] : [];
  if (!info.isDirectory()) return [];

  const entries = await readdir(inputPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const child = join(inputPath, entry.name);
      if (entry.isDirectory()) return collectImages(child);
      return entry.isFile() && IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())
        ? [child]
        : [];
    }),
  );
  return nested.flat();
}

async function rewriteMarkdownLinks(uploadResults) {
  const docsRoot = join(projectRoot, "docs");
  const markdownFiles = await collectFilesByExtension(docsRoot, ".md");
  let changedCount = 0;

  for (const markdownFile of markdownFiles) {
    const original = await readFile(markdownFile, "utf8");
    let updated = original;
    for (const result of uploadResults) {
      updated = updated.split(`/images/${result.relativePath}`).join(result.publicUrl);
    }
    if (updated !== original) {
      await writeFile(markdownFile, updated, "utf8");
      changedCount += 1;
    }
  }
  return changedCount;
}

async function collectFilesByExtension(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const child = join(directory, entry.name);
      if (entry.isDirectory()) return collectFilesByExtension(child, extension);
      return entry.isFile() && extname(entry.name).toLowerCase() === extension ? [child] : [];
    }),
  );
  return nested.flat();
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

function resolveInputPath(input) {
  if (input.startsWith("/images/")) return resolve(imageRoot, input.slice("/images/".length));
  return isAbsolute(input) ? resolve(input) : resolve(projectRoot, input);
}

function getConfig() {
  const required = {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
    localImageRoot: process.env.R2_LOCAL_IMAGE_ROOT,
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name);
  if (missing.length > 0) fail(`Missing .env values: ${missing.join(", ")}`);

  let publicBaseUrl;
  try {
    const url = new URL(required.publicBaseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    publicBaseUrl = url.toString().replace(/\/$/, "");
  } catch {
    fail("R2_PUBLIC_BASE_URL must be a valid HTTP(S) URL");
  }

  return {
    ...required,
    publicBaseUrl,
    keyPrefix: (process.env.R2_KEY_PREFIX ?? "").replace(/^\/+|\/+$/g, ""),
    cacheControl: process.env.R2_CACHE_CONTROL || "public, max-age=86400",
  };
}

function assertInside(parent, child, label) {
  const pathFromParent = relative(parent, child);
  if (pathFromParent === "" || (!pathFromParent.startsWith(`..${sep}`) && pathFromParent !== "..")) return;
  fail(`${label} must stay inside ${parent}`);
}

function joinKey(prefix, relativePath) {
  return [prefix, relativePath].filter(Boolean).join("/");
}

function encodeKey(key) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function toPosix(path) {
  return path.split(sep).join("/");
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function printHelp() {
  console.log(`Usage:
  npm run images:upload -- --check
  npm run images:upload -- --all [--dry-run] [--rewrite]
  npm run images:upload -- <file-or-directory>... [--dry-run] [--rewrite]

Options:
  --check           Verify R2 credentials and bucket access
  --all             Process every image under R2_LOCAL_IMAGE_ROOT
  --dry-run         Show object keys without contacting R2
  --rewrite         Replace matching /images/... links after successful upload
  --force           Upload even when the remote SHA-256 metadata matches
  --concurrency=N   Concurrent R2 operations (default: 3, max: 32)`);
}
