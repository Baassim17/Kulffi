import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TARGET_URL = "https://mrpops.ua/";
const HTML_OUTPUT = path.join(process.cwd(), "public", "mirror", "mrpops.ua", "index.html");
const ASSET_ROOT = path.join(process.cwd(), "public", "mirror-assets");
const ASSET_PREFIX = "/mirror-assets";
const ALLOWED_HOSTS = new Set(["mrpops.ua", "data.mrpops.ua"]);
const ROOT_PREFIXES = ["/_next/", "/fonts/", "/image/", "/api/", "/cdn-cgi/"];

const queued = new Set();
const downloaded = new Set();

function isAllowedUrl(value) {
  try {
    const url = new URL(value);
    return ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function toMirrorUrl(value) {
  const url = new URL(value);
  return `${ASSET_PREFIX}/${url.hostname}${url.pathname}${url.search}`;
}

function toLocalPath(value) {
  const url = new URL(value);
  const pathname = url.pathname.endsWith("/")
    ? `${url.pathname}index.html`
    : url.pathname;
  const searchSuffix = url.search
    ? `__${encodeURIComponent(url.search.slice(1)).replace(/%/g, "_")}`
    : "";
  const normalized = `${pathname}${searchSuffix}`.replace(/\/+/g, "/");
  return path.join(ASSET_ROOT, url.hostname, normalized);
}

function rewriteContent(content) {
  let next = content;

  next = next.replace(/<base[^>]*href="https:\/\/mrpops\.ua\/"[^>]*>/gi, "");
  next = next.replace(/<script>\(function\(\)\{function c\(\).*?<\/script>/gis, "");

  next = next.replace(
    /https:\/\/(mrpops\.ua|data\.mrpops\.ua)(\/[^"'`\s)<>]*)/g,
    (_match, host, resourcePath) => `${ASSET_PREFIX}/${host}${resourcePath}`
  );

  for (const prefix of ROOT_PREFIXES) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    next = next.replace(
      new RegExp(`(["'(])(${escaped}[^"')\\s<>]*)`, "g"),
      (_match, leader, resourcePath) => `${leader}${ASSET_PREFIX}/mrpops.ua${resourcePath}`
    );
  }

  next = next.replace(
    /\b(href|action)=["']\/(?!mirror-assets\/|_next\/|fonts\/|image\/|api\/|cdn-cgi\/)([^"']*)["']/g,
    (_match, attribute, resourcePath) => `${attribute}="https://mrpops.ua/${resourcePath}"`
  );

  return next;
}

function cleanDiscoveredUrl(value) {
  return value
    .trim()
    .replace(/[",;'`]+$/g, "")
    .replace(/\)+$/g, "");
}

function collectUrls(content, baseUrl) {
  const discovered = new Set();

  const absoluteMatches = content.match(/https:\/\/(?:mrpops\.ua|data\.mrpops\.ua)\/[^"'`\s<>]+/g) ?? [];
  for (const value of absoluteMatches) {
    discovered.add(cleanDiscoveredUrl(value));
  }

  const quotedRootMatches = content.match(/["'(]\/(?:_next|fonts|image|api|cdn-cgi)\/[^"'`\s<>]+/g) ?? [];
  for (const value of quotedRootMatches) {
    const normalized = cleanDiscoveredUrl(value.slice(1));
    discovered.add(new URL(normalized, baseUrl).toString());
  }

  const srcsetMatches = content.match(/\/(?:_next|fonts|image|api|cdn-cgi)\/[^,\s"'`<>]+/g) ?? [];
  for (const value of srcsetMatches) {
    discovered.add(new URL(cleanDiscoveredUrl(value), baseUrl).toString());
  }

  const cssUrlMatches = [...content.matchAll(/url\((['"]?)([^'")]+)\1\)/g)];
  for (const match of cssUrlMatches) {
    const raw = match[2]?.trim();
    if (!raw || raw.startsWith("data:")) {
      continue;
    }

    const normalized = cleanDiscoveredUrl(raw);
    const url = new URL(normalized, baseUrl).toString();
    if (isAllowedUrl(url)) {
      discovered.add(url);
    }
  }

  return [...discovered];
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; Codex mirror bot)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function fetchBinary(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; Codex mirror bot)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function ensureParent(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function downloadOne(url) {
  if (downloaded.has(url) || !isAllowedUrl(url)) {
    return;
  }

  downloaded.add(url);
  const localPath = toLocalPath(url);
  await ensureParent(localPath);

  const isTextAsset =
    url.endsWith(".css") ||
    url.endsWith(".js") ||
    url.endsWith(".json") ||
    url.endsWith(".webmanifest") ||
    url.endsWith(".map") ||
    url.endsWith(".txt");

  try {
    if (isTextAsset) {
      const original = await fetchText(url);
      const rewritten = rewriteContent(original);
      await writeFile(localPath, rewritten, "utf8");

      for (const nestedUrl of collectUrls(original, url)) {
        queueUrl(nestedUrl);
      }

      return;
    }

    const binary = await fetchBinary(url);
    await writeFile(localPath, binary);
  } catch (error) {
    console.warn(`Skipping ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function queueUrl(url) {
  if (!isAllowedUrl(url) || queued.has(url)) {
    return;
  }

  queued.add(url);
}

async function flushQueue() {
  while (queued.size > 0) {
    const batch = [...queued].slice(0, 6);
    for (const item of batch) {
      queued.delete(item);
    }
    await Promise.all(batch.map((item) => downloadOne(item)));
  }
}

async function main() {
  const html = await fetchText(TARGET_URL);
  const rewrittenHtml = rewriteContent(html);

  await ensureParent(HTML_OUTPUT);
  await writeFile(HTML_OUTPUT, rewrittenHtml, "utf8");

  for (const resourceUrl of collectUrls(html, TARGET_URL)) {
    queueUrl(resourceUrl);
  }

  await flushQueue();

  const finalHtml = await readFile(HTML_OUTPUT, "utf8");
  const summary = {
    target: TARGET_URL,
    html: HTML_OUTPUT,
    assetsDownloaded: downloaded.size,
    sampleAssets: [...downloaded].slice(0, 12).map((item) => ({
      remote: item,
      local: toLocalPath(item),
      servedAt: toMirrorUrl(item),
    })),
    htmlBytes: Buffer.byteLength(finalHtml, "utf8"),
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
