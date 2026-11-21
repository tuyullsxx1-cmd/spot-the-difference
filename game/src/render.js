// render.js — every picture in the game, drawn in code. One job: paint scenes and
// markers onto a panel canvas. No game logic lives here; game.js decides what to
// show, this file only draws it. All art is procedural (canvas 2D, flat vector
// cartoon, one line/shading style per scene family) so both panels match exactly
// except for the differences the right panel applies.
import { PANEL_W, PANEL_H } from './config.js';

// ---------- small shape helpers ----------
function circle(ctx, x, y, r, fill) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}
function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
}
function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.stroke();
}
function star5(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
function fish(ctx, x, y, s, body, belly, flip) {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
  ellipse(ctx, 0, 0, 22, 12, body);
  ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-30, -9); ctx.lineTo(-30, 9); ctx.closePath();
  ctx.fillStyle = body; ctx.fill();
  ellipse(ctx, -2, 4, 12, 6, belly);
  ctx.beginPath(); ctx.moveTo(-4, -10); ctx.lineTo(4, -16); ctx.lineTo(10, -8); ctx.closePath();
  ctx.fillStyle = belly; ctx.fill();
  circle(ctx, 12, -3, 2.5, '#ffffff'); circle(ctx, 13, -3, 1.2, '#111827');
  ctx.restore();
}
function starfish(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); star5(ctx, 0, 0, 14, color);
  circle(ctx, -3, -2, 1.4, '#7c2d12'); circle(ctx, 4, 1, 1.4, '#7c2d12'); circle(ctx, -1, 5, 1.4, '#7c2d12');
  ctx.restore();
}
function shell(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, 2, 13, Math.PI, 0); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  line(ctx, -9, 0, -6, -11, 'rgba(0,0,0,0.25)', 1.5);
  line(ctx, -3, -1, -2, -13, 'rgba(0,0,0,0.25)', 1.5);
  line(ctx, 3, -1, 2, -13, 'rgba(0,0,0,0.25)', 1.5);
  line(ctx, 9, 0, 6, -11, 'rgba(0,0,0,0.25)', 1.5);
  ctx.restore();
}
function coralFan(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, 6, 26, Math.PI, 0); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(i * 9, 4); ctx.lineTo(i * 11, -20); ctx.stroke();
  }
  ctx.restore();
}
function coralBranch(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = color; ctx.lineCap = 'round';
  ctx.lineWidth = 7; line(ctx, 0, 0, -6, -26, color, 7); line(ctx, 0, -8, 10, -30, color, 6);
  line(ctx, -4, -16, -16, -30, color, 5); line(ctx, 4, -20, 14, -38, color, 5);
  line(ctx, 0, -26, 2, -44, color, 5);
  ctx.restore();
}
function seaweed(ctx, x, y, h, color) {
  ctx.strokeStyle = color; ctx.lineCap = 'round';
  for (const [dx, sway] of [[-8, -6], [0, 8], [9, -4]]) {
    ctx.beginPath(); ctx.moveTo(x + dx, y);
    ctx.quadraticCurveTo(x + dx + sway, y - h * 0.6, x + dx + sway * 0.4, y - h);
    ctx.lineWidth = 5; ctx.stroke();
  }
}
function flower(ctx, x, y, s, petal, center) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    circle(ctx, Math.cos(a) * 6, Math.sin(a) * 6, 5, petal);
  }
  circle(ctx, 0, 0, 4, center);
  ctx.restore();
}

