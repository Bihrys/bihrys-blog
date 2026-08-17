/*
  Migration script: Inspect and migrate posts from a SQLite database into Astro content markdown files.
  Phase 1: schema introspection and dry-run preview.
  Usage (PowerShell):
    pnpm node scripts/migrate-from-sqlite.mjs --db "D:\\Betsy\\test\\database.db" --dry-run
    pnpm node scripts/migrate-from-sqlite.mjs --db "D:\\Betsy\\test\\database.db" --out ./src/content/posts
*/

import fs from 'node:fs';
import path from 'node:path';
import initSqlJs from 'sql.js';

const argv = process.argv.slice(2);
const params = {};
for (let i = 0; i < argv.length; i++) {
  const tok = argv[i];
  if (!tok.startsWith('--')) continue;
  const eq = tok.indexOf('=');
  if (eq !== -1) {
    const key = tok.slice(2, eq);
    const val = tok.slice(eq + 1);
    params[key] = val === '' ? 'true' : val;
  } else {
    const key = tok.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      params[key] = next;
      i++;
    } else {
      params[key] = 'true';
    }
  }
}

const dbPath = params.db || params.database;
const outDir = params.out || './src/content/posts';
const dryRun = params['dry-run'] === 'true' || params['dry'] === 'true' || !!params['dry-run'] || !!params['dry'];

if (!dbPath) {
  console.error('Error: missing --db <path-to-sqlite-db>');
  process.exit(1);
}

if (!fs.existsSync(dbPath)) {
  console.error(`Error: DB not found at ${dbPath}`);
  process.exit(1);
}

/**
 * Basic helpers
 */
function sanitizeSlug(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'post';
}

function toISODateTime(v) {
  if (!v) return new Date().toISOString();
  try {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  // if it's integer timestamp (seconds or ms)
  if (/^\d+$/.test(String(v))) {
    const n = Number(v);
    const ms = n > 1e12 ? n : n * 1000;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

function yamlEscape(str) {
  if (str == null) return '';
  const s = String(str);
  if (/[:\-{}\[\],&*#?]|^\s|\s$|^$|\n/.test(s)) {
    return JSON.stringify(s);
  }
  return s;
}

function writeMarkdown(outBase, fileSlug, frontmatter, body) {
  const dir = path.join(outBase, fileSlug);
