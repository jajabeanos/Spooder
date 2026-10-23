const RESOURCES = {
  'resources-problem': [
    { title: 'Pneumoconiosis cases are at a 50-year high in Appalachia', url: 'https://www.theguardian.com/us-news/2026/sep/20/us-coalminers-black-lung-disease' },
    { title: 'Carbon Dioxide, Caves and You', url: 'https://wasg.org.au/specialties/environmental-hazards/carbon-dioxide-paper' }
  ],
  'resources-existing': [
    { title: 'Self-Driving Algorithm and Location Estimation Method for Small Environmental Monitoring Robot in Underground Mines', url: 'https://www.techscience.com/CMES/v127n3/42607/html' },
    { title: 'A fault tolerant gait for a hexapod robot over uneven terrain', url: 'https://ieeexplore.ieee.org/document/826957/citations#citations' }
  ]
};
Object.entries(RESOURCES).forEach(([id, list]) => {
  const btn = document.getElementById(id); if (!btn) return;
  const ul = document.createElement('ul');
  ul.className = 'resource-list'; ul.hidden = true; ul.id = id + '-list';
  ul.innerHTML = list.map(r => `<li><a href="${r.url}" target="_blank" rel="noopener">${r.title}</a></li>`).join('');
  btn.after(ul);
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', ul.id);
  btn.addEventListener('click', () => {
    ul.hidden = !ul.hidden;
    btn.setAttribute('aria-expanded', String(!ul.hidden));
    btn.textContent = ul.hidden ? 'View Resources' : 'Hide Resources';
  });
});
