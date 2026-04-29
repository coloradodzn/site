const toggle = document.querySelector('.navbar__toggle');
const social = document.querySelector('.navbar__social');

if (toggle && social) {
  toggle.addEventListener('click', () => {
    const isOpen = social.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });
}
