// shots.js — deterministic staging for screenshots. One job: read ?shot= and
// put the game into a fixed, photogenic state. shot=start shows the title
// screen; shot=play shows a mid-play scene with exactly 3 differences found
// and 5 still unfound, timer and lives visible; shot=end shows the scene-win
// screen. No query means the normal playable game. The seed picks the scene.
export function applyShotStaging(game) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  const seed = Number(params.get('seed') || '1');
  const sceneIndex = ((seed - 1) % 4 + 4) % 4;
  if (shot === 'start') {
    game.backToTitle();
    return true;
  }
  if (shot === 'play') {
    game.startScene(sceneIndex);
    // Freeze a believable mid-play moment: 3 found, 5 to find.
    const now = performance.now();
    game.scene.differences.slice(0, 3).forEach((d, i) => game.found.set(d.id, now - (3 - i) * 1000));
    game.timeLeft = 154;
    game.score = 1250;
    game.streak = 2;
    game.view.updateHud(game);
    game.view.updateFoundList(game);
    return true;
  }
  if (shot === 'end') {
    game.startScene(sceneIndex);
    const now = performance.now();
    game.scene.differences.forEach((d) => game.found.set(d.id, now));
    game.timeLeft = 96;
    game.score = 1420;
    game.winScene();
    return true;
  }
  return false;
}
