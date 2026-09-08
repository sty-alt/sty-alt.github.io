const menu = document.querySelector('#menu-btn');
const nav = document.querySelector('.site-header nav');
menu?.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('nav a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
document.querySelector('#print-btn')?.addEventListener('click', () => window.print());
document.querySelector('#scan-btn')?.addEventListener('click', (event) => { const output = document.querySelector('#scan-output'); output.hidden = !output.hidden; event.currentTarget.textContent = output.hidden ? '▶ Run profile scan' : '■ Close scan'; });
const items = document.querySelectorAll('.metric-grid article,.experience-card,.project-card,.side-card');
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
items.forEach((item) => observer.observe(item));
