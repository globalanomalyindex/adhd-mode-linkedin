// lib/reflow.test.js
import { describe, it, expect } from 'vitest';
import { classifyPost, chunkPost, generateTldr } from './reflow.js';

const SHORT_POST = { id: 'p1', text: 'Just shipped a thing. Feels good.', author: 'A' };
const LONG_POST = {
  id: 'p2',
  author: 'Maya Chen',
  text: 'I almost quit my job last year.\n\nIt was 11pm on a Thursday. I was sitting in my car in the office parking lot, staring at my phone.\n\nI had just opened our internal Slack to see another message from our CTO: "Can you jump on a call tomorrow at 7am?"\n\nI closed the app. I opened my email. I started typing a resignation letter.\n\nI didn\'t send it. Here\'s why, and here\'s what I learned about leading through ambiguity that I wish someone had told me three years ago.\n\nWhen you take a senior role at a fast-growing company, nobody tells you that 80% of your job is going to be making decisions with incomplete information.\n\nYour job isn\'t to remove ambiguity. It IS the job. Three things that means:\n\n1. Make decisions, even bad ones, faster than feels comfortable.\n2. Tell people what you don\'t know, as honestly as you can.\n3. Give them a framework for moving forward without you.',
};

describe('classifyPost()', () => {
  it('classifies short posts as short and skips reflow', () => {
    const c = classifyPost(SHORT_POST);
    expect(c.shouldReflow).toBe(false);
    expect(c.kind).toBe('short');
  });

  it('classifies long posts as needing reflow', () => {
    const c = classifyPost(LONG_POST);
    expect(c.shouldReflow).toBe(true);
    expect(['narrative', 'listicle', 'mixed']).toContain(c.kind);
  });
});

describe('chunkPost()', () => {
  it('returns a single chunk for short posts', () => {
    const chunks = chunkPost(SHORT_POST);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].kind).toBe('body');
  });

  it('returns a TL;DR card followed by 2-4 body chunks for long posts', () => {
    const chunks = chunkPost(LONG_POST);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks.length).toBeLessThanOrEqual(5);
    expect(chunks[0].kind).toBe('tldr');
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i].kind).toBe('body');
    }
  });

  it('preserves numbered list items as a contiguous chunk', () => {
    const chunks = chunkPost(LONG_POST);
    const listChunk = chunks.find(c => c.text.includes('1.') && c.text.includes('2.') && c.text.includes('3.'));
    expect(listChunk).toBeDefined();
  });
});

describe('generateTldr()', () => {
  it('returns a third-person sentence under 200 characters', () => {
    const tldr = generateTldr(LONG_POST);
    expect(tldr.length).toBeLessThan(200);
    expect(tldr).toContain('Maya');
  });
});
