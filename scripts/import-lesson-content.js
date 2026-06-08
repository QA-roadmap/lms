#!/usr/bin/env node
// Converts content/blog/test.mdx HTML → Sanity Portable Text → uploads to lesson-ollama-setup

require('dotenv').config({ path: `${__dirname}/../.env` });

const fs = require('fs');
const https = require('https');

const HTML_FILE = `${__dirname}/../content/blog/test.mdx`;
const SANITY_PROJECT = 'vprlxx2h';
const SANITY_DATASET = 'production';
const SANITY_LESSON_ID = 'lesson-ollama-setup';
const SANITY_TOKEN = process.env.SANITY_API_WRITE_TOKEN;
if (!SANITY_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN in .env');
  process.exit(1);
}

const rawHtml = fs.readFileSync(HTML_FILE, 'utf-8');

// ── helpers ──────────────────────────────────────────────────────────────────

let seq = 100;
const k = () => `k${seq++}`;

function dec(str) {
  return str
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}

function stripVueComments(s) {
  return s.replace(/<!--\[-->|<!--\]-->|<!---->/g, '').replace(/<!--[^>]*-->/g, '');
}

function extractCode(preInner) {
  // Remove all span tags (syntax highlighting)
  const raw = preInner
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<!--\[-->|<!--\]-->|<!---->/g, '');
  return dec(raw).trim();
}

// ── inline parser → Portable Text spans ─────────────────────────────────────

function parseInline(html) {
  html = stripVueComments(html)
    .replace(/<a\s+name="[^"]*">\s*<\/a>/g, '')
    .trim();
  if (!html) return { spans: [], markDefs: [] };

  const spans = [];
  const markDefs = [];
  const stack = []; // each entry: 'strong'|'em'|'code'|{key,href}
  let buf = '';

  function flush() {
    const text = dec(buf);
    buf = '';
    if (!text) return;
    const marks = stack.map(m => (typeof m === 'string' ? m : m.key));
    spans.push({ _type: 'span', _key: k(), text, marks });
  }

  const re = /<(\/?)(\w+)([^>]*)\/?>|([^<]+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const [, closing, tag, attrs, text] = m;
    if (text !== undefined) { buf += text; continue; }

    const t = tag.toLowerCase();
    if (closing) {
      switch (t) {
        case 'strong': case 'em': case 'code': {
          flush();
          const i = stack.map((x,i)=>[x,i]).reverse().find(([x])=>x===t);
          if (i) stack.splice(i[1], 1);
          break;
        }
        case 'a': {
          flush();
          const i = stack.map((x,idx)=>[x,idx]).reverse().find(([x])=>typeof x==='object');
          if (i) stack.splice(i[1], 1);
          break;
        }
      }
    } else {
      switch (t) {
        case 'strong': case 'em': case 'code':
          flush(); stack.push(t); break;
        case 'a': {
          const hm = attrs.match(/href="([^"]*)"/);
          if (hm && !attrs.includes('name=')) {
            flush();
            const lk = `lnk${k()}`;
            markDefs.push({ _type: 'link', _key: lk, href: dec(hm[1]) });
            stack.push({ key: lk });
          }
          break;
        }
        case 'br': buf += '\n'; break;
      }
    }
  }
  flush();
  return { spans, markDefs };
}

function block(style, html, listItem, level) {
  const { spans, markDefs } = parseInline(html);
  if (!spans.length) return null;
  const b = { _type: 'block', _key: k(), style: style || 'normal', children: spans, markDefs };
  if (listItem) { b.listItem = listItem; b.level = level || 1; }
  return b;
}

function codeBlock(code, lang) {
  return { _type: 'code', _key: k(), language: lang || 'javascript', code };
}

// ── step 1: extract code blocks and YouTube embeds, replace with placeholders ─

const codePool = [];
const ytPool = [];

let html = rawHtml
  // extract code blocks first
  .replace(
    /<pre[^>]*data-lang="([^"]*)"[^>]*>([\s\S]*?)<\/pre>/gi,
    (_, lang, inner) => {
      codePool.push({ lang, code: extractCode(inner) });
      return `<CODE_BLOCK_${codePool.length - 1}>`;
    }
  )
  // extract YouTube iframes from figures
  .replace(
    /<figure[^>]*>[\s\S]*?<iframe[^>]*src="(https:\/\/www\.youtube\.com\/embed\/[^"?]+[^"]*)"[^>]*>[\s\S]*?<\/figure>/gi,
    (_, src) => {
      // strip autoplay/loop/mute params, keep clean embed URL
      const cleanUrl = src.split('?')[0];
      ytPool.push(cleanUrl);
      return `<YT_EMBED_${ytPool.length - 1}>`;
    }
  );

