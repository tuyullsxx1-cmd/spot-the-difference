[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/tuyullsxx1-cmd/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/tuyullsxx1-cmd/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Reef, Garden & Stars — Spot the Difference

A complete, original spot-the-difference game for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451): four hand-drawn scenes, eight differences each, played offline in a desktop browser.

## The game

- **4 scenes × 8 differences** (32 total), difficulty rising scene by scene:
  1. **Coral Reef** — a sunny morning under the water
  2. **Night Garden** — fireflies over the fountain
  3. **Observatory Rooftop** — planets, charts and a comet
  4. **Dusk Train Station** — last light on platform two
- Two near-identical pictures side by side; click a difference on either picture to mark it on both.
- **Timer** (180s per scene), **3 lives** (a wrong click costs a life and 3 seconds), **3 hints** per scene, **combo bonus** for quick finds in a row, **stars** per scene (time + lives left).
- Keyboard: `H` hint, `R` restart, `P` pause, `M` mute, `G` give up, `1–4` pick a scene.
- All art is drawn procedurally in code (canvas 2D, one flat-vector style); all sounds are synthesised with WebAudio. No images, no audio files, no network.

## How to play

Serve `game/` with any static HTTP server and open `game/index.html` in desktop Chrome, or run:

```sh
python3 -m http.server 8080 --directory game
```

## Hand-in

`main.ts` copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are staged deterministically with `?shot=start|play|end&seed=N`.