// ---------- scene 1: Coral Reef ----------
function paintReef(ctx, _scene, mods) {
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#5eead4'); sky.addColorStop(0.6, '#14b8a6'); sky.addColorStop(1, '#0e7490');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, PANEL_W, 340);
  ctx.fillStyle = '#fde68a'; ctx.fillRect(0, 330, PANEL_W, 70);
  ctx.fillStyle = '#fcd34d'; ctx.fillRect(0, 330, PANEL_W, 6);
  // light rays
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.moveTo(110, 0); ctx.lineTo(150, 0); ctx.lineTo(90, 330); ctx.lineTo(50, 330); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(250, 0); ctx.lineTo(280, 0); ctx.lineTo(330, 330); ctx.lineTo(300, 330); ctx.closePath(); ctx.fill();
  // rocks
  ellipse(ctx, 60, 332, 46, 12, '#94a3b8'); ellipse(ctx, 500, 334, 52, 12, '#94a3b8');
  // corals
  coralBranch(ctx, 82, 320, 1.1, '#f472b6');
  coralFan(ctx, 282, 318, 1.05, mods.has('reef-coral') ? '#8b5cf6' : '#f97316');
  coralBranch(ctx, 472, 318, 1, '#a78bfa');
  // seaweed
  seaweed(ctx, 150, 335, 52, '#059669'); seaweed(ctx, 400, 335, 44, '#10b981');
  // fish
  fish(ctx, 198, 148, mods.has('reef-tang') ? 1.5 : 1, '#facc15', '#fef08a', false);
  if (!mods.has('reef-clownfish')) fish(ctx, 384, 118, 1, '#38bdf8', '#ffffff', true);
  // seahorse: an S-curved body, a snouted head, a dorsal fin and a curled tail
  ctx.save(); ctx.translate(482, 178); ctx.scale(mods.has('reef-seahorse') ? -1 : 1, 1);
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 14); ctx.quadraticCurveTo(-12, 6, -6, -8); ctx.quadraticCurveTo(-2, -16, 4, -14); ctx.stroke();
  circle(ctx, 8, -16, 6, '#f59e0b');
  ctx.beginPath(); ctx.moveTo(12, -18); ctx.lineTo(22, -14); ctx.lineTo(12, -12); ctx.closePath();
  ctx.fillStyle = '#f59e0b'; ctx.fill();
  line(ctx, 4, -22, 8, -28, '#f59e0b', 3);
  ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(-17, 2); ctx.lineTo(-8, 6); ctx.closePath();
  ctx.fillStyle = '#fbbf24'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 14, 6, 0, Math.PI * 1.5); ctx.stroke();
  ctx.restore();
  // two more small fish and pebbles, so the middle water is not empty
  fish(ctx, 330, 205, 0.8, '#a78bfa', '#ddd6fe', true);
  fish(ctx, 95, 185, 0.7, '#4ade80', '#bbf7d0', false);
  ellipse(ctx, 180, 376, 12, 5, '#d6d3d1'); ellipse(ctx, 380, 378, 14, 5, '#d6d3d1'); ellipse(ctx, 520, 372, 10, 4, '#d6d3d1');
  seaweed(ctx, 340, 335, 40, '#059669');
  // more mid-water life, identical on both panels: extra fish, a second
  // bubble trail, more seaweed and pebbles, and a distant manta ray
  fish(ctx, 130, 95, 0.6, '#f472b6', '#fbcfe8', true);
  fish(ctx, 290, 70, 0.55, '#38bdf8', '#e0f2fe', false);
  fish(ctx, 520, 105, 0.6, '#fbbf24', '#fef3c7', true);
  fish(ctx, 240, 230, 0.5, '#4ade80', '#dcfce7', false);
  for (const [bx, by, br] of [[36, 250, 5], [28, 210, 4], [38, 170, 6], [30, 130, 4]]) {
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  seaweed(ctx, 220, 335, 46, '#10b981'); seaweed(ctx, 505, 335, 36, '#059669');
  ellipse(ctx, 120, 380, 9, 4, '#d6d3d1'); ellipse(ctx, 300, 382, 11, 4, '#d6d3d1'); ellipse(ctx, 460, 380, 8, 4, '#d6d3d1');
  ctx.save(); ctx.translate(430, 240);
  ctx.fillStyle = 'rgba(13,148,136,0.55)';
  ctx.beginPath(); ctx.moveTo(-30, -4); ctx.quadraticCurveTo(0, -18, 30, -4); ctx.quadraticCurveTo(0, 6, -30, -4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(13,148,136,0.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, 20); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.arc(70, 140, 4, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(110, 100, 5, 0, Math.PI * 2); ctx.stroke();
  // starfish
  const sf = mods.has('reef-starfish') ? [182, 366] : [118, 358];
  starfish(ctx, sf[0], sf[1], 1, '#fb923c');
  // shells
  shell(ctx, 222, 356, 1, '#60a5fa');
  shell(ctx, 322, 358, 1, mods.has('reef-shellcolor') ? '#4ade80' : '#f9a8d4');
  shell(ctx, 452, 356, 0.9, '#f8fafc');
  if (mods.has('reef-shell')) shell(ctx, 252, 368, 1.1, '#f472b6');
  // bubbles: 4 left, 3 right
  const bubbles = [[428, 88, 6], [452, 128, 5], [418, 152, 7], [470, 162, 4]];
  const n = mods.has('reef-bubbles') ? 3 : 4;
  for (let i = 0; i < n; i++) {
    const [bx, by, br] = bubbles[i];
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
    circle(ctx, bx - 2, by - 2, 1.4, 'rgba(255,255,255,0.9)');
  }
}

// ---------- scene 2: Night Garden ----------
function lantern(ctx, x, y, s, lit) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lit) {
    const g = ctx.createRadialGradient(0, -8, 2, 0, -8, 34);
    g.addColorStop(0, 'rgba(253,230,138,0.9)'); g.addColorStop(1, 'rgba(253,230,138,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -8, 34, 0, Math.PI * 2); ctx.fill();
  }
  roundRect(ctx, -16, 10, 32, 6, 2, '#78716c');
  roundRect(ctx, -5, -6, 10, 18, 2, '#a8a29e');
  roundRect(ctx, -11, -14, 22, 10, 2, lit ? '#fde68a' : '#57534e');
  ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(0, -26); ctx.lineTo(14, -14); ctx.closePath();
  ctx.fillStyle = '#44403c'; ctx.fill();
  ctx.restore();
}
function bench(ctx, x, y, w, cushionX) {
  ctx.fillStyle = '#92400e';
  roundRect(ctx, x - w / 2, y, w, 8, 3, '#92400e');
  roundRect(ctx, x - w / 2, y - 16, w, 7, 3, '#92400e');
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x - w / 2 + 4, y + 8, 6, 22); ctx.fillRect(x + w / 2 - 10, y + 8, 6, 22);
  roundRect(ctx, cushionX - 16, y - 15, 32, 12, 4, '#f472b6');
}
function catSleep(ctx, x, y, s, flip, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
  ellipse(ctx, 0, 4, 20, 11, color);
  circle(ctx, 16, -4, 9, color);
  ctx.beginPath(); ctx.moveTo(10, -11); ctx.lineTo(12, -18); ctx.lineTo(17, -11); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.moveTo(18, -12); ctx.lineTo(21, -19); ctx.lineTo(24, -11); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(-16, 8, 9, Math.PI * 0.9, Math.PI * 1.9); ctx.stroke();
  ctx.restore();
}
function fountain(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 22, 52, 12, '#e2e8f0'); ellipse(ctx, 0, 20, 46, 9, '#38bdf8');
  roundRect(ctx, -6, -18, 12, 40, 4, '#cbd5e1');
  ellipse(ctx, 0, -20, 16, 5, '#e2e8f0');
  ctx.strokeStyle = 'rgba(125,211,252,0.9)'; ctx.lineWidth = 2.5;
  for (const dx of [-14, -5, 5, 14]) {
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.quadraticCurveTo(dx, -2, dx * 1.4, 16); ctx.stroke();
  }
  ctx.restore();
}
function paintGarden(ctx, scene, mods) {
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#0f172a'); sky.addColorStop(0.6, '#1e3a5f'); sky.addColorStop(1, '#14532d');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  if (!mods.has('garden-moon')) {
    circle(ctx, 472, 68, 26, '#fef9c3');
    circle(ctx, 464, 62, 5, '#eab308'); circle(ctx, 480, 74, 4, '#eab308');
  }
  for (const [sx, sy] of scene.stars) circle(ctx, sx, sy, 1.8, 'rgba(255,255,255,0.9)');
  // hedge
  ctx.fillStyle = '#166534'; ctx.fillRect(0, 250, PANEL_W, 60);
  for (let x = 10; x < 560; x += 34) circle(ctx, x, 252, 16, '#15803d');
  // path: a narrow stone walk with stepping stones, not a white wedge
  ctx.fillStyle = '#a8a29e'; ctx.beginPath();
  ctx.moveTo(246, 400); ctx.lineTo(266, 252); ctx.lineTo(294, 252); ctx.lineTo(314, 400); ctx.closePath(); ctx.fill();
  ellipse(ctx, 280, 300, 16, 6, '#d6d3d1'); ellipse(ctx, 280, 340, 20, 7, '#d6d3d1'); ellipse(ctx, 280, 378, 24, 8, '#d6d3d1');
  // fountain
  fountain(ctx, 280, 232, 1);
  // stone lantern
  lantern(ctx, 92, 282, 1, mods.has('garden-lantern'));
  // wooden sign
  ctx.save(); ctx.translate(62, 182);
  ctx.fillStyle = '#78350f'; ctx.fillRect(-3, 0, 6, 34);
  roundRect(ctx, -34, -16, 68, 26, 4, '#b45309');
  ctx.fillStyle = '#fef3c7'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(mods.has('garden-sign') ? 'MOON' : 'GARDEN', 0, 2);
  ctx.restore();
  // tulips (3, middle one changes colour)
  for (let i = 0; i < 3; i++) {
    const tx = 138 + i * 16;
    line(ctx, tx, 348, tx, 330, '#16a34a', 3);
    const petal = i === 1 && mods.has('garden-tulip') ? '#f8fafc' : '#ef4444';
    flower(ctx, tx, 326, 0.9, petal, '#facc15');
  }
  // daisies: 6 left, 5 right
  const nd = mods.has('garden-daisies') ? 5 : 6;
  for (let i = 0; i < nd; i++) {
    const [dx, dy] = scene.daisies[i];
    line(ctx, dx, dy + 8, dx, dy + 2, '#16a34a', 2.5);
    flower(ctx, dx, dy - 2, 0.8, '#f8fafc', '#facc15');
  }
  // rose bush
  circle(ctx, 200, 196, 26, '#166534'); circle(ctx, 222, 204, 20, '#15803d');
  circle(ctx, 196, 190, 5, '#f43f5e'); circle(ctx, 214, 200, 5, '#f43f5e'); circle(ctx, 226, 188, 5, '#fb7185');
  // bench + cushion + cat
  bench(ctx, 432, 300, 84, mods.has('garden-cushion') ? 448 : 432);
  catSleep(ctx, 432, 282, 0.9, mods.has('garden-cat'), '#f97316');
  // watering can
  ctx.save(); ctx.translate(352, 336);
  roundRect(ctx, -12, -10, 24, 18, 4, '#64748b');
  line(ctx, 12, -4, 24, -12, '#64748b', 4);
  line(ctx, -12, -6, -20, -14, '#64748b', 4);
  ctx.restore();
  // fireflies: 6 left, 7 right (extra at 300,148)
  const flies = [...scene.fireflies];
  if (mods.has('garden-firefly')) flies.push([300, 148, 3]);
  for (const [fx, fy, fr] of flies) {
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
    g.addColorStop(0, 'rgba(190,242,100,0.95)'); g.addColorStop(1, 'rgba(190,242,100,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, 12, 0, Math.PI * 2); ctx.fill();
    circle(ctx, fx, fy, fr, '#d9f99d');
  }
}

