// game.js — the game itself: state, timer, lives, hints, score, streak, win and
// lose. One job: the rules. It never draws a picture (render.js does that) and
// never touches the DOM directly except through the small view object it is
// handed, so the rules stay testable on their own.
import {
  TIMER_SECONDS, LIVES, HINTS_PER_SCENE, HIT_RADIUS, STREAK_WINDOW_MS,
  FIND_POINTS, STREAK_BONUS, WIN_TIME_BONUS, WIN_LIFE_BONUS, MISS_TIME_PENALTY, HINT_MS,
} from './config.js';
import { SCENES } from './scenes.js';

export class Game {
  constructor(view, sounds) {
    this.view = view;       // { showTitle, showPlaying, showSceneWin, showSceneFail, showTourWin, showPause, updateHud, updateFoundList }
    this.sounds = sounds;
    this.sceneIndex = 0;
    this.status = 'title';  // title | playing | paused | sceneWin | sceneFail | tourWin
    this.found = new Map(); // difference id -> timestamp
    this.lives = LIVES;
    this.hintsLeft = HINTS_PER_SCENE;
    this.timeLeft = TIMER_SECONDS;
    this.score = 0;
    this.streak = 0;
    this.lastFindAt = 0;
    this.hint = null;       // { id, until }
    this.miss = null;       // { x, y, panel, at }
    this.stars = [0, 0, 0, 0];
    this.bestScores = [0, 0, 0, 0];
    this.totalScore = 0;
    this.failReason = '';
    this.pausedAt = 0;
    this.lastTick = 0;
  }

  get scene() { return SCENES[this.sceneIndex]; }
  get remaining() { return this.scene.differences.length - this.found.size; }

  startScene(index) {
    this.sceneIndex = index;
    this.found = new Map();
    this.lives = LIVES;
    this.hintsLeft = HINTS_PER_SCENE;
    this.timeLeft = TIMER_SECONDS;
    this.score = 0;
    this.streak = 0;
    this.hint = null;
    this.miss = null;
    this.status = 'playing';
    this.lastTick = performance.now();
    this.view.showPlaying(this);
    this.view.updateHud(this);
    this.view.updateFoundList(this);
  }

  backToTitle() {
    this.status = 'title';
    this.view.showTitle(this);
  }

  // A click inside a panel, in scene coordinates (560x400 space).
  clickAt(x, y, panel) {
    if (this.status !== 'playing') return;
    this.sounds.ensure();
    for (const d of this.scene.differences) {
      if (this.found.has(d.id)) continue;
      const px = panel === 'right' ? (d.x2 ?? d.x) : d.x;
      const py = panel === 'right' ? (d.y2 ?? d.y) : d.y;
      if (Math.hypot(x - px, y - py) <= HIT_RADIUS) {
        this.registerFind(d);
        return;
      }
    }
    this.registerMiss(x, y, panel);
  }

  registerFind(d) {
    const now = performance.now();
    this.streak = now - this.lastFindAt <= STREAK_WINDOW_MS ? this.streak + 1 : 1;
    this.lastFindAt = now;
    this.found.set(d.id, now);
    this.score += FIND_POINTS + STREAK_BONUS * (this.streak - 1);
    this.hint = null;
    this.sounds.find();
    this.view.updateHud(this);
    this.view.updateFoundList(this);
    if (this.found.size === this.scene.differences.length) this.winScene();
  }

  registerMiss(x, y, panel) {
    this.lives -= 1;
    this.streak = 0;
    this.timeLeft = Math.max(0, this.timeLeft - MISS_TIME_PENALTY);
    this.miss = { x, y, panel, at: performance.now() };
    this.sounds.miss();
    this.view.updateHud(this);
    if (this.lives <= 0) this.failScene('Out of lives!');
    else if (this.timeLeft <= 0) this.failScene('Out of time!');
  }

  useHint() {
    if (this.status !== 'playing' || this.hintsLeft <= 0) return;
    const unfound = this.scene.differences.filter((d) => !this.found.has(d.id));
    if (unfound.length === 0) return;
    this.hintsLeft -= 1;
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    this.hint = { id: pick.id, until: performance.now() + HINT_MS };
    this.sounds.hint();
    this.view.updateHud(this);
  }

  winScene() {
    const timeBonus = this.timeLeft * WIN_TIME_BONUS;
    const lifeBonus = this.lives * WIN_LIFE_BONUS;
    this.score += timeBonus + lifeBonus;
    const stars = this.timeLeft >= 60 && this.lives === LIVES ? 3 : this.timeLeft >= 20 ? 2 : 1;
    this.stars[this.sceneIndex] = Math.max(this.stars[this.sceneIndex], stars);
    this.bestScores[this.sceneIndex] = Math.max(this.bestScores[this.sceneIndex], this.score);
    this.totalScore = this.bestScores.reduce((a, b) => a + b, 0);
    this.status = 'sceneWin';
    this.sounds.win();
    this.view.showSceneWin(this, { stars, timeBonus, lifeBonus });
    this.view.updateHud(this);
  }

  failScene(reason) {
    this.failReason = reason;
    this.status = 'sceneFail';
    this.sounds.lose();
    this.view.showSceneFail(this, reason);
  }

  giveUp() {
    if (this.status !== 'playing' && this.status !== 'sceneFail') return;
    this.nextScene();
  }

  nextScene() {
    this.score = 0;
    if (this.sceneIndex + 1 >= SCENES.length) {
      this.status = 'tourWin';
      this.view.showTourWin(this);
    } else {
      this.startScene(this.sceneIndex + 1);
    }
  }

  retryScene() {
    this.score = 0;
    this.startScene(this.sceneIndex);
  }

  togglePause() {
    if (this.status === 'playing') {
      this.status = 'paused';
      this.pausedAt = performance.now();
      this.view.showPause(this, true);
    } else if (this.status === 'paused') {
      this.status = 'playing';
      this.lastTick = performance.now();
      this.view.showPause(this, false);
    }
  }

  toggleMute() {
    this.sounds.muted = !this.sounds.muted;
    this.view.updateHud(this);
    return this.sounds.muted;
  }

  // Called every animation frame: advances the countdown, expires the hint.
  tick(now) {
    if (this.status !== 'playing') { this.lastTick = now; return; }
    const dt = (now - this.lastTick) / 1000;
    this.lastTick = now;
    if (this.hint && now > this.hint.until) { this.hint = null; }
    const before = Math.ceil(this.timeLeft);
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    if (Math.ceil(this.timeLeft) !== before) this.view.updateHud(this);
    if (this.timeLeft <= 0) this.failScene('Out of time!');
  }
}
