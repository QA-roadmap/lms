#!/usr/bin/env node
// Imports a structured MD lesson file into Sanity as a `lesson` document.
//
// Usage:
//   node scripts/import-lesson-from-md.mjs <file.md> [--dry-run]
//
// File format expected:
//   ## МЕТА ДОКУМЕНТА  — table with title/slug/duration/isFree/isCapstone/videoUrl/order
//   ## CONTENT BLOCKS  — followed by sections:
//     ### [callout — type: info|tip|warning|danger|example|success]
//     ### [block — H2|H3|H4|текст]
//     ### [table]
//     ### [accordion]   — items separated by "---"
//     ### [checklist]

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const SANITY_PROJECT = 'vprlxx2h';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

const mdFile = process.argv.find(a => a.endsWith('.md'));
if (!mdFile) {
  console.error('Usage: node scripts/import-lesson-from-md.mjs <file.md> [--dry-run]');
  process.exit(1);
}

if (!DRY_RUN && !SANITY_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN in .env');
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(mdFile), 'utf-8');

// ── key generator ─────────────────────────────────────────────────────────────
let seq = 0;
const k = () => `k${(seq++).toString().padStart(4, '0')}`;

// ── inline markdown → Portable Text spans ─────────────────────────────────────
function matchDelim(text, i, delim) {
  if (!text.startsWith(delim, i)) return null;
  const end = text.indexOf(delim, i + delim.length);
  if (end === -1) return null;
  const inner = text.slice(i + delim.length, end);
  if (!inner.trim()) return null;
  return { inner, end: end + delim.length };
}

function parseInline(text) {
  const spans = [];
  const markDefs = [];
  let buf = '';
  let i = 0;

  const flush = () => {
    if (buf) { spans.push({ _type: 'span', _key: k(), text: buf, marks: [] }); buf = ''; }
  };

  const addMarked = (inner, mark) => {
    const sub = parseInline(inner);
    markDefs.push(...sub.markDefs);
    for (const s of sub.spans) {
      spans.push({ ...s, _key: k(), marks: [...(s.marks || []), mark] });
    }
  };

  while (i < text.length) {
    const bold = matchDelim(text, i, '**');
    if (bold) { flush(); addMarked(bold.inner, 'strong'); i = bold.end; continue; }

    const code = matchDelim(text, i, '`');
    if (code) { flush(); spans.push({ _type: 'span', _key: k(), text: code.inner, marks: ['code'] }); i = code.end; continue; }

    // *italic* (not **)
    if (text[i] === '*' && text[i + 1] !== '*') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1 && text[end + 1] !== '*') {
        flush(); addMarked(text.slice(i + 1, end), 'em'); i = end + 1; continue;
      }
    }

    // [text](url)
    if (text[i] === '[') {
      const closeB = text.indexOf(']', i + 1);
      if (closeB !== -1 && text[closeB + 1] === '(') {
        const closeP = text.indexOf(')', closeB + 2);
        if (closeP !== -1) {
          flush();
          const linkText = text.slice(i + 1, closeB);
          const href = text.slice(closeB + 2, closeP);
          const lk = k();
          markDefs.push({ _type: 'link', _key: lk, href });
          const sub = parseInline(linkText);
          markDefs.push(...sub.markDefs);
          for (const s of sub.spans) {
            spans.push({ ...s, _key: k(), marks: [...(s.marks || []), lk] });
          }
          i = closeP + 1;
          continue;
        }
      }
    }

    buf += text[i++];
  }
  flush();
  return { spans, markDefs };
}

function makeBlock(style, text) {
  const { spans, markDefs } = parseInline(text.trim());
  if (!spans.length) return null;
  return { _type: 'block', _key: k(), style: style || 'normal', children: spans, markDefs };
}

// ── table parser ──────────────────────────────────────────────────────────────
function isTableSep(row) {
  const cells = row.trim().split('|').slice(1, -1);
  return cells.length > 0 && cells.every(c => /^[\s:\-]+$/.test(c));
}

function parseTable(tableLines) {
  const rows = tableLines
    .filter(l => l.trim().startsWith('|'))
    .filter(l => !isTableSep(l));

  return {
    _type: 'table',
    _key: k(),
    rows: rows.map(row => ({
      _type: 'tableRow',
      _key: k(),
      cells: row.split('|').slice(1, -1).map(c => c.trim()),
    })),
  };
}

