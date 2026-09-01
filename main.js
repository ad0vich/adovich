
const canvas = document.getElementById('embers');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let w, h, dpr;

function resize(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
});

const colors = ['255,77,28', '255,138,61', '255,178,56', '255,61,26'];

function makeEmber(spawnAtBottom){
  const size = Math.random() * 2.2 + 0.6;
  return {
    x: Math.random() * w,
    y: spawnAtBottom ? h + Math.random() * 60 : Math.random() * h,
    r: size,
    baseSpeed: (Math.random() * 0.5 + 0.25) * (1.4 - size / 3),
    drift: Math.random() * 0.6 - 0.3,
    phase: Math.random() * Math.PI * 2,
    swaySpeed: Math.random() * 0.02 + 0.008,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: Math.random() * 0.5 + 0.35,
    flick: Math.random() * 0.02 + 0.01
  };
}

const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 480;
const COUNT = Math.min(isSmallScreen ? 45 : 90, Math.floor((w * h) / 14000));
let embers = Array.from({ length: COUNT }, () => makeEmber(false));

let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;

window.addEventListener('mousemove', (e) => {
  tmx = e.clientX / w;
  tmy = e.clientY / h;
});

window.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches[0]) {
    tmx = e.touches[0].clientX / w;
    tmy = e.touches[0].clientY / h;
  }
}, { passive: true });

const hearth = document.getElementById('hearth');

function tick(){
  mx += (tmx - mx) * 0.03;
  my += (tmy - my) * 0.03;

  const shiftX = (mx - 0.5) * 40;
  const shiftY = (my - 0.5) * 20;
  hearth.style.transform = `translate(calc(-50% + ${shiftX}px), ${shiftY}px)`;

  ctx.clearRect(0, 0, w, h);

  for (const p of embers) {
    p.phase += p.swaySpeed;
    const windPull = (mx - 0.5) * 0.4;
    p.x += Math.sin(p.phase) * 0.35 + p.drift * 0.08 + windPull;
    p.y -= p.baseSpeed;
    p.alpha += (Math.random() - 0.5) * p.flick;
    p.alpha = Math.max(0.15, Math.min(0.85, p.alpha));

    if (p.y < -10 || p.x < -20 || p.x > w + 20) {
      Object.assign(p, makeEmber(true));
    }

    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
    grad.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
    grad.addColorStop(1, `rgba(${p.color}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,240,220,${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!reduceMotion) requestAnimationFrame(tick);
}

if (!reduceMotion) {
  requestAnimationFrame(tick);
} else {
  ctx.clearRect(0, 0, w, h);
}
