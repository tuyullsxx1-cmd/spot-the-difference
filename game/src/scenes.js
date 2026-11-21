// scenes.js — the four scenes and their 32 differences. Data only: no drawing here.
// Each difference: id, a short name shown in the found-list, x/y in scene space
// (560x400), and optional x2/y2 where the same difference sits on the right panel
// (used only by the position-shift differences). Types are mixed on purpose:
// missing, extra, colour, position, flip, count, size, text.
export const SCENES = [
  {
    id: 'reef',
    name: 'Coral Reef',
    subtitle: 'A sunny morning under the water',
    accent: '#2dd4bf',
    differences: [
      { id: 'reef-clownfish', name: 'Missing clownfish', x: 384, y: 118, type: 'missing' },
      { id: 'reef-shell', name: 'Extra shell', x: 252, y: 368, type: 'extra' },
      { id: 'reef-coral', name: 'Fan coral turns purple', x: 282, y: 288, type: 'colour' },
      { id: 'reef-starfish', name: 'Starfish moves', x: 118, y: 358, x2: 182, y2: 366, type: 'position' },
      { id: 'reef-seahorse', name: 'Seahorse turns around', x: 482, y: 178, type: 'flip' },
      { id: 'reef-bubbles', name: 'Bubbles: 3, not 4', x: 452, y: 128, type: 'count' },
      { id: 'reef-tang', name: 'Yellow fish grows', x: 198, y: 148, type: 'size' },
      { id: 'reef-shellcolor', name: 'Shell turns green', x: 322, y: 358, type: 'colour' },
    ],
    // Fixed ambient positions so both panels match exactly.
    bubbles: [[428, 88, 6], [452, 128, 5], [418, 152, 7], [470, 162, 4]],
    rays: [[120, 0, 60], [260, 0, 44], [400, 0, 52]],
  },
  {
    id: 'garden',
    name: 'Night Garden',
    subtitle: 'Fireflies over the fountain',
    accent: '#a3e635',
    differences: [
      { id: 'garden-moon', name: 'Missing moon', x: 472, y: 68, type: 'missing' },
      { id: 'garden-firefly', name: 'Extra firefly', x: 300, y: 148, type: 'extra' },
      { id: 'garden-lantern', name: 'Lantern lights up', x: 92, y: 282, type: 'colour' },
      { id: 'garden-cushion', name: 'Cushion slides', x: 432, y: 296, x2: 448, y2: 296, type: 'position' },
      { id: 'garden-tulip', name: 'Tulip turns white', x: 152, y: 330, type: 'colour' },
      { id: 'garden-cat', name: 'Cat turns around', x: 432, y: 282, type: 'flip' },
      { id: 'garden-daisies', name: 'Daisies: 5, not 6', x: 402, y: 352, type: 'count' },
      { id: 'garden-sign', name: 'Sign reads MOON', x: 62, y: 182, type: 'text' },
    ],
    fireflies: [[150, 120, 3], [220, 90, 3], [330, 110, 3], [380, 170, 3], [180, 210, 3], [440, 140, 3]],
    stars: [[40, 40], [120, 60], [200, 34], [280, 52], [360, 30], [520, 110], [520, 40], [60, 110]],
    daisies: [[380, 352], [392, 358], [402, 350], [414, 358], [426, 352], [438, 356]],
  },
  {
    id: 'observatory',
    name: 'Observatory Rooftop',
    subtitle: 'Planets, charts and a comet',
    accent: '#c084fc',
    differences: [
      { id: 'obs-ring', name: 'Saturn loses its ring', x: 122, y: 88, type: 'missing' },
      { id: 'obs-star', name: 'Extra star', x: 252, y: 48, type: 'extra' },
      { id: 'obs-mars', name: 'Mars turns green', x: 302, y: 68, type: 'colour' },
      { id: 'obs-scope', name: 'Telescope tilts', x: 302, y: 282, type: 'position' },
      { id: 'obs-comet', name: 'Comet turns around', x: 482, y: 58, type: 'flip' },
      { id: 'obs-books', name: 'Books: 3, not 2', x: 382, y: 342, type: 'count' },
      { id: 'obs-jupiter', name: 'Jupiter grows', x: 432, y: 128, type: 'size' },
      { id: 'obs-chart', name: 'Chart reads ORION', x: 422, y: 332, type: 'text' },
    ],
    stars: [[40, 40], [90, 110], [160, 40], [200, 90], [240, 140], [340, 36], [380, 100], [470, 150], [520, 90], [60, 180], [150, 150], [500, 200], [30, 250], [540, 40]],
    constellation: [[200, 180], [228, 164], [256, 176], [282, 158], [306, 170]],
  },
  {
    id: 'station',
    name: 'Dusk Train Station',
    subtitle: 'Last light on platform two',
    accent: '#fbbf24',
    differences: [
      { id: 'station-pigeon', name: 'Missing pigeon', x: 252, y: 362, type: 'missing' },
      { id: 'station-case', name: 'Extra suitcase', x: 292, y: 344, type: 'extra' },
      { id: 'station-clock', name: 'Clock jumps ahead', x: 282, y: 78, type: 'position' },
      { id: 'station-lamp', name: 'Lamp glows green', x: 62, y: 202, type: 'colour' },
      { id: 'station-cat', name: 'Cat turns around', x: 422, y: 284, type: 'flip' },
      { id: 'station-poster', name: 'Posters: 2, not 1', x: 432, y: 152, type: 'count' },
      { id: 'station-bench', name: 'Bench grows longer', x: 152, y: 302, type: 'size' },
      { id: 'station-board', name: 'Destinations swap', x: 92, y: 122, type: 'text' },
    ],
    lamps: [[62, 202], [502, 202]],
    pigeons: [[252, 362], [322, 362]],
  },
];
