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

  // la música arranca con este primer toque (los celulares lo exigen)
  startMusic();

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

/* =========================================================
   SECCIÓN "BELLOS MOMENTOS"
   ========================================================= */
const moments = document.getElementById('moments');
const backBtn = document.getElementById('back');
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');

/* Botón "Descubrir mi sorpresa": explosión de confeti y se abre la sección */
enterBtn.addEventListener('click', () => {
  const w = window.innerWidth, h = window.innerHeight;
  cannon(w / 2, h * 0.75, 120, -150, -30, 10, 22);
  if (navigator.vibrate) navigator.vibrate(40);
  setTimeout(() => {
    moments.scrollTop = 0;
    moments.classList.add('open');
  }, 550);
});

/* Volver a la pantalla anterior */
backBtn.addEventListener('click', () => {
  moments.classList.remove('open');
});

/* Tocar una foto la agranda; tocar de nuevo la cierra */
document.querySelectorAll('.polaroid').forEach(p => {
  p.addEventListener('click', () => {
    lightboxImg.src = p.querySelector('img').src;
    lightbox.classList.add('show');
  });
});
lightbox.addEventListener('click', () => lightbox.classList.remove('show'));

/* =========================================================
   JUEGO DE MEMORIA
   ========================================================= */
const game = document.getElementById('game');
const board = document.getElementById('board');
const triesEl = document.getElementById('tries');
const pairsEl = document.getElementById('pairs');
const winBox = document.getElementById('win');
const PHOTOS = ['fotos/foto1.jpeg', 'fotos/foto2.jpeg', 'fotos/foto3.jpeg', 'fotos/foto4.jpeg'];

let first = null, second = null, locked = false, tries = 0, pairs = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updateStats() {
  triesEl.textContent = tries;
  pairsEl.textContent = pairs;
}

function buildBoard() {
  board.innerHTML = '';
  first = second = null;
  locked = false;
  tries = 0;
  pairs = 0;
  updateStats();

  const deck = shuffle([0, 1, 2, 3, 0, 1, 2, 3]);
  deck.forEach((id, n) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.dataset.id = id;
    card.style.setProperty('--n', n);
    card.setAttribute('aria-label', 'Carta ' + (n + 1));
    card.innerHTML =
      '<div class="card-inner">' +
        '<div class="face front">♥</div>' +
        '<div class="face back"><img src="' + PHOTOS[id] + '" alt=""></div>' +
      '</div>';
    card.addEventListener('click', () => flipCard(card));
    board.appendChild(card);
  });
}

function flipCard(card) {
  if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');

  if (!first) {
    first = card;
    return;
  }

  second = card;
  tries++;
  updateStats();

  if (first.dataset.id === second.dataset.id) {
    // ¡pareja!
    const a = first, b = second;
    first = second = null;
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      a.classList.add('matched');
      b.classList.add('matched');
      if (navigator.vibrate) navigator.vibrate(30);
    }, 350);
    pairs++;
    updateStats();
    if (pairs === 4) setTimeout(winGame, 1100);
  } else {
    // no coinciden: se voltean de nuevo
    locked = true;
    const a = first, b = second;
    first = second = null;
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      locked = false;
    }, 900);
  }
}

function winGame() {
  const w = window.innerWidth, h = window.innerHeight;
  winBox.classList.add('show');
  cannon(0, h, 80, -80, -55, 13, 20);
  cannon(w, h, 80, -125, -100, 13, 20);
  rain(3000);
  if (navigator.vibrate) navigator.vibrate([40, 60, 40, 60, 80]);
}

/* Abrir el juego desde "Bellos momentos" */
document.getElementById('toGame').addEventListener('click', () => {
  buildBoard();
  winBox.classList.remove('show');
  game.scrollTop = 0;
  game.classList.add('open');
});

/* Volver a "Bellos momentos" */
document.getElementById('backGame').addEventListener('click', () => {
  game.classList.remove('open');
  winBox.classList.remove('show');
});

