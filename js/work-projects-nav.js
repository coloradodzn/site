const PORTFOLIO_WORKS = [
  {
    href: 'lavoro-1.html',
    nameKey: 'work1.name',
    typeKey: 'work1.type',
    name: 'Logo Collection',
    type: 'Logo Design',
    area: 'logo',
    image: 'img/LogoDesign/Logo-folio.png',
    tone: null,
  },
  {
    href: 'lavoro-2.html',
    nameKey: 'gallery.work2.title',
    typeKey: 'gallery.work2.category',
    name: 'Calyy',
    type: 'Comunicazione visiva',
    area: 'visual',
    image: null,
    tone: 2,
  },
  {
    href: 'lavoro-11.html',
    nameKey: 'gallery.work11.title',
    typeKey: 'gallery.work11.category',
    name: 'Locked',
    type: 'Comunicazione visiva',
    area: 'visual',
    image: null,
    tone: 4,
  },
  {
    href: 'lavoro-3.html',
    nameKey: 'work3.name',
    typeKey: 'work3.type',
    name: 'Analisi del Cinema',
    type: 'Film study',
    area: 'research',
    image: 'img/Cinema/nativi back.jpg',
    tone: null,
  },
  {
    href: 'lavoro-4.html',
    nameKey: 'work4.name',
    typeKey: 'work4.type',
    name: 'IED Scholarship',
    type: 'Concept Design',
    area: 'concept',
    image: 'img/IED/miniatura.jpg',
    tone: null,
  },
  {
    href: 'lavoro-5.html',
    nameKey: 'work5.name',
    typeKey: 'work5.type',
    name: 'Axit Collection',
    type: 'Visual Communication',
    area: 'visual',
    image: 'img/Axit Social Communication/axitback.jpg',
    tone: null,
  },
  {
    href: 'lavoro-6.html',
    nameKey: 'work6.name',
    typeKey: 'work6.type',
    name: 'Patagonia',
    type: 'Creative Direction-Concept Design',
    area: 'concept',
    image: 'img/Patagonia/patagonia_min.webp',
    tone: null,
  },
  {
    href: 'lavoro-7.html',
    nameKey: 'work7.name',
    typeKey: 'work7.type',
    name: 'B3bon',
    type: 'Motion Design',
    area: 'motion',
    image: null,
    tone: 3,
  },
  {
    href: 'lavoro-8.html',
    nameKey: 'work8.name',
    typeKey: 'work8.type',
    name: 'Smoove',
    type: 'Motion Design',
    area: 'motion',
    image: null,
    tone: 4,
  },
  {
    href: 'lavoro-9.html',
    nameKey: 'work9.name',
    typeKey: 'work9.type',
    name: 'TGR',
    type: 'Motion Design',
    area: 'motion',
    image: null,
    tone: 5,
  },
  {
    href: 'lavoro-10.html',
    nameKey: 'work10.name',
    typeKey: 'work10.type',
    name: 'Plix',
    type: 'Motion Design',
    area: 'motion',
    image: null,
    tone: 3,
  },
];

function initWorkProjectsNav() {
  const main = document.querySelector('main');
  if (!main) return;

  const existing = main.querySelector('.work-projects-nav');
  if (existing) existing.remove();

  const currentPage = window.location.pathname.split('/').pop() || '';
  const currentWork = PORTFOLIO_WORKS.find((work) => work.href === currentPage);
  if (!currentWork) return;

  const relatedWorks = PORTFOLIO_WORKS.filter(
    (work) => work.area === currentWork.area && work.href !== currentPage
  );
  if (relatedWorks.length < 1) return;

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

  relatedWorks.forEach((work) => {
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
      if (work.video || /\.mp4($|\?)/i.test(work.image)) {
        const video = document.createElement('video');
        video.src = work.image;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.width = 320;
        video.height = 180;
        media.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = work.image;
        img.alt = '';
        img.width = 320;
        img.height = 180;
        img.decoding = 'async';
        media.appendChild(img);
      }
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

  const gallery = main.querySelector('.work-gallery:not(.work-gallery--embedded)');
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
