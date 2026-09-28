const menuButton = document.querySelector('#menu-btn');
const navigation = document.querySelector('#site-nav');

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
  navigation?.classList.toggle('open', !expanded);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Открыть меню');
  });
});

document.querySelector('#print-btn')?.addEventListener('click', () => window.print());