// ---------- scene 3: Observatory Rooftop ----------
function planet(ctx, x, y, r, color, ring, stripes) {
  circle(ctx, x, y, r, color);
  if (stripes) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
    for (const dy of [-r * 0.4, 0, r * 0.45]) { ctx.beginPath(); ctx.moveTo(x - r, y + dy); ctx.lineTo(x + r, y + dy); ctx.stroke(); }
    ctx.restore();
  }
  if (ring) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35);
    ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.7, r * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}
function telescope(ctx, x, y, s, tiltDeg) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate((tiltDeg * Math.PI) / 180);
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  line(ctx, -4, 26, -16, 52, '#64748b', 6); line(ctx, 4, 26, 16, 52, '#64748b', 6); line(ctx, 0, 26, 0, 52, '#64748b', 6);
  roundRect(ctx, -36, -9, 72, 17, 8, '#475569');
  roundRect(ctx, 32, -7, 14, 12, 3, '#cbd5e1');
  circle(ctx, -36, 0, 6, '#38bdf8');
  ctx.restore();
}
function paintObservatory(ctx, scene, mods) {
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#1e1b4b'); sky.addColorStop(0.6, '#312e81'); sky.addColorStop(1, '#0f172a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  for (const [sx, sy] of scene.stars) circle(ctx, sx, sy, 1.8, 'rgba(255,255,255,0.9)');
  circle(ctx, 140, 220, 1.8, 'rgba(255,255,255,0.9)');
  circle(ctx, 90, 150, 1.8, 'rgba(255,255,255,0.9)');
  circle(ctx, 350, 200, 1.8, 'rgba(255,255,255,0.9)');
  // a denser sky, identical on both panels: more stars of varied sizes,
  // a few bright ones, a crescent moon, a distant ringed planet, a second
  // constellation and faint horizon clouds
  for (const [sx, sy, sr] of [[30, 90, 1.5], [70, 60, 2.2], [180, 50, 1.4], [230, 120, 2.6], [350, 60, 1.6], [400, 170, 2.0], [470, 220, 1.5], [520, 180, 2.4], [60, 260, 1.8], [110, 240, 1.4], [190, 260, 2.0], [250, 240, 1.5], [330, 240, 2.2], [380, 290, 1.6], [440, 300, 1.8], [490, 300, 1.4], [540, 220, 2.0], [30, 300, 1.6], [150, 120, 1.5], [280, 200, 1.8], [420, 40, 2.2], [90, 200, 1.4], [520, 120, 1.6], [360, 140, 1.5]]) {
    circle(ctx, sx, sy, sr, 'rgba(255,255,255,0.9)');
  }
  for (const [bx, by] of [[60, 80], [380, 40], [540, 120]]) {
    star5(ctx, bx, by, 4.5, '#fef08a'); circle(ctx, bx, by, 1.8, '#ffffff');
  }
  circle(ctx, 58, 42, 15, '#fef9c3');
  circle(ctx, 65, 38, 13, '#211e54');
  circle(ctx, 528, 268, 10, '#f0abfc');
  ctx.save(); ctx.translate(528, 268); ctx.rotate(-0.35);
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(0, 0, 17, 4.5, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = 'rgba(147,197,253,0.7)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  [[430, 220], [452, 206], [474, 216], [492, 200]].forEach(([cx, cy], i) => { if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy); });
  ctx.stroke();
  for (const [cx, cy] of [[430, 220], [452, 206], [474, 216], [492, 200]]) circle(ctx, cx, cy, 2.5, '#bfdbfe');
  ellipse(ctx, 280, 312, 46, 8, 'rgba(148,163,184,0.22)');
  ellipse(ctx, 470, 308, 40, 7, 'rgba(148,163,184,0.22)');
  if (mods.has('obs-star')) { star5(ctx, 252, 48, 7, '#fef08a'); circle(ctx, 252, 48, 2, '#ffffff'); }
  // constellation
  ctx.strokeStyle = 'rgba(147,197,253,0.7)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  scene.constellation.forEach(([cx, cy], i) => { if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy); });
  ctx.stroke();
  for (const [cx, cy] of scene.constellation) circle(ctx, cx, cy, 3, '#bfdbfe');
  // planets
  planet(ctx, 122, 88, 22, '#f59e0b', !mods.has('obs-ring'), false);
  planet(ctx, 302, 68, 15, mods.has('obs-mars') ? '#4ade80' : '#ef4444', false, false);
  planet(ctx, 432, 128, mods.has('obs-jupiter') ? 34 : 24, '#fbbf24', false, true);
  // comet (tail flips)
  ctx.save(); ctx.translate(482, 58);
  const dir = mods.has('obs-comet') ? 1 : -1;
  const g = ctx.createLinearGradient(0, 0, dir * -70, 14);
  g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = g; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(dir * -70, 14); ctx.stroke();
  circle(ctx, 0, 0, 6, '#fef9c3');
  ctx.restore();
  // roof floor
  ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 330, PANEL_W, 70);
  ctx.fillStyle = '#334155'; ctx.fillRect(0, 330, PANEL_W, 5);
  // dome
  ctx.save(); ctx.translate(140, 330);
  ctx.beginPath(); ctx.arc(0, 0, 62, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#64748b'; ctx.fill();
  ctx.fillStyle = '#0f172a'; ctx.fillRect(-8, -62, 16, 62);
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(-66, 0, 132, 6);
  ctx.restore();
  // telescope (tilts more on the right)
  telescope(ctx, 302, 282, 1, mods.has('obs-scope') ? -38 : -22);
  // table with chart + books + mug
  ctx.fillStyle = '#78350f'; ctx.fillRect(392, 336, 120, 8); ctx.fillRect(398, 344, 6, 30); ctx.fillRect(500, 344, 6, 30);
  ctx.save(); ctx.translate(422, 332);
  roundRect(ctx, -22, -12, 44, 24, 2, '#fef3c7');
  ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(mods.has('obs-chart') ? 'ORION' : 'LYRA', 0, 4);
  ctx.restore();
  const nb = mods.has('obs-books') ? 3 : 2;
  for (let i = 0; i < nb; i++) {
    roundRect(ctx, 366, 336 - i * 8 - 7, 34, 7, 2, ['#ef4444', '#3b82f6', '#22c55e'][i]);
  }
  roundRect(ctx, 338, 322, 14, 14, 3, '#f97316');
}

// ---------- scene 4: Dusk Train Station ----------
function clockFace(ctx, x, y, r, hour, minute) {
  circle(ctx, x, y, r, '#fefce8');
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    line(ctx, x + Math.sin(a) * (r - 4), y - Math.cos(a) * (r - 4), x + Math.sin(a) * (r - 8), y - Math.cos(a) * (r - 8), '#1e293b', 2);
  }
  const ha = ((hour % 12) + minute / 60) * (Math.PI / 6);
  const ma = (minute * Math.PI) / 30;
  line(ctx, x, y, x + Math.sin(ha) * r * 0.5, y - Math.cos(ha) * r * 0.5, '#1e293b', 3);
  line(ctx, x, y, x + Math.sin(ma) * r * 0.8, y - Math.cos(ma) * r * 0.8, '#1e293b', 2);
  circle(ctx, x, y, 3, '#dc2626');
}
function lampPost(ctx, x, y, s, glowColor) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createRadialGradient(0, -52, 2, 0, -52, 40);
  g.addColorStop(0, glowColor); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -52, 40, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1f2937'; ctx.fillRect(-3, -52, 6, 54);
  roundRect(ctx, -9, -62, 18, 12, 4, '#111827');
  circle(ctx, 0, -56, 5, '#fde68a');
  ctx.restore();
}
function suitcase(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(ctx, -18, -12, 36, 26, 4, color);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-18, 1); ctx.lineTo(18, 1); ctx.stroke();
  ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-7, -12); ctx.lineTo(-7, -18); ctx.lineTo(7, -18); ctx.lineTo(7, -12); ctx.stroke();
  ctx.restore();
}
function pigeon(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 2, 11, 8, '#94a3b8');
  circle(ctx, 9, -5, 5, '#64748b');
  ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(13, -5); ctx.lineTo(18, -3); ctx.lineTo(13, -2); ctx.closePath(); ctx.fill();
  circle(ctx, 10, -6, 1.2, '#111827');
  line(ctx, -4, 9, -4, 13, '#f97316', 1.5); line(ctx, 3, 9, 3, 13, '#f97316', 1.5);
  ctx.restore();
}
function paintStation(ctx, scene, mods) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#f59e0b'); sky.addColorStop(0.55, '#c2410c'); sky.addColorStop(1, '#1e3a5f');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, PANEL_W, 300);
  circle(ctx, 500, 60, 24, '#fef3c7');
  // distant birds and faint clouds in the dusk sky, identical on both panels
  ctx.strokeStyle = 'rgba(30,41,59,0.7)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (const [bx, by] of [[150, 50], [182, 72], [380, 42]]) {
    ctx.beginPath(); ctx.moveTo(bx - 8, by); ctx.quadraticCurveTo(bx - 3, by - 6, bx, by);
    ctx.quadraticCurveTo(bx + 3, by - 6, bx + 8, by); ctx.stroke();
  }
  ellipse(ctx, 200, 150, 44, 8, 'rgba(255,255,255,0.12)');
  ellipse(ctx, 350, 180, 36, 7, 'rgba(255,255,255,0.12)');
  // station building band
  ctx.fillStyle = '#334155'; ctx.fillRect(0, 200, PANEL_W, 100);
  ctx.fillStyle = '#475569'; ctx.fillRect(0, 200, PANEL_W, 8);
  // windows
  for (let x = 20; x < 540; x += 60) {
    roundRect(ctx, x, 226, 36, 44, 4, x % 120 === 20 ? '#fde68a' : '#1e293b');
  }
  // departure board (destinations swap on the right)
  ctx.save(); ctx.translate(92, 122);
  roundRect(ctx, -58, -30, 116, 60, 4, '#0f172a');
  ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 13px monospace, monospace'; ctx.textAlign = 'left';
  const rows = mods.has('station-board') ? ['PARIS 18:20', 'ROME  18:45'] : ['ROME  18:20', 'PARIS 18:45'];
  ctx.fillText(rows[0], -50, -8); ctx.fillText(rows[1], -50, 14);
  ctx.restore();
  // poster(s)
  roundRect(ctx, 448, 128, 44, 52, 3, '#0ea5e9');
  ctx.fillStyle = '#f0f9ff'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('SEA', 470, 152); ctx.fillText('SIDE', 470, 168);
  if (mods.has('station-poster')) {
    roundRect(ctx, 404, 128, 44, 52, 3, '#f43f5e');
    ctx.fillStyle = '#fff1f2'; ctx.fillText('HILL', 426, 152); ctx.fillText('TOP', 426, 168);
  }
  // clock (6:10 left, 7:25 right)
  if (mods.has('station-clock')) clockFace(ctx, 282, 78, 30, 7, 25);
  else clockFace(ctx, 282, 78, 30, 6, 10);
  // lamps
  lampPost(ctx, 62, 202, 1, mods.has('station-lamp') ? 'rgba(74,222,128,0.55)' : 'rgba(253,230,138,0.6)');
  lampPost(ctx, 502, 202, 1, 'rgba(253,230,138,0.6)');
  // platform + tracks
  ctx.fillStyle = '#78716c'; ctx.fillRect(0, 300, PANEL_W, 100);
  ctx.fillStyle = '#a8a29e'; ctx.fillRect(0, 300, PANEL_W, 6);
  ctx.fillStyle = '#44403c'; ctx.fillRect(0, 372, PANEL_W, 28);
  ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 386); ctx.lineTo(PANEL_W, 386); ctx.stroke();
  // benches (second one grows longer on the right)
  const bw = mods.has('station-bench') ? 108 : 84;
  bench(ctx, 152, 302, bw, 152);
  bench(ctx, 422, 302, 84, 422);
  // luggage
  suitcase(ctx, 202, 344, 1, '#7c3aed');
  suitcase(ctx, 482, 344, 1, '#0d9488');
  if (mods.has('station-case')) suitcase(ctx, 292, 344, 0.9, '#dc2626');
  // cat asleep on the second bench
  catSleep(ctx, 422, 284, 0.9, mods.has('station-cat'), '#f8fafc');
  // ticket machine
  ctx.save(); ctx.translate(352, 252);
  roundRect(ctx, -16, -34, 32, 62, 4, '#0ea5e9');
  roundRect(ctx, -10, -28, 20, 14, 2, '#fef9c3');
  circle(ctx, 0, 4, 5, '#f43f5e'); circle(ctx, 0, 18, 5, '#22c55e');
  ctx.restore();
  // pigeons: 2 left, 1 right
  if (!mods.has('station-pigeon')) pigeon(ctx, 252, 362, 1);
  pigeon(ctx, 322, 362, 1);
}

