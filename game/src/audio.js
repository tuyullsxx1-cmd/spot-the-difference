// audio.js — every sound in the game, synthesised with WebAudio. One job: beeps
// and chimes. No audio files, no network. The context is created lazily on the
// first user gesture so browsers never block it.
export class Sounds {
  constructor() {
    this.muted = false;
    this.ctx = null;
  }
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }
  tone(freq, start, dur, type, gain) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur + 0.05);
  }
  click() { this.tone(660, 0, 0.07, 'sine', 0.08); }
  find() { this.tone(659, 0, 0.12, 'sine', 0.16); this.tone(880, 0.1, 0.18, 'sine', 0.16); }
  miss() { this.tone(110, 0, 0.18, 'triangle', 0.18); }
  hint() { this.tone(988, 0, 0.15, 'sine', 0.1); }
  win() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.12, 0.22, 'sine', 0.16));
  }
  lose() { this.tone(330, 0, 0.2, 'sine', 0.12); this.tone(220, 0.18, 0.3, 'sine', 0.12); }
}
