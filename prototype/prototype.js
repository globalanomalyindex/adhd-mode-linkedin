// prototype/prototype.js
import { createSession, send } from '../lib/session-state.js';
import { createQueue, addItem } from '../lib/resurface-queue.js';
import { schedule } from '../lib/spaced-repetition.js';
import { SAMPLE_FEED } from './sample-feed.js';
import { classifyGesture, magnificationFor } from '../lib/gestures.js';
import { chunkPost } from '../lib/reflow.js';

// ---------- Application state ----------
let session = createSession();
let queue = createQueue();
const setupChoice = { mode: 'focus', durationMin: 12 };
const POST_CAP_BY_DURATION_MIN = new Map([
  [5, 8],
  [12, 15],
  [20, 25],
]);
let timer = null;
let currentPostIdx = 0;
let currentPageIdx = 0;
let currentChunks = [];
let checkpointEl = null;

// ---------- DOM helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Styles for the in-DOM checkpoint. Injected here so the fix lives entirely in
// the file that owns the behavior (index.html is not edited by this lane).
(function injectCheckpointStyles() {
  const css = `
  .checkpoint { position: absolute; inset: 0; z-index: 20; display: flex; align-items: flex-end; }
  .checkpoint-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.32);
    opacity: 0; transition: opacity var(--d-base) var(--ease-out); }
  .checkpoint.open .checkpoint-backdrop { opacity: 1; }
  .checkpoint-sheet { position: relative; width: 100%; background: var(--card);
    border-radius: var(--r-lg) var(--r-lg) 0 0; padding: 20px 18px 22px;
    transform: translateY(100%); transition: transform var(--d-slow) var(--ease-out); }
  .checkpoint.open .checkpoint-sheet { transform: translateY(0); }
  .checkpoint-title { font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.04em;
    text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; }
  .checkpoint-body { font-size: 15px; line-height: 1.5; color: var(--text); margin-bottom: 18px; }
  .checkpoint-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .checkpoint-wrap, .checkpoint-continue { padding: 12px; border-radius: var(--r-pill);
    font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
    transition: background var(--d-fast) var(--ease-in-out), border-color var(--d-fast) var(--ease-in-out); }
  .checkpoint-wrap { border: 1.5px solid var(--hairline); background: transparent; color: var(--text-secondary); }
  .checkpoint-wrap:hover { border-color: var(--brand); color: var(--brand); }
  .checkpoint-continue { border: none; background: var(--brand); color: #fff; }
  .checkpoint-continue:hover { background: var(--brand-hover); }
  .checkpoint-continue:focus-visible, .checkpoint-wrap:focus-visible {
    outline: 2px solid var(--brand); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    .checkpoint-backdrop, .checkpoint-sheet { transition: none; }
  }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

function showPanel(stateName) {
  $$('.panel, .session').forEach(p => p.classList.remove('active'));
  const target = $(`[data-state="${stateName}"]`);
  if (target) target.classList.add('active');
}

function announce(msg) {
  const live = $('#sr-live');
  if (!live) return;
  live.textContent = '';
  setTimeout(() => { live.textContent = msg; }, 50);
}

// ---------- Setup wiring ----------
$$('.setup-mode').forEach(el => {
  el.addEventListener('click', () => {
    $$('.setup-mode').forEach(m => m.classList.remove('selected'));
    el.classList.add('selected');
    setupChoice.mode = el.dataset.mode;
  });
});
$$('.setup-duration').forEach(el => {
  el.addEventListener('click', () => {
    $$('.setup-duration').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
    setupChoice.durationMin = parseInt(el.dataset.min, 10);
  });
});

$('#start-setup-btn').addEventListener('click', () => {
  session = send(session, { type: 'START_SETUP' });
  showPanel('setup');
});

$('#begin-btn').addEventListener('click', () => {
  const postCap = POST_CAP_BY_DURATION_MIN.get(setupChoice.durationMin) ?? 15;
  session = send(session, {
    type: 'BEGIN',
    mode: setupChoice.mode,
    durationSec: setupChoice.durationMin * 60,
    postCap,
  });
  startSession();
});

$('#restart-btn').addEventListener('click', () => {
  session = createSession();
  queue = createQueue();
  currentPostIdx = 0;
  showPanel('entry');
});
$('#close-btn').addEventListener('click', () => {
  showPanel('entry');
  session = createSession();
});

// ---------- Session lifecycle ----------
function startSession() {
  $('#mode-label').textContent = setupChoice.mode === 'focus' ? 'Focus' : 'Re-engage';
  updateMeta();
  showPanel('active');
  presentCard();
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  let remaining = session.durationSec;
  timer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(timer);
      session = send(session, { type: 'TIME_UP' });
      endSession();
      return;
    }
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    $('#time-remaining').textContent = `${mm}:${ss}`;
  }, 1000);
}

function updateMeta() {
  $('#card-progress').textContent = `${session.cardsSeen + 1}/${session.postCap}`;
  $('#queue-count').textContent = `↻ ${session.queueAdds}`;
}

// ---------- Card presentation ----------
function presentCard() {
  if (currentPostIdx >= SAMPLE_FEED.length) {
    endSession();
    return;
  }
  const post = SAMPLE_FEED[currentPostIdx];
  currentChunks = chunkPost(post);
  currentPageIdx = 0;
  renderCurrentChunk(post);
  attachDragHandlers();
  session = send(session, { type: 'CARD_SEEN' });
  updateMeta();

  if (session.state === 'checkpoint') {
    setTimeout(showCheckpoint, 400);
  } else if (session.state === 'end') {
    setTimeout(endSession, 400);
  }
}

function renderCurrentChunk(post) {
  const chunk = currentChunks[currentPageIdx];
  const host = $('#card-host');
  host.innerHTML = `
    <div class="card" id="active-card">
      <div class="card-react-preview" id="react-preview">LIKE</div>
      <div class="card-author">
        <div class="card-avatar"></div>
        <div>
          <div class="card-name">${post.author}</div>
          <div class="card-role">${post.role}</div>
        </div>
      </div>
      ${chunk.kind === 'tldr' ? '<div class="card-tldr-pill">TL;DR</div>' : ''}
      <div class="card-content">${chunk.text}</div>
      ${chunk.pageTotal > 1 ? `
        <div class="card-progress">
          ${Array.from({ length: chunk.pageTotal }, (_, i) =>
            `<div class="pip ${i <= currentPageIdx ? 'filled' : ''}"></div>`
          ).join('')}
        </div>
        <div class="card-page-label">Page ${currentPageIdx + 1} of ${chunk.pageTotal}${currentPageIdx + 1 < chunk.pageTotal ? ' · tap to continue' : ''}</div>
      ` : ''}
    </div>
  `;
}

function endSession() {
  clearInterval(timer);
  if (checkpointEl) {
    checkpointEl.classList.remove('open');
    checkpointEl.hidden = true;
  }
  document.removeEventListener('keydown', checkpointKeyHandler);
  $('#end-seen').textContent = session.cardsSeen;
  $('#end-react').textContent = session.reactionsSent;
  $('#end-queue').textContent = session.queueAdds;
  showPanel('end');
}

// Non-blocking in-DOM checkpoint. The earlier window.confirm() froze the page
// and the spring loop; this overlay lets the user read the count and choose
// without halting the main thread. Built once, then shown on demand.
function buildCheckpoint() {
  const el = document.createElement('div');
  el.className = 'checkpoint';
  el.id = 'checkpoint';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'checkpoint-title');
  el.hidden = true;
  el.innerHTML = `
    <div class="checkpoint-backdrop"></div>
    <div class="checkpoint-sheet">
      <div class="checkpoint-title" id="checkpoint-title">Halfway point</div>
      <p class="checkpoint-body" id="checkpoint-body"></p>
      <div class="checkpoint-actions">
        <button class="checkpoint-wrap" id="checkpoint-wrap">Wrap up</button>
        <button class="checkpoint-continue" id="checkpoint-continue">Keep going</button>
      </div>
    </div>
  `;
  document.querySelector('.stage')?.appendChild(el) ?? document.body.appendChild(el);
  $('#checkpoint-continue', el).addEventListener('click', () => resolveCheckpoint('CONTINUE'));
  $('#checkpoint-wrap', el).addEventListener('click', () => resolveCheckpoint('WRAP'));
  return el;
}

function showCheckpoint() {
  if (!checkpointEl) checkpointEl = buildCheckpoint();
  const minutesLeft = Math.max(1, Math.round(session.durationSec / 120));
  $('#checkpoint-body', checkpointEl).textContent =
    `${session.cardsSeen} posts in. About ${minutesLeft} minutes left. Keep going, or wrap up here?`;
  checkpointEl.hidden = false;
  announce(`Checkpoint. ${session.cardsSeen} posts in. Keep going, or wrap up.`);
  requestAnimationFrame(() => checkpointEl.classList.add('open'));
  $('#checkpoint-continue', checkpointEl).focus();
  document.addEventListener('keydown', checkpointKeyHandler);
}

function resolveCheckpoint(action) {
  if (checkpointEl) {
    checkpointEl.classList.remove('open');
    checkpointEl.hidden = true;
  }
  document.removeEventListener('keydown', checkpointKeyHandler);
  session = send(session, { type: action });
  if (session.state === 'active') {
    announce('Continuing the session.');
    currentPostIdx += 1;
    presentCard();
  } else {
    endSession();
  }
}

function checkpointKeyHandler(ev) {
  if (ev.key === 'Escape') resolveCheckpoint('WRAP');
}

// ---------- Drag handlers ----------
function attachDragHandlers() {
  const card = $('#active-card');
  if (!card) return;
  const tray = $('#react-tray');
  const skipArc = $('.skip-arc');
  const reactPreview = $('#react-preview');
  const reactEls = $$('.react', tray);

  const view = { width: window.innerWidth, height: window.innerHeight };
  let dragging = false;
  let startX = 0, startY = 0;
  let longPressTimer = null;

  function down(ev) {
    dragging = true;
    card.classList.add('dragging');
    const p = pointerOf(ev);
    startX = p.x; startY = p.y;
    card.setPointerCapture?.(ev.pointerId ?? 0);
    // Long press opens the reaction picker. `move` clears this timer as soon as
    // the pointer travels, so the picker only fires on a held, still press.
    longPressTimer = setTimeout(openPicker, 500);
    ev.preventDefault();
  }

  function move(ev) {
    if (!dragging) return;
    clearTimeout(longPressTimer);
    const p = pointerOf(ev);
    const dx = p.x - startX;
    const dy = p.y - startY;
    const gesture = classifyGesture({ dx, dy }, view);
    applyVisuals(dx, dy, gesture);
    ev.preventDefault();
  }

  function up(ev) {
    clearTimeout(longPressTimer);
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    const p = pointerOf(ev);
    const dx = p.x - startX;
    const dy = p.y - startY;
    const gesture = classifyGesture({ dx, dy }, view);
    commitOrReset(gesture);
  }

  function pointerOf(ev) {
    if (ev.touches && ev.touches[0]) return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
    if (ev.changedTouches && ev.changedTouches[0]) return { x: ev.changedTouches[0].clientX, y: ev.changedTouches[0].clientY };
    return { x: ev.clientX, y: ev.clientY };
  }

  function applyVisuals(dx, dy, gesture) {
    card.style.transform = `translate(${dx * 0.7}px, ${dy * 0.5}px) rotate(${dx * 0.04}deg)`;

    if (gesture.zone === 'skip') {
      skipArc.classList.add('active');
      tray.style.opacity = '0.4';
      card.style.opacity = String(1 - 0.4 * gesture.progress);
      reactPreview.classList.remove('visible');
    } else if (gesture.zone === 'react') {
      skipArc.classList.remove('active');
      tray.style.opacity = '1';
      card.style.opacity = '1';
      for (const el of reactEls) {
        const r = el.dataset.r;
        const mag = magnificationFor(r, { dx, dy }, view);
        el.style.transform = `scale(${mag})`;
        el.classList.toggle('highlighted', r === gesture.reaction);
      }
      reactPreview.textContent = gesture.reaction.toUpperCase();
      reactPreview.classList.add('visible');
    } else {
      skipArc.classList.remove('active');
      tray.style.opacity = '1';
      card.style.opacity = '1';
      reactPreview.classList.remove('visible');
      for (const el of reactEls) {
        el.style.transform = 'scale(1)';
        el.classList.remove('highlighted');
      }
    }
  }

  function commitOrReset(gesture) {
    skipArc.classList.remove('active');
    for (const el of reactEls) {
      el.style.transform = 'scale(1)';
      el.classList.remove('highlighted');
    }
    $('#react-preview').classList.remove('visible');

    if (gesture.commit && gesture.zone === 'skip') {
      advanceCard('skip');
    } else if (gesture.commit && gesture.zone === 'react') {
      commitReaction(gesture.reaction);
    } else {
      card.style.transition = `transform var(--d-base) var(--ease-out)`;
      card.style.transform = 'translate(0,0) rotate(0)';
      setTimeout(() => { if (card) card.style.transition = ''; }, 240);
    }
  }

  card.addEventListener('pointerdown', down);
  card.addEventListener('pointermove', move);
  card.addEventListener('pointerup', up);
  card.addEventListener('pointercancel', up);
  card.addEventListener('click', () => {
    if (dragging) return;
    if (currentPageIdx < currentChunks.length - 1) {
      currentPageIdx += 1;
      renderCurrentChunk(SAMPLE_FEED[currentPostIdx]);
      attachDragHandlers();
    }
  });
}

function commitReaction(reaction) {
  const post = SAMPLE_FEED[currentPostIdx];
  const item = schedule({ reaction, now: Date.now(), postId: post.id });
  queue = addItem(queue, item);
  session = send(session, { type: 'REACT', reaction });
  updateMeta();
  const queuedNote = item ? ' Added to your resurface queue.' : '';
  announce(`Reacted ${reaction} to ${post.author}'s post.${queuedNote}`);
  advanceCard('react');
}

function advanceCard(action) {
  if (action === 'skip') {
    const post = SAMPLE_FEED[currentPostIdx];
    if (post) announce(`Skipped ${post.author}'s post. Moving on.`);
  }
  const card = $('#active-card');
  if (card) {
    card.style.transition = `transform var(--d-base) var(--ease-out), opacity var(--d-base) var(--ease-out)`;
    card.style.transform = 'translate(0, 80px) scale(0.9)';
    card.style.opacity = '0';
  }
  setTimeout(() => {
    if (session.state === 'end') {
      endSession();
      return;
    }
    if (session.state === 'checkpoint') {
      showCheckpoint();
      return;
    }
    currentPostIdx += 1;
    presentCard();
  }, 260);
}

// ---------- Long-press picker ----------
function openPicker() {
  const picker = $('#picker');
  if (!picker) return;
  picker.hidden = false;
  $$('.picker-btn', picker).forEach(btn => {
    btn.onclick = () => {
      commitReaction(btn.dataset.r);
      closePicker();
    };
  });
  $('#picker-close').onclick = closePicker;
  document.addEventListener('keydown', pickerKeyHandler);
}

function closePicker() {
  const picker = $('#picker');
  if (picker) picker.hidden = true;
  document.removeEventListener('keydown', pickerKeyHandler);
}

function pickerKeyHandler(ev) {
  if (ev.key === 'Escape') closePicker();
  const n = parseInt(ev.key, 10);
  if (n >= 1 && n <= 6) {
    const btn = $$('.picker-btn')[n - 1];
    if (btn) btn.click();
  }
}
