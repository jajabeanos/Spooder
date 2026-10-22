const STORY = [
  { src: 'assets/first_meeting_pic.png', alt: 'Our team at the first FLL meeting', caption: 'Where it started' },
  { src: 'assets/building_the_mat.png', alt: 'Building the mat', caption: 'Building the mat' },
  { src: 'assets/robot_building.png', alt: 'Building the robot', caption: 'Building the robot' },
  { src: 'assets/innovation_ideation.png', alt: 'Innovation ideation', caption: 'Innovation ideation' },
  { src: 'assets/board_building.jpg', alt: 'Building our board', caption: 'Building our board' }
];
const INTERVAL = 3000; // ms between slides

(() => {
  const storyEl = document.getElementById('story-carousel');
  const dotsEl = document.getElementById('story-dots');
  if (!storyEl) return;

  const slides = STORY.map(s => {
    const slide = document.createElement('div');
    slide.className = 'story-slide';
    slide.innerHTML = `<img src="${s.src}" alt="${s.alt}"><div class="caption">${s.caption}</div>`;
    storyEl.appendChild(slide);
    return slide;
  });

  const dots = STORY.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'story-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => { show(i); restart(); });
    if (dotsEl) dotsEl.appendChild(dot);
    return dot;
  });

  let index = 0, timer = null;

  function show(n) {
    index = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }
  function restart() { clearInterval(timer); timer = setInterval(() => show(index + 1), INTERVAL); }

  // pause while the mouse is over the slideshow
  storyEl.addEventListener('mouseenter', () => clearInterval(timer));
  storyEl.addEventListener('mouseleave', restart);

  show(0);
  restart();
})();