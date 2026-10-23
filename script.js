/* basically everything about the data*/

const Spooder = (() => {
  // read over REST, no SDK needed
  const DB_URL = 'https://spooder-12345-default-rtdb.asia-southeast1.firebasedatabase.app';
  const NODE = 'sensorReadings';
  const TEMP_FIELD = 'temperature_adjusted_c'; 
  const HISTORY_FETCH = 500;   
  const FALLBACK_POINTS = 30;  // ADJUSTABLE if fewer than 2 readings in the last 24h, show this many latest readings

  // ADJUSTABLE [caution, danger]. mq9_analog is a 10-bit ADC value (0-1023)
  const LIMITS = { temperature: [35, 40], humidity: [85, 95], gas: [300, 600] };

  const normalise = r => ({
    temperature: r[TEMP_FIELD],
    humidity: r.humidity_percent,
    gas: r.mq9_analog,
    gasStatus: r.mq9_status,
    ts: r.timestamp
  });

  async function fetchReadings(n) {
    const url = `${DB_URL}/${NODE}.json?orderBy=%22$key%22&limitToLast=${n}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Firebase HTTP ' + res.status);
    const data = await res.json();
    if (!data) return [];
    return Object.entries(data)
      .map(([key, v]) => ({ key, ...normalise(v) }))
      .sort((a, b) => (a.ts && b.ts) ? a.ts - b.ts : (a.key < b.key ? -1 : 1));
  }

  async function getLatest() {
    const r = await fetchReadings(1);
    if (!r.length) throw new Error('No readings');
    return r[r.length - 1];
  }

  async function getHistory() {
    let rows = await fetchReadings(HISTORY_FETCH);
    const validTs = rows.every(r => r.ts > 1e12); // epoch ms
    let windowLabel = 'the past 24 hours';
    if (validTs) {
      const recent = rows.filter(r => r.ts >= Date.now() - 24 * 36e5);
      if (recent.length >= 2) rows = recent;
      else { rows = rows.slice(-FALLBACK_POINTS); windowLabel = `the latest ${rows.length} readings`; }
    } else {
      rows = rows.slice(-FALLBACK_POINTS); windowLabel = `the latest ${rows.length} readings`;
    }
    return {
      windowLabel,
      labels: rows.map((r, i) => r.ts > 1e12
        ? new Date(r.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '#' + (i + 1)),
      temperature: rows.map(r => r.temperature),
      humidity: rows.map(r => r.humidity),
      gas: rows.map(r => r.gas)
    };
  }

  function levelOf(d) {
    let lvl = 'good';
    for (const k in LIMITS) {
      if (d[k] == null) continue;
      if (d[k] >= LIMITS[k][1]) return 'danger';
      if (d[k] >= LIMITS[k][0]) lvl = 'caution';
    }
    return lvl;
  }

  function carousel(el, slides) {
    el.classList.add('carousel');
    el.innerHTML = `<div class="carousel-track">${slides.map(s =>
      `<figure class="carousel-slide"><img src="${s.src}" alt="${s.alt || ''}" loading="lazy">${s.caption ? `<figcaption>${s.caption}</figcaption>` : ''}</figure>`).join('')}</div>
      <button class="carousel-btn prev" aria-label="Previous">‹</button><button class="carousel-btn next" aria-label="Next">›</button>
      <div class="carousel-dots">${slides.map((_, i) => `<button aria-label="Go to slide ${i + 1}"></button>`).join('')}</div>`;
    const track = el.querySelector('.carousel-track'), dots = [...el.querySelectorAll('.carousel-dots button')];
    let i = 0;
    const go = n => { i = (n + slides.length) % slides.length; track.style.transform = `translateX(-${i * 100}%)`; dots.forEach((d, j) => d.classList.toggle('on', j === i)); };
    el.querySelector('.prev').onclick = () => go(i - 1);
    el.querySelector('.next').onclick = () => go(i + 1);
    dots.forEach((d, j) => d.onclick = () => go(j));
    go(0);
  }

  /*  menu + shortcut bar  */
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#menu a').forEach(a => { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });
  const box = document.getElementById('menuCheckbox');
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && box) box.checked = false; });

  const items = [...document.querySelectorAll('navbar > div')].map(item => {
    const t = item.querySelector('[href^="#"]'); if (!t) return null;
    const target = document.getElementById(t.getAttribute('href').slice(1)); if (!target) return null;
    const go = () => target.scrollIntoView({ behavior: 'smooth' });
    item.tabIndex = 0; item.setAttribute('role', 'link');
    item.addEventListener('click', go);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    return { item, target };
  }).filter(Boolean);
  if (items.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) items.forEach(x => x.item.classList.toggle('active', x.target === e.target));
    }), { rootMargin: '-30% 0px -60% 0px' });
    items.forEach(x => io.observe(x.target));
  }

  /*  home page: live values, status, safety tip  */
  const camBtn = document.getElementById("camera-feed-button");
  if (camBtn) camBtn.onclick = () => {
     window.location.href = "http://192.168.137.xx"; // ADJUSTABLE: replace xx with camera feed ip
  };

  const statusEl = document.getElementById('status');
  if (statusEl) {
    const TIPS = {
      good: 'Environmental readings are within the configured safety limits. Continue routine monitoring, ensure sensors are functioning correctly, and follow standard mine safety procedures. A GOOD status does not guarantee that the environment is completely hazard-free.',
      
      caution: 'One or more readings are approaching a warning threshold or indicate a condition that requires attention. Notify the responsible supervisor, review the readings, and follow the site\'s safety procedures. Further assessment may be necessary before continuing work in the affected area.',
      
      danger: 'One or more readings have exceeded the configured hazard thresholds. Treat the situation seriously, notify the site supervisor or control room, and follow the mine\'s emergency response and evacuation procedures. Do not re-enter a restricted area until authorized personnel confirm it is safe.'
    };
    const LABEL = { good: 'Good', caution: 'Caution', danger: 'Danger' };
    const set = (id, text) => { const n = document.getElementById(id); if (n) n.textContent = text; };
    async function refresh() {
      try {
        const d = await getLatest(), lvl = levelOf(d);
        set('temperature', `Temperature: ${d.temperature}°C`);
        set('humidity', `Humidity: ${d.humidity}%`);
        set('mq9', `CO2, CO and LPG Levels: ${d.gas}${d.gasStatus ? ' (' + d.gasStatus + ')' : ''}`);
        const when = d.ts > 1e12 ? new Date(d.ts).toLocaleString() : null;
        const note = document.querySelector('#cave-status h5');
        if (note) note.textContent = `Values are updated every 5 minutes${when ? ' · Last reading: ' + when : ''}`;
        statusEl.textContent = `Status: ${LABEL[lvl]}`; statusEl.dataset.level = lvl;
        set('safety-tips-text', TIPS[lvl]);
      } catch (e) { statusEl.textContent = 'Status: Offline'; statusEl.dataset.level = 'caution'; console.error(e); }
    }
    refresh(); setInterval(refresh, 5 * 60 * 1000);
  }
  return { getLatest, getHistory, levelOf, carousel };
})();