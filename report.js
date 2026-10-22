(async () => {
  if (!window.Chart || typeof Spooder === 'undefined') return;
  Chart.defaults.color = '#fdf0e5';
  Chart.defaults.font.family = 'Geologica, sans-serif';

  // [canvas id, data key, label]
  const CHARTS = [
    ['toxic-gases-chart', 'gas', 'Gas level (MQ-9 analog, 0-1023)'],
    ['temperature-chart', 'temperature', 'Temperature (°C)'],
    ['humidity-chart', 'humidity', 'Humidity (%)']
  ];
  const charts = {};

  function captionFor(canvasId, text) {
    const h6 = document.getElementById(canvasId)?.closest('section')?.querySelector('h6');
    if (h6) h6.textContent = text;
  }

  async function load() {
    let h;
    try { h = await Spooder.getHistory(); }
    catch (e) {
      CHARTS.forEach(([id]) => captionFor(id, 'Could not load data from Firebase'));
      return;
    }
    CHARTS.forEach(([id, key, label]) => {
      if (!charts[id]) {
        charts[id] = new Chart(document.getElementById(id), {
          type: 'line',
          data: { labels: h.labels, datasets: [{ label, data: h[key], borderColor: '#fdf0e5', backgroundColor: 'rgba(253,240,229,.15)', fill: true, tension: .35, pointRadius: 2 }] },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { boxWidth: 12 } } },
            scales: { x: { grid: { color: 'rgba(253,240,229,.12)' } }, y: { grid: { color: 'rgba(253,240,229,.12)' } } }
          }
        });
      } else {
        charts[id].data.labels = h.labels;
        charts[id].data.datasets[0].data = h[key];
        charts[id].update();
      }
      const what = { gas: 'Gas levels', temperature: 'Temperature values', humidity: 'Humidity values' }[key];
      captionFor(id, h.labels.length ? `${what} based on ${h.windowLabel}` : 'No readings found yet');
    });
  }

  load();
  setInterval(load, 60 * 1000);
})();