/* Jugar otra vez */
document.getElementById('again').addEventListener('click', () => {
  winBox.classList.remove('show');
  buildBoard();
});

/* =========================================================
   JARDÍN DE RAZONES
   ========================================================= */
const garden = document.getElementById('garden');
const flowersBox = document.getElementById('flowers');
const gardenMsg = document.getElementById('gardenMsg');
const openedEl = document.getElementById('opened');
const gardenDone = document.getElementById('gardenDone');

const REASONS = [
  { color: '#ff6f91', text: 'Por tu sonrisa, que ilumina todo a tu alrededor.' },
  { color: '#ffb347', text: 'Por cada vez que cuidaste de mí sin pedir nada a cambio.' },
  { color: '#b388ff', text: 'Por tus consejos, aunque a veces me costó escucharlos.' },
  { color: '#7ad7f0', text: 'Por tu fuerza para seguir siempre adelante.' },
  { color: '#ff8fab', text: 'Por tu paciencia infinita conmigo.' },
  { color: '#ffd166', text: 'Simplemente, por ser mi mamá. ❤️' }
];

let openedCount = 0;

function flowerSVG(color) {
  let petals = '';
  for (let k = 0; k < 8; k++) {
    petals += '<ellipse cx="0" cy="-17" rx="8.5" ry="16" fill="' + color +
              '" transform="rotate(' + (k * 45) + ')"/>';
  }
  return (
    '<svg viewBox="0 0 100 160" aria-hidden="true">' +
      '<path class="stem" d="M50 158 C 50 120, 48 90, 50 62" fill="none" stroke="#5fd08a" stroke-width="4" stroke-linecap="round"/>' +
      '<path class="leaf" d="M50 118 C 28 112, 22 96, 24 90 C 40 92, 50 104, 50 118Z" fill="#46b870"/>' +
      '<path class="leaf" d="M50 100 C 72 94, 78 80, 76 74 C 60 76, 50 88, 50 100Z" fill="#46b870"/>' +
      '<g transform="translate(50 52)"><g class="head"><g class="bloom">' +
        petals +
        '<circle r="9" fill="#ffd27a"/><circle r="4" fill="#f0a030"/>' +
      '</g></g></g>' +
    '</svg>'
  );
}

function buildGarden() {
  flowersBox.innerHTML = '';
  openedCount = 0;
  openedEl.textContent = 0;
  gardenMsg.textContent = 'Toca una flor 🌸';
  gardenDone.classList.remove('show');
  document.getElementById('toLetter').classList.remove('show');

  REASONS.forEach((r, n) => {
    const f = document.createElement('button');
    f.className = 'flower';
    f.style.setProperty('--n', n);
    f.setAttribute('aria-label', 'Flor ' + (n + 1));
    f.innerHTML = flowerSVG(r.color);
    f.addEventListener('click', () => openFlower(f, r));
    flowersBox.appendChild(f);
  });
}

function showMessage(text) {
  gardenMsg.classList.add('swap');
  setTimeout(() => {
    gardenMsg.textContent = text;
    gardenMsg.classList.remove('swap');
  }, 280);
}

function openFlower(f, reason) {
  if (f.classList.contains('open')) {
    showMessage(reason.text);
    return;
  }
  f.classList.add('open');
  openedCount++;
  openedEl.textContent = openedCount;
  showMessage(reason.text);
  if (navigator.vibrate) navigator.vibrate(30);

  // pétalos que salen de la flor
  const r = f.getBoundingClientRect();
  cannon(r.left + r.width / 2, r.top + r.height * 0.33, 22, -130, -50, 4, 9);

  if (openedCount === REASONS.length) {
    setTimeout(() => {
      gardenDone.classList.add('show');
      document.getElementById('toLetter').classList.add('show');
      const w = window.innerWidth, h = window.innerHeight;
      cannon(0, h, 70, -80, -55, 13, 20);
      cannon(w, h, 70, -125, -100, 13, 20);
      rain(2500);
    }, 1200);
  }
}

