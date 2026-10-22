// Edit these to match your real features. "why" = how it relates to the problem.
const FEATURES = [
  { title: 'Environmental Monitoring and Safety Reports', why: 'Environmental readings can be difficult to interpret quickly when information is scattered across different measurements.' },
  { title: 'Six-Legged Locomotion and Obstacle Detection', why: 'Underground passages may contain uneven surfaces and obstacles that make inspection difficult.' },
  { title: 'Harmful Gas Detection', why: 'The collected readings can be transmitted to the app, allowing users to monitor gas levels and identify potential hazards in the underground environment.' },
  { title: 'Airborne Particle Monitoring', why: 'Monitoring airborne particles can help assess air quality and potential health risks in the underground environment.' },
  { title: 'Real-Time Camera Feed', why: 'A real-time camera feed can provide visual confirmation of the environment and assist in navigation and inspection.' }
];
let fi = 0;
const ft = document.getElementById('feature'), fm = document.getElementById('feat-mapping');
function showFeature(n) {
  fi = (n + FEATURES.length) % FEATURES.length;
  ft.textContent = FEATURES[fi].title;
  fm.textContent = FEATURES[fi].why;
}
document.getElementById('prev-feature').onclick = () => showFeature(fi - 1);
document.getElementById('next-feature').onclick = () => showFeature(fi + 1);
showFeature(0);
