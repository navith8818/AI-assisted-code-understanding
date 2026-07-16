/* =========================================================
   NOVACORE — interactions
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initAccordion();
  initPlayground();
  initNewsletter();
  initCurrencyToggle();
  initGlobe();
  initHeaderShadow();
});

/* ---------- Mobile nav toggle ---------- */
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
  });

  // On mobile, tapping a dropdown-triggering nav-link expands it inline
  nav.querySelectorAll('.nav-item').forEach((item) => {
    const trigger = item.querySelector('.nav-link');
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth > 1100) return; // desktop uses hover
      e.preventDefault();
      const isExpanded = item.classList.contains('is-expanded');
      nav.querySelectorAll('.nav-item').forEach((i) => i.classList.remove('is-expanded'));
      if (!isExpanded) item.classList.add('is-expanded');
    });
  });
}

/* ---------- FAQ accordion ---------- */
function initAccordion() {
  const items = document.querySelectorAll('.accordion__item');
  items.forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    trigger.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach((i) => i.classList.remove('is-open'));
      if (willOpen) item.classList.add('is-open');
    });
  });
}

/* ---------- Header shadow on scroll ---------- */
function initHeaderShadow() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const onScroll = () => {
    header.style.boxShadow = window.scrollY > 8
      ? '0 8px 24px -12px rgba(0,0,0,.5)'
      : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Currency toggle (EUR / USD demo) ---------- */
function initCurrencyToggle() {
  const toggleBtn = document.getElementById('currencyToggle');
  if (!toggleBtn) return;

  const amounts = document.querySelectorAll('.price-card__amount');
  const rates = { '$': 1, '€': 0.92 };
  let current = '$';

  toggleBtn.addEventListener('click', () => {
    current = current === '$' ? '€' : '$';
    toggleBtn.textContent = current === '$' ? '€ / $' : '$ / €';

    amounts.forEach((el) => {
      const currencySpan = el.querySelector('.price-card__currency');
      const usdValue = parseFloat(el.dataset.usd || el.textContent.replace(/[^0-9.]/g, ''));
      if (!el.dataset.usd) el.dataset.usd = usdValue;
      const converted = (el.dataset.usd * rates[current]).toFixed(2);
      currencySpan.textContent = current;
      // rebuild text node after currency span
      const periodSpan = el.querySelector('.price-card__period');
      el.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
      });
      const textNode = document.createTextNode(converted);
      el.insertBefore(textNode, periodSpan);
    });
  });
}

/* ---------- Playground demo (simulated inference) ---------- */
function initPlayground() {
  const tabs = document.querySelectorAll('.playground__tab');
  const input = document.getElementById('playgroundInput');
  const runBtn = document.getElementById('playgroundRun');
  const output = document.getElementById('playgroundOutput');
  const latency = document.getElementById('playgroundLatency');
  if (!runBtn) return;

  let mode = 'text';
  const placeholders = {
    text: 'Type a prompt, e.g. "Write a haiku about edge computing"',
    speech: 'Paste a transcript snippet or describe the audio clip…',
    image: 'Describe the image you want analyzed…',
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      mode = tab.dataset.tab;
      input.placeholder = placeholders[mode];
    });
  });

  runBtn.addEventListener('click', () => {
    const value = input.value.trim();
    runBtn.disabled = true;
    runBtn.textContent = 'Running…';
    output.textContent = '// routing to nearest edge node…';
    latency.textContent = '';

    const fakeLatency = Math.floor(18 + Math.random() * 24);

    setTimeout(() => {
      output.textContent = buildFakeOutput(mode, value);
      latency.textContent = `${fakeLatency}ms · edge node fra-3`;
      runBtn.disabled = false;
      runBtn.textContent = 'Run inference';
    }, 700 + Math.random() * 400);
  });
}

function buildFakeOutput(mode, value) {
  const prompt = value || '(empty prompt)';
  if (mode === 'speech') {
    return `[speech-to-text]\ninput: "${prompt}"\ntranscript: "${prompt}"\nconfidence: 0.97`;
  }
  if (mode === 'image') {
    return `[image-understanding]\ninput: "${prompt}"\nlabels: ["edge device", "network", "render"]\nconfidence: 0.91`;
  }
  return `[text-generation]\nprompt: "${prompt}"\ncompletion: "${prompt} — processed at the edge, ` +
    `closer to where it happened, faster than the round trip to a single region."`;
}

/* ---------- Newsletter form (demo only) ---------- */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const button = form.querySelector('button');
    button.textContent = '✓';
    input.value = '';
    setTimeout(() => { button.textContent = '→'; }, 1800);
  });
}

/* ---------- Globe canvas (dot-matrix sphere with glow) ---------- */
function initGlobe() {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let size = 0;
  let rotation = 0;

  // Generate points on a sphere (simple Fibonacci sphere distribution)
  const POINT_COUNT = 480;
  const points = [];
  for (let i = 0; i < POINT_COUNT; i++) {
    const y = 1 - (i / (POINT_COUNT - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    points.push({ x, y, z });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    size = rect.width;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
  }

  function draw() {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.42;

    // sort points by z for simple depth ordering after rotation
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    const projected = points.map((p) => {
      const x = p.x * cosR - p.z * sinR;
      const z = p.x * sinR + p.z * cosR;
      const y = p.y;
      return { x, y, z };
    }).sort((a, b) => a.z - b.z);

    projected.forEach((p) => {
      const px = cx + p.x * radius;
      const py = cy + p.y * radius * 0.92 + size * 0.06; // slight vertical compression + offset so top stays in view
      const depth = (p.z + 1) / 2; // 0 (back) -> 1 (front)
      const alpha = 0.12 + depth * 0.55;
      const r = 1 + depth * 1.6;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 179, 122, ${alpha.toFixed(2)})`;
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // horizon glow ring
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 122, 26, 0.18)';
    ctx.lineWidth = 1;
    ctx.arc(cx, cy + size * 0.06, radius * 1.04, 0, Math.PI * 2);
    ctx.stroke();
  }

  function loop() {
    if (!reduceMotion) rotation += 0.0025;
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  draw();
  window.addEventListener('resize', () => { resize(); draw(); });

  if (!reduceMotion) {
    requestAnimationFrame(loop);
  }
}