/* Del juego al jardín */
document.getElementById('toGarden').addEventListener('click', () => {
  winBox.classList.remove('show');
  buildGarden();
  garden.scrollTop = 0;
  garden.classList.add('open');
});

/* Del jardín de vuelta al juego */
document.getElementById('backGarden').addEventListener('click', () => {
  garden.classList.remove('open');
});

/* =========================================================
   MÚSICA DE FONDO (opcional: musica/cancion.mp3)
   ========================================================= */
const music = document.getElementById('music');
const musicBtn = document.getElementById('musicBtn');
music.volume = 0.7;

function updateMusicBtn() {
  musicBtn.textContent = music.paused ? '🔇' : '🔊';
}

function startMusic() {
  const p = music.play();
  if (p && p.then) {
    p.then(() => {
      musicBtn.classList.add('show');
      updateMusicBtn();
    }).catch(() => { /* sin archivo o bloqueado: la página sigue sin música */ });
  }
}

musicBtn.addEventListener('click', () => {
  if (music.paused) music.play(); else music.pause();
  updateMusicBtn();
});
music.addEventListener('error', () => musicBtn.classList.remove('show'));

/* =========================================================
   FUEGOS ARTIFICIALES (canvas dentro de la carta)
   ========================================================= */
const fwCanvas = document.getElementById('fireworks');
const fctx = fwCanvas.getContext('2d');
let rockets = [];
let sparks = [];
let fwRunning = false;

function resizeFW() {
  const dpr = window.devicePixelRatio || 1;
  fwCanvas.width = window.innerWidth * dpr;
  fwCanvas.height = window.innerHeight * dpr;
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeFW);
resizeFW();

function launchRocket() {
  const w = window.innerWidth, h = window.innerHeight;
  rockets.push({
    x: rand(w * 0.15, w * 0.85),
    y: h + 10,
    vx: rand(-0.8, 0.8),
    vy: -rand(9, 12.5),
    targetY: rand(h * 0.12, h * 0.42),
    hue: rand(0, 360)
  });
  startFW();
}

function explode(x, y, hue) {
  const n = 80;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + rand(-0.05, 0.05);
    const s = rand(2, 6.5);
    sparks.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      decay: rand(0.011, 0.02),
      hue: hue + rand(-25, 25)
    });
  }
}

function startFW() {
  if (fwRunning) return;
  fwRunning = true;
  requestAnimationFrame(fwTick);
}

function fwTick() {
  const w = window.innerWidth, h = window.innerHeight;

  // desvanece lo anterior para dejar estela
  fctx.globalCompositeOperation = 'destination-out';
  fctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  fctx.fillRect(0, 0, w, h);
  fctx.globalCompositeOperation = 'lighter';

  rockets = rockets.filter(r => {
    r.x += r.vx;
    r.y += r.vy;
    r.vy += 0.12;
    fctx.beginPath();
    fctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2);
    fctx.fillStyle = 'hsl(' + r.hue + ', 100%, 75%)';
    fctx.fill();
    if (r.y <= r.targetY || r.vy > -1.5) {
      explode(r.x, r.y, r.hue);
      return false;
    }
    return true;
  });

  sparks = sparks.filter(s => {
    s.x += s.vx;
    s.y += s.vy;
    s.vx *= 0.985;
    s.vy = s.vy * 0.985 + 0.05;
    s.life -= s.decay;
    if (s.life <= 0) return false;
    fctx.beginPath();
    fctx.arc(s.x, s.y, 1 + s.life * 1.6, 0, Math.PI * 2);
    fctx.fillStyle = 'hsla(' + s.hue + ', 100%, 62%, ' + s.life + ')';
    fctx.fill();
    return true;
  });

  if (rockets.length || sparks.length) {
    requestAnimationFrame(fwTick);
  } else {
    fctx.globalCompositeOperation = 'source-over';
    fctx.clearRect(0, 0, w, h);
    fwRunning = false;
  }
}

