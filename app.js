const nav = document.getElementById('site-nav');
const menuBtn = document.getElementById('menu-btn');
const header = document.getElementById('site-header');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Меню */
const setMenu = (open) => {
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
};

menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

/* Шапка: прозрачная над узором, плотная после прокрутки */
const syncHeader = () => header.classList.toggle('is-solid', window.scrollY > 24);
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

/* Фильтр списка работ */
const chips = document.querySelectorAll('.chip');
const works = document.querySelectorAll('#work-list li');
works.forEach((item, i) => { item.style.viewTransitionName = `work-${i}`; });

const applyFilter = (filter) => {
  works.forEach((item) => {
    item.hidden = filter !== 'all' && item.dataset.kind !== filter;
  });
};

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    const run = () => applyFilter(chip.dataset.filter);
    if (document.startViewTransition && !reducedMotion) document.startViewTransition(run);
    else run();
  });
});

window.addEventListener('beforeprint', () => works.forEach((item) => { item.hidden = false; }));
document.getElementById('year').textContent = new Date().getFullYear();

/* Наклон скриншотов за курсором */
const initTilt = (box) => {
  box.addEventListener('pointermove', (event) => {
    const rect = box.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    box.classList.add('is-tilting');
    box.style.setProperty('--ry', `${(px * 7).toFixed(2)}deg`);
    box.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`);
  });
  box.addEventListener('pointerleave', () => {
    box.classList.remove('is-tilting');
    box.style.setProperty('--ry', '0deg');
    box.style.setProperty('--rx', '0deg');
  });
};
if (finePointer && !reducedMotion) document.querySelectorAll('[data-tilt]').forEach(initTilt);

/* Заголовок по словам: каждое слово выезжает из-под своей строки */
const splitWords = (el) => {
  const words = el.textContent.split(' ');
  el.setAttribute('aria-label', el.textContent);
  el.textContent = '';
  return words.map((word, i) => {
    const outer = document.createElement('span');
    const inner = document.createElement('span');
    outer.className = 'w';
    outer.setAttribute('aria-hidden', 'true');
    inner.textContent = word;
    outer.append(inner);
    el.append(outer, i < words.length - 1 ? ' ' : '');
    return inner;
  });
};

const initMotion = () => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || reducedMotion || window.matchMedia('print').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  const words = splitWords(document.getElementById('hero-title'));
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from(words, { yPercent: 115, duration: 1.1, stagger: 0.055 })
    .from('.hero-copy > :not(h1):not(.print-only)', { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.45)
    .from('.log', { y: 36, autoAlpha: 0, duration: 1 }, 0.55);

  gsap.from('#stage', {
    rotateX: 24,
    scale: 0.9,
    y: 70,
    ease: 'none',
    scrollTrigger: { trigger: '.stage-zone', start: 'top 100%', end: 'top 30%', scrub: 0.6 },
  });

  gsap.utils.toArray('.case-media').forEach((media) => {
    gsap.from(media, {
      clipPath: 'inset(12% 8% 12% 8% round 28px)',
      ease: 'none',
      scrollTrigger: { trigger: media, start: 'top 95%', end: 'top 45%', scrub: 0.5 },
    });
  });

  window.addEventListener('beforeprint', () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.set('#stage, .case-media, .hero-copy > *, .log', { clearProps: 'all' });
  });
};
initMotion();