// ── paragraph/list block parser (shared by callout, accordion, text blocks) ───
function parseTextLines(lines) {
  const blocks = [];
  let tableLines = [];
  let inTable = false;

  const flushTable = () => {
    if (tableLines.length) { blocks.push(parseTable(tableLines)); tableLines = []; }
    inTable = false;
  };

  for (const line of lines) {
    const l = line.trim();

    if (!l || l === '---') { flushTable(); continue; }

    if (l.startsWith('|')) {
      inTable = true; tableLines.push(l); continue;
    }
    if (inTable) flushTable();

    // H3 / H4
    if (l.startsWith('#### ')) { const b = makeBlock('h4', l.slice(5)); if (b) blocks.push(b); continue; }
    if (l.startsWith('### ')) { const b = makeBlock('h3', l.slice(4)); if (b) blocks.push(b); continue; }

    // numbered list
    const numM = l.match(/^(\d+)\.\s+(.+)/);
    if (numM) { const b = makeBlock('normal', numM[2]); if (b) { b.listItem = 'number'; b.level = 1; blocks.push(b); } continue; }

    // bullet list
    if (l.startsWith('- ')) { const b = makeBlock('normal', l.slice(2)); if (b) { b.listItem = 'bullet'; b.level = 1; blocks.push(b); } continue; }

    // normal paragraph
    const b = makeBlock('normal', l);
    if (b) blocks.push(b);
  }
  flushTable();
  return blocks;
}

// ── callout ────────────────────────────────────────────────────────────────────
const TONE_MAP = { info: 'info', tip: 'tip', warning: 'warning', danger: 'danger', task: 'task', example: 'info', success: 'tip' };

function makeCallout(tone, bodyLines) {
  const content = parseTextLines(bodyLines);
  if (!content.length) return null;
  return { _type: 'callout', _key: k(), tone: TONE_MAP[tone] || 'info', content };
}

// ── checklist ─────────────────────────────────────────────────────────────────
function makeChecklist(lines) {
  let title = null;
  const items = [];

  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('## ') || l.startsWith('# ')) {
      title = l.replace(/^#+\s+/, '').trim();
      continue;
    }
    const m = l.match(/^-\s+\[[ x]\]\s+(.+)/);
    if (m) items.push({ _type: 'checklistItem', _key: k(), text: m[1].trim(), done: false });
  }

  if (!items.length) return null;
  const obj = { _type: 'checklist', _key: k(), items };
  if (title) obj.title = title;
  return obj;
}

// ── accordion ─────────────────────────────────────────────────────────────────
function parseAccordionItems(bodyLines) {
  const rawText = bodyLines.join('\n');
  const items = rawText.split(/\n[ \t]*---[ \t]*\n/).map(s => s.trim()).filter(Boolean);
  const result = [];

  for (const item of items) {
    const lines = item.split('\n');
    let title = null;
    const contentStart = [];

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (!title) {
        const m = l.match(/^\*\*(.+)\*\*$/);
        if (m) { title = m[1].trim(); continue; }
      }
      contentStart.push(lines[i]);
    }

    if (!title) continue;
    const content = parseTextLines(contentStart);
    if (!content.length) continue;
    result.push({ _type: 'accordion', _key: k(), title, content });
  }

  return result;
}

// ── metadata parser ───────────────────────────────────────────────────────────
function parseMeta(lines) {
  const map = {};
  for (const line of lines) {
    const l = line.trim();
    if (!l.startsWith('|') || isTableSep(l)) continue;
    const cells = l.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length >= 2 && cells[0]) map[cells[0]] = cells[1];
  }

  return {
    title: map.title || '',
    slug: map.slug || '',
    duration: map.duration && !map.duration.startsWith('(') ? map.duration : undefined,
    isFree: map.isFree === 'true',
    isCapstone: map.isCapstone === 'true',
    videoUrl: map.videoUrl && !map.videoUrl.startsWith('(') ? map.videoUrl : undefined,
    order: map.order !== undefined ? parseInt(map.order, 10) : undefined,
  };
}

