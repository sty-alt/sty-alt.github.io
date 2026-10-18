const nav = document.getElementById('site-nav');
const menuBtn = document.getElementById('menu-btn');

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

const chips = document.querySelectorAll('.chip');
const works = document.querySelectorAll('#work-list li');

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const filter = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    works.forEach((item) => {
      item.hidden = filter !== 'all' && item.dataset.kind !== filter;
    });
  });
});

window.addEventListener('beforeprint', () => works.forEach((item) => { item.hidden = false; }));

document.getElementById('print-btn').addEventListener('click', () => window.print());
document.getElementById('year').textContent = new Date().getFullYear();