/* =========================================================
   LA CARTA (máquina de escribir)
   ========================================================= */
const letterSec = document.getElementById('letter');
const typedEl = document.getElementById('typed');
const cursorEl = document.getElementById('cursor');
const signEl = document.getElementById('letterSign');
const wishEl = document.getElementById('finalWish');
const tapHint = document.getElementById('tapHint');
const paper = document.getElementById('paper');

const LETTER =
  'Mamá:\n\n' +
  'Hoy es tu día y quise regalarte algo diferente: un pequeño rincón hecho con mucho cariño solo para ti.\n\n' +
  'Gracias por cada abrazo, cada consejo y cada sacrificio que hiciste en silencio para que yo pudiera llegar hasta aquí. Todo lo bueno que soy lo aprendí de ti.\n\n' +
  'Ojalá este nuevo año de vida te traiga salud, alegría y todo lo bonito que mereces. Que nunca te falte una canción que te haga bailar ni una razón para sonreír.\n\n' +
  'Te quiero mucho, mamá.';

let letterRun = 0;       // sirve para cancelar si se sale de la carta
let typeTimer = null;
let fwTimer = null;
let skipTyping = false;

function resetLetter() {
  letterRun++;
  clearTimeout(typeTimer);
  clearInterval(fwTimer);
  rockets = [];
  sparks = [];
  skipTyping = false;
  typedEl.textContent = '';
  cursorEl.classList.remove('hide');
  signEl.classList.remove('show');
  wishEl.classList.remove('show');
  tapHint.classList.remove('hide');
}

function typeLetter(run) {
  let i = 0;
  function step() {
    if (run !== letterRun) return;

    if (skipTyping) {
      typedEl.textContent = LETTER;
      i = LETTER.length;
    }

    if (i < LETTER.length) {
      const ch = LETTER[i];
      typedEl.textContent += ch;
      i++;
      if (i % 6 === 0) letterSec.scrollTop = letterSec.scrollHeight;
      let delay = 42;
      if (ch === '\n') delay = 330;
      else if (ch === ',' || ch === ':') delay = 220;
      else if (ch === '.') delay = 420;
      typeTimer = setTimeout(step, delay);
    } else {
      finishLetter(run);
    }
  }
  step();
}

function finishLetter(run) {
  if (run !== letterRun) return;
  letterSec.scrollTop = letterSec.scrollHeight;
  cursorEl.classList.add('hide');
  tapHint.classList.add('hide');
  signEl.classList.add('show');

  setTimeout(() => {
    if (run !== letterRun) return;
    wishEl.classList.add('show');
    letterSec.scrollTop = letterSec.scrollHeight;
    if (navigator.vibrate) navigator.vibrate([40, 60, 40, 60, 100]);

    // fuegos artificiales
    for (let k = 0; k < 4; k++) setTimeout(launchRocket, k * 380);
    fwTimer = setInterval(() => {
      launchRocket();
      if (Math.random() < 0.5) setTimeout(launchRocket, 250);
    }, 1100);

    // confeti desde las esquinas
    const w = window.innerWidth, h = window.innerHeight;
    cannon(0, h, 80, -80, -55, 13, 20);
    cannon(w, h, 80, -125, -100, 13, 20);
  }, 1500);
}

document.getElementById('toLetter').addEventListener('click', () => {
  resetLetter();
  const run = letterRun;
  letterSec.scrollTop = 0;
  letterSec.classList.add('open');
  setTimeout(() => typeLetter(run), 1300);
});

document.getElementById('backLetter').addEventListener('click', () => {
  resetLetter();
  letterSec.classList.remove('open');
});

/* Tocar la carta: escribe más rápido (termina de golpe) */
paper.addEventListener('click', () => { skipTyping = true; });