// ── step 2: walk through block-level elements in document order ───────────────

const blocks = [];

// Combined regex matching one block element at a time
const blockRe = new RegExp([
  '<section[^>]*>([\\s\\S]*?)<\\/section>',
  '<h2[^>]*>([\\s\\S]*?)<\\/h2>',
  '<h3[^>]*>([\\s\\S]*?)<\\/h3>',
  '<h4[^>]*>([\\s\\S]*?)<\\/h4>',
  '<blockquote[^>]*>([\\s\\S]*?)<\\/blockquote>',
  '<p[^>]*>([\\s\\S]*?)<\\/p>',
  '<ul[^>]*>([\\s\\S]*?)<\\/ul>',
  '<ol[^>]*>([\\s\\S]*?)<\\/ol>',
  '<CODE_BLOCK_(\\d+)>',
  '<YT_EMBED_(\\d+)>',
  '<hr[^>]*\\/?>',
  '<figure[^>]*>[\\s\\S]*?<\\/figure>',
  '<nav[^>]*>[\\s\\S]*?<\\/nav>',
].join('|'), 'gi');

let match;
while ((match = blockRe.exec(html)) !== null) {
  const [full, section, h2, h3, h4, bq, p, ul, ol, codeIdx] = match;

  if (section !== undefined) {
    // Section only contains an <h2>
    const hm = section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (hm) { const b = block('h2', hm[1]); if (b) blocks.push(b); }

  } else if (h2 !== undefined) {
    const b = block('h2', h2); if (b) blocks.push(b);

  } else if (h3 !== undefined) {
    const b = block('h3', h3); if (b) blocks.push(b);

  } else if (h4 !== undefined) {
    const b = block('h4', h4); if (b) blocks.push(b);

  } else if (bq !== undefined) {
    const b = block('blockquote', bq); if (b) blocks.push(b);

  } else if (p !== undefined) {
    const b = block('normal', p); if (b) blocks.push(b);

  } else if (ul !== undefined) {
    const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let li;
    while ((li = liRe.exec(ul)) !== null) {
      const b = block('normal', li[1], 'bullet', 1); if (b) blocks.push(b);
    }

  } else if (ol !== undefined) {
    const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let li;
    while ((li = liRe.exec(ol)) !== null) {
      const b = block('normal', li[1], 'number', 1); if (b) blocks.push(b);
    }

  } else if (codeIdx !== undefined) {
    const { lang, code } = codePool[parseInt(codeIdx)];
    blocks.push(codeBlock(code, lang));

  } else if (match[10] !== undefined) {
    // YouTube embed
    const url = ytPool[parseInt(match[10])];
    blocks.push({ _type: 'youtube', _key: k(), url });
  }
  // hr, figure (remaining), nav → skip
}

// ── step 3: filter out duplicate h2 blocks (section + standalone h2) ─────────
// The section regex captures the h2, so standalone h2s inside sections won't appear again.
// But to be safe, deduplicate consecutive identical h2 blocks:
const deduped = blocks.filter((b, i) => {
  if (i === 0) return true;
  const prev = blocks[i - 1];
  if (b._type === 'block' && prev._type === 'block' && b.style === prev.style) {
    const bText = b.children.map(s=>s.text).join('');
    const pText = prev.children.map(s=>s.text).join('');
    if (bText === pText) return false;
  }
  return true;
});

console.log(`✅  Built ${deduped.length} Portable Text blocks`);
console.log('\nFirst 3 blocks (preview):');
console.log(JSON.stringify(deduped.slice(0, 3), null, 2));

// ── step 4: send to Sanity ───────────────────────────────────────────────────

const body = JSON.stringify({
  mutations: [{
    patch: {
      id: SANITY_LESSON_ID,
      set: { content: deduped }
    }
  }]
});

const options = {
  hostname: `${SANITY_PROJECT}.api.sanity.io`,
  path: `/v1/data/mutate/${SANITY_DATASET}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SANITY_TOKEN}`,
    'Content-Length': Buffer.byteLength(body),
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('\n🎉  Successfully uploaded content to Sanity!');
    } else {
      console.error(`\n❌  Sanity API error (${res.statusCode}):`, data);
    }
  });
});
req.on('error', e => console.error('Request error:', e));
req.write(body);
req.end();
