// lib/reflow.js
const SHORT_THRESHOLD_WORDS = 60;
const TARGET_CHUNK_MIN_WORDS = 40;
const TARGET_CHUNK_MAX_WORDS = 120;

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function classifyPost(post) {
  const words = wordCount(post.text);
  if (words < SHORT_THRESHOLD_WORDS) {
    return { shouldReflow: false, kind: 'short', words };
  }
  const hasNumberedList = /(^|\n)\s*\d+\.\s+/m.test(post.text);
  const kind = hasNumberedList ? 'mixed' : 'narrative';
  return { shouldReflow: true, kind, words };
}

export function generateTldr(post) {
  // Stub: a real implementation would call a summarization LLM.
  // For the prototype, derive a third-person opener from the first paragraph.
  const firstPara = post.text.split('\n\n')[0].replace(/\s+/g, ' ').trim();
  const opener = `${post.author.split(' ')[0]} ${firstPara.replace(/^I /, '').toLowerCase()}`;
  const truncated = opener.length > 180 ? opener.slice(0, 177) + '...' : opener;
  return truncated.charAt(0).toUpperCase() + truncated.slice(1);
}

export function chunkPost(post) {
  const classification = classifyPost(post);
  if (!classification.shouldReflow) {
    return [{ kind: 'body', text: post.text, pageIndex: 0, pageTotal: 1 }];
  }

  const paragraphs = post.text.split('\n\n').map(p => p.trim()).filter(Boolean);
  const bodyChunks = [];
  let buffer = [];
  let bufferWords = 0;

  function flush() {
    if (buffer.length === 0) return;
    bodyChunks.push({ kind: 'body', text: buffer.join('\n\n'), pageIndex: 0, pageTotal: 0 });
    buffer = [];
    bufferWords = 0;
  }

  for (const para of paragraphs) {
    const paraWords = wordCount(para);
    const isListRun = /^\s*\d+\.\s+/.test(para);

    if (bufferWords + paraWords > TARGET_CHUNK_MAX_WORDS && bufferWords >= TARGET_CHUNK_MIN_WORDS && !isListRun) {
      flush();
    }
    buffer.push(para);
    bufferWords += paraWords;
  }
  flush();

  const total = bodyChunks.length + 1;
  const tldrChunk = { kind: 'tldr', text: generateTldr(post), pageIndex: 0, pageTotal: total };
  bodyChunks.forEach((c, i) => {
    c.pageIndex = i + 1;
    c.pageTotal = total;
  });

  return [tldrChunk, ...bodyChunks];
}
