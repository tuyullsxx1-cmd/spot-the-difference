// input.js — mouse and keyboard. One job: turn player actions into game calls.
// Clicks are converted from page pixels into scene space (560x400) using the
// canvas bounding box, so the hit test works at any display size.
import { PANEL_W, PANEL_H } from './config.js';

export function wireInput(game, els) {
  function toSceneCoords(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * PANEL_W,
      y: ((event.clientY - rect.top) / rect.height) * PANEL_H,
    };
  }
  els.canvasLeft.addEventListener('click', (event) => {
    const { x, y } = toSceneCoords(els.canvasLeft, event);
    game.clickAt(x, y, 'left');
  });
  els.canvasRight.addEventListener('click', (event) => {
    const { x, y } = toSceneCoords(els.canvasRight, event);
    game.clickAt(x, y, 'right');
  });
  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') game.useHint();
    else if (key === 'r') game.retryScene();
    else if (key === 'p' || key === 'escape') game.togglePause();
    else if (key === 'm') game.toggleMute();
    else if (key === 'g') game.giveUp();
    else if (key >= '1' && key <= '4') game.startScene(Number(key) - 1);
  });
  els.hintBtn.addEventListener('click', () => game.useHint());
  els.pauseBtn.addEventListener('click', () => game.togglePause());
  els.restartBtn.addEventListener('click', () => game.retryScene());
  els.muteBtn.addEventListener('click', () => game.toggleMute());
  els.giveUpBtn.addEventListener('click', () => game.giveUp());
  els.titleBtn.addEventListener('click', () => game.backToTitle());
}