// ---------- panel drawing ----------
const PAINTERS = { reef: paintReef, garden: paintGarden, observatory: paintObservatory, station: paintStation };

function markerPos(d, variant) {
  return variant === 'right' ? [d.x2 ?? d.x, d.y2 ?? d.y] : [d.x, d.y];
}

// Draw one panel: the scene (left = original, right = with differences applied),
// then the found rings, the hint pulse and the miss flash.
export function drawPanel(canvas, scene, variant, marks, now) {
  const ctx = canvas.getContext('2d');
  const mods = variant === 'right' ? new Set(scene.differences.map((d) => d.id)) : new Set();
  const painter = PAINTERS[scene.id];
  painter(ctx, scene, mods);
  // found rings (green ring + white check), popping briefly after the find
  for (const [id, at] of marks.found) {
    const d = scene.differences.find((x) => x.id === id);
    if (!d) continue;
    const [mx, my] = markerPos(d, variant);
    const age = now - at;
    const pop = age < 240 ? 1 + 0.35 * (1 - age / 240) : 1;
    const r = 20 * pop;
    ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.arc(mx, my, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(mx - 8, my); ctx.lineTo(mx - 2, my + 6); ctx.lineTo(mx + 9, my - 7); ctx.stroke();
  }
  // hint pulse (gold, breathing)
  if (marks.hint) {
    const d = scene.differences.find((x) => x.id === marks.hint.id);
    if (d) {
      const [hx, hy] = markerPos(d, variant);
      const pulse = 1 + 0.18 * Math.sin(now / 160);
      ctx.beginPath(); ctx.arc(hx, hy, 24 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251,191,36,0.95)'; ctx.lineWidth = 4; ctx.setLineDash([8, 6]); ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  // miss flash (red X, fading) — only on the panel where the miss happened
  if (marks.miss && marks.miss.panel === variant && now - marks.miss.at < 500) {
    const a = 1 - (now - marks.miss.at) / 500;
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    const { x, y } = marks.miss;
    ctx.beginPath(); ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9); ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9); ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
