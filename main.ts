// main.ts — hands the game in. It copies game/ and screenshots/ from beside
// this file to the output directory and writes dossier.json there with the
// vendored make.fun library. Runs on Node 22+ with type stripping; standard
// library only. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
// The program is deterministic: two runs write byte-identical output.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from an empty output directory so a rerun can never leave stale files.
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps below mirror the gate in the kit's RULES.txt: at most 4 screenshots
// of 256 KiB, at most 993 game files totalling 48 MiB, paths under 1000 bytes,
// and the dossier text capped at 160 KiB.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);
