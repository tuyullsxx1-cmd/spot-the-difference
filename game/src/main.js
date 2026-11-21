// main.js — boot. One job: build the game, wire the DOM view to it, and run the
// render loop. The view object is the game's only window onto the page.
import { PANEL_W, PANEL_H } from './config.js';
import { SCENES } from './scenes.js';
import { Game } from './game.js';
import { Sounds } from './audio.js';
import { wireInput } from './input.js';
import { applyShotStaging } from './shots.js';
import { drawPanel } from './render.js';

const $ = (id) => document.getElementById(id);
const els = {
  canvasLeft: $('panel-left'),
  canvasRight: $('panel-right'),
  sceneName: $('scene-name'),
  sceneSub: $('scene-sub'),
  counter: $('counter'),
  timer: $('timer'),
  lives: $('lives'),
  hints: $('hints'),
  score: $('score'),
  streak: $('streak'),
  foundList: $('found-list'),
  hintBtn: $('btn-hint'),
  pauseBtn: $('btn-pause'),
  restartBtn: $('btn-restart'),
  muteBtn: $('btn-mute'),
  giveUpBtn: $('btn-giveup'),
  titleBtn: $('btn-title'),
  overlay: $('overlay'),
  overlayCard: $('overlay-card'),
};

for (const canvas of [els.canvasLeft, els.canvasRight]) {
  canvas.width = PANEL_W;
  canvas.height = PANEL_H;
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const view = {
  showTitle(game) {
    els.overlayCard.innerHTML = `
      <h1>REEF, GARDEN &amp; STARS</h1>
      <p class="tag">Find every difference between the two pictures. Four scenes, eight differences each.</p>
      <div class="scene-cards">
        ${SCENES.map((s, i) => `
          <button class="scene-card" data-scene="${i}" style="--accent:${s.accent}">
            <span class="sc-num">${i + 1}</span>
            <span class="sc-name">${s.name}</span>
            <span class="sc-sub">${s.subtitle}</span>
            <span class="sc-meta">8 differences · ${'★'.repeat(game.stars[i])}${'☆'.repeat(3 - game.stars[i])}</span>
          </button>`).join('')}
      </div>
      <p class="keys">Click a difference on either picture · H hint · R restart · P pause · M mute · G give up · 1–4 scenes</p>`;
    els.overlay.classList.remove('hidden');
    els.overlayCard.querySelectorAll('.scene-card').forEach((card) => {
      card.addEventListener('click', () => game.startScene(Number(card.dataset.scene)));
    });
  },
  showPlaying(game) {
    els.overlay.classList.add('hidden');
    els.sceneName.textContent = `Scene ${game.sceneIndex + 1} of 4 — ${game.scene.name}`;
    els.sceneSub.textContent = game.scene.subtitle;
  },
  showSceneWin(game, { stars, timeBonus, lifeBonus }) {
    const next = game.sceneIndex + 1 < SCENES.length;
    els.overlayCard.innerHTML = `
      <h1>You found all ${game.scene.differences.length} differences!</h1>
      <p class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</p>
      <p class="tag">${game.scene.name} — time bonus +${timeBonus} · lives bonus +${lifeBonus} · scene score ${game.score}</p>
      <div class="row">
        <button class="btn primary" id="ov-next">${next ? 'Next scene' : 'See results'}</button>
        <button class="btn" id="ov-replay">Replay scene</button>
        <button class="btn" id="ov-scenes">All scenes</button>
      </div>`;
    els.overlay.classList.remove('hidden');
    $('ov-next').addEventListener('click', () => game.nextScene());
    $('ov-replay').addEventListener('click', () => game.retryScene());
    $('ov-scenes').addEventListener('click', () => game.backToTitle());
  },
  showSceneFail(game, reason) {
    els.overlayCard.innerHTML = `
      <h1>${reason}</h1>
      <p class="tag">You found ${game.found.size} of ${game.scene.differences.length} differences in ${game.scene.name}.</p>
      <div class="row">
        <button class="btn primary" id="ov-retry">Retry scene</button>
        <button class="btn" id="ov-giveup">Give up, next scene</button>
        <button class="btn" id="ov-scenes2">All scenes</button>
      </div>`;
    els.overlay.classList.remove('hidden');
    $('ov-retry').addEventListener('click', () => game.retryScene());
    $('ov-giveup').addEventListener('click', () => game.nextScene());
    $('ov-scenes2').addEventListener('click', () => game.backToTitle());
  },
  showTourWin(game) {
    const totalStars = game.stars.reduce((a, b) => a + b, 0);
    els.overlayCard.innerHTML = `
      <h1>Tour complete!</h1>
      <p class="stars">${'★'.repeat(totalStars)}${'☆'.repeat(12 - totalStars)}</p>
      <p class="tag">All four scenes finished. Total score ${game.totalScore} · ${totalStars} of 12 stars.</p>
      <div class="row">
        <button class="btn primary" id="ov-again">Play again</button>
        <button class="btn" id="ov-scenes3">All scenes</button>
      </div>`;
    els.overlay.classList.remove('hidden');
    $('ov-again').addEventListener('click', () => game.startScene(0));
    $('ov-scenes3').addEventListener('click', () => game.backToTitle());
  },
  showPause(game, paused) {
    if (!paused) { els.overlay.classList.add('hidden'); return; }
    els.overlayCard.innerHTML = `
      <h1>Paused</h1>
      <p class="tag">Take a breath. The timer is waiting.</p>
      <div class="row"><button class="btn primary" id="ov-resume">Resume</button></div>`;
    els.overlay.classList.remove('hidden');
    $('ov-resume').addEventListener('click', () => game.togglePause());
  },
  updateHud(game) {
    els.counter.textContent = `${game.remaining} to find`;
    els.timer.textContent = fmtTime(game.timeLeft);
    els.timer.classList.toggle('low', game.timeLeft <= 30);
    els.lives.textContent = '♥'.repeat(game.lives) + '♡'.repeat(3 - game.lives);
    els.hints.textContent = `Hints: ${game.hintsLeft}`;
    els.hintBtn.disabled = game.hintsLeft <= 0 || game.status !== 'playing';
    els.score.textContent = `Score ${game.score}`;
    els.streak.textContent = game.streak > 1 ? `Combo x${game.streak}` : '';
    els.muteBtn.textContent = game.sounds.muted ? 'Sound off' : 'Sound on';
  },
  updateFoundList(game) {
    els.foundList.innerHTML = game.scene.differences.map((d) => `
      <span class="chip ${game.found.has(d.id) ? 'found' : ''}">${game.found.has(d.id) ? '✓ ' : ''}${d.name}</span>`).join('');
  },
};

const sounds = new Sounds();
const game = new Game(view, sounds);
wireInput(game, els);

// Render loop: advance the clock, then paint both panels.
function frame(now) {
  game.tick(now);
  const marks = {
    found: game.status === 'title' ? new Map() : game.found,
    hint: game.hint && now < game.hint.until ? game.hint : null,
    miss: game.miss && game.miss.at && now - game.miss.at < 500 ? game.miss : null,
  };
  drawPanel(els.canvasLeft, game.scene, 'left', marks, now);
  drawPanel(els.canvasRight, game.scene, 'right', marks, now);
  requestAnimationFrame(frame);
}

game.backToTitle();
applyShotStaging(game);
requestAnimationFrame(frame);

// Debug handle for automated playtests (read-only state, no cheats in play).
window.__spot = { game, SCENES, PANEL_W, PANEL_H };