// ── main content block dispatcher ─────────────────────────────────────────────
function parseContentSection(header, bodyLines) {
  const m = header.match(/###\s+\[([^\]]+)\]/);
  if (!m) return [];

  const parts = m[1].split(/\s*[—–\-]\s*/);
  const type = parts[0].trim().toLowerCase();
  const subtype = (parts[1] || '').trim().toLowerCase();

  if (type === 'callout') {
    const c = makeCallout(subtype || 'info', bodyLines);
    return c ? [c] : [];
  }

  if (type === 'block') {
    if (/^h[234]$/.test(subtype)) {
      const blocks = [];
      for (const line of bodyLines) {
        const l = line.trim();
        if (!l || l === '---') continue;
        const hm = l.match(/^(#{1,4})\s+(.+)/);
        if (hm) {
          const lvl = hm[1].length;
          const style = lvl <= 2 ? 'h2' : lvl === 3 ? 'h3' : 'h4';
          const b = makeBlock(style, hm[2]);
          if (b) blocks.push(b);
        } else {
          const b = makeBlock('normal', l);
          if (b) blocks.push(b);
        }
      }
      return blocks;
    }
    // текст / normal
    return parseTextLines(bodyLines);
  }

  if (type === 'table') {
    const tbl = parseTable(bodyLines);
    return tbl.rows.length ? [tbl] : [];
  }

  if (type === 'accordion') {
    return parseAccordionItems(bodyLines);
  }

  if (type === 'checklist') {
    const cl = makeChecklist(bodyLines);
    return cl ? [cl] : [];
  }

  console.warn(`⚠️  Unknown block type: "${type}"`);
  return [];
}

// ── parse the file ─────────────────────────────────────────────────────────────
const lines = raw.split('\n');

// Find metadata section (supports both ПОЛЯ ДОКУМЕНТА and МЕТА ДОКУМЕНТА)
const metaIdx = lines.findIndex(l => l.includes('ДОКУМЕНТА'));
const contentIdx = lines.findIndex(l => l.includes('CONTENT BLOCKS'));
const metaLines = metaIdx >= 0 ? lines.slice(metaIdx + 1, contentIdx >= 0 ? contentIdx : lines.length) : [];
const meta = parseMeta(metaLines);

// Find all ### [...] section headers and their body lines
const contentBlocks = [];
const sectionHeaders = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('### [')) sectionHeaders.push(i);
}

for (let s = 0; s < sectionHeaders.length; s++) {
  const start = sectionHeaders[s];
  const end = s + 1 < sectionHeaders.length ? sectionHeaders[s + 1] : lines.length;
  const header = lines[start].trim();
  const body = lines.slice(start + 1, end).map(l => l.trimEnd());

  // Trim leading/trailing empty lines
  while (body.length && !body[0].trim()) body.shift();
  while (body.length && !body[body.length - 1].trim()) body.pop();

  const blocks = parseContentSection(header, body);
  contentBlocks.push(...blocks);
}

// ── build Sanity document ─────────────────────────────────────────────────────
if (!meta.slug) {
  console.error('❌ Could not parse slug from metadata');
  process.exit(1);
}

const docId = `lesson-${meta.slug}`;
const document = {
  _type: 'lesson',
  _id: docId,
  title: meta.title,
  slug: { _type: 'slug', current: meta.slug },
  isFree: meta.isFree,
  isCapstone: meta.isCapstone,
  content: contentBlocks,
};
if (meta.duration) document.duration = meta.duration;
if (meta.videoUrl) document.videoUrl = meta.videoUrl;
if (meta.order !== undefined) document.order = meta.order;

console.log(`\n📄 ID:       ${docId}`);
console.log(`📌 Title:    ${document.title}`);
console.log(`🔗 Slug:     ${meta.slug}`);
console.log(`⏱  Duration: ${meta.duration || '—'}`);
console.log(`🆓 Free:     ${meta.isFree}`);
console.log(`📊 Blocks:   ${contentBlocks.length}`);
console.log(`   Types:    ${[...new Set(contentBlocks.map(b => b._type))].join(', ')}`);

if (DRY_RUN) {
  console.log('\n--- DRY RUN: first 5 content blocks ---');
  console.log(JSON.stringify(contentBlocks.slice(0, 5), null, 2));
  console.log('\n[DRY RUN] No changes sent to Sanity.');
  process.exit(0);
}

// ── upload ────────────────────────────────────────────────────────────────────
const body = JSON.stringify({ mutations: [{ createOrReplace: document }] });

const options = {
  hostname: `${SANITY_PROJECT}.api.sanity.io`,
  path: `/v1/data/mutate/${SANITY_DATASET}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SANITY_TOKEN}`,
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', c => (data += c));
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log(`\n🎉 Uploaded to Sanity! ID: ${docId}`);
    } else {
      console.error(`\n❌ Sanity API error (${res.statusCode}):`, data);
    }
  });
});
req.on('error', e => console.error('Request error:', e));
req.write(body);
req.end();
