const candle = document.getElementById('candle');
const embersBox = document.getElementById('embers');
const balloonsBox = document.getElementById('balloons');
const enterBtn = document.getElementById('enter');
let lit = false;

/* =========================================================
   CHISPAS (fondo)
   ========================================================= */
function spawnEmber(fromCandle = false) {
  const e = document.createElement('div');
  e.className = 'ember';
  const size = 3 + Math.random() * 6;
  e.style.width = e.style.height = size + 'px';

  if (fromCandle) {
    const r = candle.getBoundingClientRect();
    e.style.left = (r.left + r.width / 2 + (Math.random() * 20 - 10)) + 'px';
    e.style.bottom = (window.innerHeight - r.top - 120) + 'px';
  } else {
    e.style.left = Math.random() * 100 + 'vw';
  }

  e.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
  const dur = 4 + Math.random() * 5;
  e.style.animationDuration = dur + 's';
  embersBox.appendChild(e);
  setTimeout(() => e.remove(), dur * 1000);
}

/* =========================================================
   CONFETI (canvas, sin librerías)
   ========================================================= */
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
const COLORS = ['#ffd27a', '#ff6f91', '#ffffff', '#8be9fd', '#b388ff', '#ff9f43', '#7bed9f'];
let pieces = [];
let running = false;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function rand(a, b) { return a + Math.random() * (b - a); }

function addPiece(x, y, vx, vy) {
  pieces.push({
    x, y, vx, vy,
    size: rand(6, 12),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.25, 0.25),
    color: COLORS[(Math.random() * COLORS.length) | 0],
    round: Math.random() < 0.25,
    wobble: rand(0, Math.PI * 2)
  });
}

/* Cañón de confeti: ángulos en grados (0 = derecha, -90 = arriba) */
function cannon(x, y, count, angleMin, angleMax, speedMin, speedMax) {
  for (let i = 0; i < count; i++) {
    const a = rand(angleMin, angleMax) * Math.PI / 180;
    const s = rand(speedMin, speedMax);
    addPiece(x, y, Math.cos(a) * s, Math.sin(a) * s);
  }
  startLoop();
}

/* Lluvia de confeti desde arriba durante "ms" milisegundos */
function rain(ms) {
  const end = performance.now() + ms;
  const timer = setInterval(() => {
    for (let i = 0; i < 4; i++) {
      addPiece(rand(0, window.innerWidth), -10, rand(-1.2, 1.2), rand(1.5, 3.5));
    }
    startLoop();
    if (performance.now() > end) clearInterval(timer);
  }, 90);
}

function startLoop() {
  if (running) return;
  running = true;
  requestAnimationFrame(tick);
}

function tick() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  pieces = pieces.filter(p => p.y < window.innerHeight + 30);

  for (const p of pieces) {
    p.vy += 0.16;        // gravedad
    p.vx *= 0.992;       // roce con el aire
    p.vy *= 0.992;
    p.wobble += 0.12;
    p.x += p.vx + Math.sin(p.wobble) * 0.6;
    p.y += p.vy;
    p.rot += p.vr;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.round) {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.55);
    }
    ctx.restore();
  }

  if (pieces.length > 0) {
    requestAnimationFrame(tick);
  } else {
    running = false;
  }
}

/* =========================================================
   GLOBOS
   ========================================================= */
const BALLOON_COLORS = [
  ['#ff6f91', '#d6336c'],
  ['#ffd27a', '#f08c00'],
  ['#8be9fd', '#1c7ed6'],
  ['#b388ff', '#6741d9'],
  ['#7bed9f', '#2f9e44'],
  ['#ff9f43', '#e8590c']
];

function spawnBalloon() {
  const b = document.createElement('div');
  b.className = 'balloon';
  const [c, c2] = BALLOON_COLORS[(Math.random() * BALLOON_COLORS.length) | 0];
  const dur = rand(9, 14);
  b.style.setProperty('--c', c);
  b.style.setProperty('--c2', c2);
  b.style.setProperty('--w', rand(42, 70) + 'px');
  b.style.setProperty('--dx', rand(-60, 60) + 'px');
  b.style.setProperty('--dur', dur + 's');
  b.style.left = rand(2, 92) + 'vw';
  balloonsBox.appendChild(b);
  setTimeout(() => b.remove(), dur * 1000);
}

function startBalloons() {
  for (let i = 0; i < 7; i++) setTimeout(spawnBalloon, i * 450);
  setInterval(spawnBalloon, 1800);
}

/* =========================================================
   LA REVELACIÓN: al tocar la vela
   ========================================================= */
function lightUp() {
  if (lit) return;
  lit = true;

  // el resplandor nace en la posición de la llama
  const glow = document.getElementById('glow');
  const r = candle.getBoundingClientRect();
  glow.style.left = (r.left + r.width / 2) + 'px';
  glow.style.top = (r.top + 30) + 'px';

  document.body.classList.add('lit');

  // ráfaga de chispas desde la llama
  for (let i = 0; i < 28; i++) setTimeout(() => spawnEmber(true), i * 45);
  setInterval(() => spawnEmber(false), 380);

  if (navigator.vibrate) navigator.vibrate(40);

  // cuando ya se ve el título: confeti y globos
  setTimeout(() => {
    const w = window.innerWidth, h = window.innerHeight;
    cannon(0, h, 70, -80, -55, 13, 20);   // cañón izquierdo
    cannon(w, h, 70, -125, -100, 13, 20); // cañón derecho
    rain(3500);
    startBalloons();
    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
  }, 2200);
}

candle.addEventListener('click', lightUp);

/* Botón: por ahora solo celebra (el siguiente paso lo conecta a la sorpresa) */
enterBtn.addEventListener('click', () => {
  const w = window.innerWidth, h = window.innerHeight;
  cannon(w / 2, h * 0.75, 120, -150, -30, 10, 22);
  enterBtn.textContent = 'Muy pronto... ✨';
  enterBtn.disabled = true;
});
