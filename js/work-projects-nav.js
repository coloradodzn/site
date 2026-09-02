const PORTFOLIO_WORKS = [
  {
    href: 'lavoro-1.html',
    nameKey: 'work1.name',
    typeKey: 'work1.type',
    name: 'Logo Collection',
    type: 'Logo Design',
    image: 'img/LogoDesign/Logo folio.png',
    tone: null,
  },
  {
    href: 'lavoro-2.html',
    name: 'Calyy',
    type: 'Visual campaign',
    image: null,
    tone: 2,
  },
  {
    href: 'lavoro-3.html',
    nameKey: 'work3.name',
    typeKey: 'work3.type',
    name: 'Analisi del Cinema',
    type: 'Film study',
    image: null,
    tone: 3,
  },
  {
    href: 'lavoro-5.html',
    name: 'Axit Collection',
    typeKey: 'work5.type',
    name: 'Axit Collection',
    type: 'Visual Communication',
    image: null,
    tone: 5,
  },
];

function initWorkProjectsNav() {
  const main = document.querySelector('main');
  if (!main || main.querySelector('.work-projects-nav')) return;

  const currentPage = window.location.pathname.split('/').pop() || '';
  const nav = document.createElement('nav');
  nav.className = 'work-projects-nav';
  nav.setAttribute('aria-label', 'Portfolio projects');
  nav.setAttribute('data-i18n-aria-label', 'a11y.work.nav');

  const label = document.createElement('p');
  label.className = 'work-projects-nav__label';
  label.setAttribute('data-i18n', 'work.nav.label');
  label.textContent = 'Altri progetti';

  const track = document.createElement('div');
  track.className = 'work-projects-nav__track';

  PORTFOLIO_WORKS.forEach((work) => {
    const isCurrent = work.href === currentPage;
    const link = document.createElement('a');
    link.href = work.href;
    link.className = `work-projects-nav__card${isCurrent ? ' is-current' : ''}`;
    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    }

    const media = document.createElement('span');
    media.className = 'work-projects-nav__media';
    if (work.image) {
      const img = document.createElement('img');
      img.src = work.image;
      img.alt = '';
      img.width = 320;
      img.height = 180;
      img.decoding = 'async';
      media.appendChild(img);
    } else if (work.tone) {
      media.classList.add(`work-projects-nav__media--tone-${work.tone}`);
      media.setAttribute('aria-hidden', 'true');
    }

    const meta = document.createElement('span');
    meta.className = 'work-projects-nav__meta';

    const name = document.createElement('span');
    name.className = 'work-projects-nav__name';
    if (work.nameKey) name.setAttribute('data-i18n', work.nameKey);
    name.textContent = work.name;

    const type = document.createElement('span');
    type.className = 'work-projects-nav__type';
    if (work.typeKey) type.setAttribute('data-i18n', work.typeKey);
    type.textContent = work.type;

    meta.append(name, type);
    link.append(media, meta);
    track.appendChild(link);
  });

  nav.append(label, track);

  const gallery = main.querySelector('.work-gallery');
  if (gallery) {
    gallery.appendChild(nav);
    return;
  }

  main.appendChild(nav);
}

initWorkProjectsNav();
document.addEventListener('colorado:pagechange', initWorkProjectsNav);

if (typeof window.coloradoRefreshI18n === 'function') {
  window.coloradoRefreshI18n();
}
