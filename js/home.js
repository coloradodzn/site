const homeHero = document.getElementById('home-hero');
const homeHeroBg = document.getElementById('home-hero-bg');
const homeHeroBgImg = homeHeroBg?.querySelector('.home-hero__bg-img');
const homeHeroScrim = document.getElementById('home-hero-scrim');
const homeHeroProgress = document.getElementById('home-hero-progress');
const homeNavReveal = document.getElementById('home-nav-reveal');
const homeFooter = document.getElementById('home-footer');
const workCards = homeHero ? [...homeHero.querySelectorAll('.home-work-card')] : [];

const Z_STEP = 1950;
const TARGET_Z = -200;
const BG_ZOOM_START = 1;
const BG_ZOOM_END = 2.35;
const HOME_SCRIM_MAX = 0.24;
const EXTRA_SCROLL_SEGMENTS = 3;

const DEFAULT_OFFSETS = [
  { x: -34, y: -12, rotateY: 12 },
  { x: 30, y: 8, rotateY: -10 },
  { x: -28, y: 14, rotateY: 8 },
  { x: 32, y: -10, rotateY: -11 },
  { x: -14, y: 5, rotateY: 6 },
];

const navRevealLinks = homeNavReveal
  ? [...homeNavReveal.querySelectorAll('.home-nav-reveal__link')]
  : [];

const navSourceLinks = [
  document.querySelector('#navbar-menu > li:nth-child(1) .navbar__link'),
  document.querySelector('#navbar-menu > li:nth-child(2) .navbar__link'),
  document.getElementById('navbar-portfolio-trigger'),
  document.querySelector('#navbar-menu > li:nth-child(4) .navbar__link'),
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function getCardCount() {
  return workCards.length || Number.parseInt(homeHero?.dataset.cardCount || '5', 10);
}

function getTotalSegments() {
  return getCardCount() + EXTRA_SCROLL_SEGMENTS;
}

function getSpreadMultiplier() {
  if (window.innerWidth >= 1024) return 1.85;
  if (window.innerWidth >= 768) return 1.15;
  return 0.35;
}

function getCardLayout(card, index) {
  const fallback = DEFAULT_OFFSETS[index % DEFAULT_OFFSETS.length];

  return {
    x: Number.parseFloat(card.dataset.offsetX ?? fallback.x),
    y: Number.parseFloat(card.dataset.offsetY ?? fallback.y),
    rotateY: Number.parseFloat(card.dataset.rotateY ?? fallback.rotateY),
  };
}

function getHeroProgress() {
  if (!homeHero) return 0;

  const scrollable = homeHero.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;

  const rect = homeHero.getBoundingClientRect();
  return clamp(-rect.top / scrollable, 0, 1);
}

function getScrollPhases(progress) {
  const cardCount = getCardCount();
  const totalSegments = getTotalSegments();
  const pos = progress * totalSegments;

  let cardPhase = clamp(pos / cardCount, 0, 1);
  let exitPhase = 0;
  let navPhase = 0;
  let footerPhase = 0;

  if (pos > cardCount) {
    cardPhase = 1;
    exitPhase = clamp(pos - cardCount, 0, 1);
  }

  if (pos > cardCount + 1) {
    exitPhase = 1;
    navPhase = clamp(pos - cardCount - 1, 0, 1);
  }

  if (pos > cardCount + 2) {
    navPhase = 1;
    footerPhase = clamp(pos - cardCount - 2, 0, 1);
  }

  const tunnelPhase = clamp((cardPhase - 0.06) / 0.94, 0, 1);

  return { cardPhase, tunnelPhase, exitPhase, navPhase, footerPhase, pos };
}

function getSettlePhase(pos, cardCount) {
  if (pos <= cardCount) return 0;
  if (pos >= cardCount + 1) return 1;
  return easeOutCubic(pos - cardCount);
}

function updateHomeBackground(settleEased, tunnelBgProgress) {
  if (!homeHeroBgImg) return;

  const bgScale = BG_ZOOM_START + (BG_ZOOM_END - BG_ZOOM_START) * tunnelBgProgress;

  homeHeroBgImg.style.transform = `scale(${bgScale})`;

  if (homeHeroScrim) {
    homeHeroScrim.style.opacity = String(settleEased * HOME_SCRIM_MAX);
  }
}

function getCardTransform(z, layout, depth) {
  const spreadFactor = (1 - depth) * getSpreadMultiplier();
  const x = (layout.x / 100) * window.innerWidth * spreadFactor;
  const y = (layout.y / 100) * window.innerHeight * spreadFactor;
  const rotateY = layout.rotateY * spreadFactor;
  const scale = clamp(depth * 0.22 + 0.78, 0.78, 1.02);

  return `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
}

function getNavRowTargets(count) {
  const centerX = window.innerWidth * 0.5;
  const centerY = window.innerHeight * 0.5;
  const gap = window.innerWidth < 480
    ? Math.max(76, window.innerWidth * 0.26)
    : window.innerWidth < 768
      ? 120
      : Math.min(200, window.innerWidth * 0.11);
  const span = (count - 1) * gap;

  return Array.from({ length: count }, (_, index) => ({
    x: centerX - span / 2 + index * gap,
    y: centerY,
  }));
}

function updateNavReveal(navPhase) {
  if (!navRevealLinks.length) return;

  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  const targets = getNavRowTargets(navRevealLinks.length);
  const eased = easeOutCubic(navPhase);
  const active = navPhase > 0.03;

  document.body.classList.toggle('home-nav-reveal-active', active);
  homeHero?.classList.toggle('home-hero--nav-reveal', active);
  homeNavReveal?.setAttribute('aria-hidden', String(!active));

  navRevealLinks.forEach((link, index) => {
    const target = targets[index];
    const source = navSourceLinks[index];
    let startX = target.x;
    let startY = target.y;

    if (isDesktop && source) {
      const rect = source.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    } else if (!isDesktop) {
      startY = target.y + 48;
    }

    const x = startX + (target.x - startX) * eased;
    const y = startY + (target.y - startY) * eased;
    const scale = 0.94 + eased * 0.12;
    const opacity = Math.min(1, eased * 1.1);

    link.style.left = `${x}px`;
    link.style.top = `${y}px`;
    link.style.transform = `translate(-50%, -50%) scale(${scale})`;
    link.style.opacity = String(opacity);
    link.classList.toggle('is-active', navPhase > 0.4);
  });
}

function updateHomeFooter(footerPhase) {
  if (!homeFooter) return;

  const eased = easeOutCubic(footerPhase);

  homeFooter.style.opacity = String(eased);
  homeFooter.style.pointerEvents = footerPhase > 0.35 ? 'auto' : 'none';
  homeFooter.style.transform = `translateY(${(1 - eased) * 1.25}rem)`;
  homeFooter.setAttribute('aria-hidden', String(footerPhase < 0.2));
}

function updateHomeExperience() {
  if (!homeHero || !workCards.length) return;

  const cardCount = getCardCount();
  const progress = getHeroProgress();
  const { tunnelPhase, exitPhase, navPhase, footerPhase, pos } = getScrollPhases(progress);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollOffset = tunnelPhase * Z_STEP * cardCount + exitPhase * Z_STEP * 1.35;
  const cardVisibility = exitPhase >= 1 || navPhase > 0 ? 0 : 1 - easeOutCubic(exitPhase);
  const settleEased = getSettlePhase(pos, cardCount);
  const tunnelBgProgress = clamp((progress * getTotalSegments()) / (cardCount + 1), 0, 1);

  if (reducedMotion) {
    const activeIndex = Math.min(cardCount - 1, Math.floor(tunnelPhase * cardCount));
    const spreadFactor = getSpreadMultiplier();

    updateHomeBackground(settleEased, tunnelBgProgress);

    workCards.forEach((card, index) => {
      const layout = getCardLayout(card, index);
      const isActive = index === activeIndex && exitPhase < 0.15 && navPhase === 0;
      const spread = isActive ? 0 : spreadFactor;
      const x = (layout.x / 100) * window.innerWidth * spread;
      const y = (layout.y / 100) * window.innerHeight * spread;

      card.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${isActive ? 1 : 0.88})`;
      card.style.opacity = isActive ? String(cardVisibility) : String(0.2 * cardVisibility);
      card.classList.toggle('is-active', isActive);
    });

    updateNavReveal(navPhase);
    updateHomeFooter(footerPhase);

    if (homeHeroProgress) homeHeroProgress.textContent = `${Math.round(progress * 100)}%`;
    document.body.classList.toggle('home-flow-complete', footerPhase > 0.2 || navPhase > 0.5);
    return;
  }

  updateHomeBackground(settleEased, tunnelBgProgress);

  let closestIndex = 0;
  let closestDistance = Infinity;

  workCards.forEach((card, index) => {
    const layout = getCardLayout(card, index);
    const z = (index + 1) * -Z_STEP + scrollOffset;
    const distance = Math.abs(z - TARGET_Z);
    const depth = clamp(1 - distance / (Z_STEP * 0.92), 0, 1);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }

    card.style.transform = getCardTransform(z, layout, depth);
    const cardOpacity = tunnelPhase > 0 ? clamp(depth * 0.9 + 0.08, 0, 1) : 0;
    card.style.opacity = String(cardOpacity * cardVisibility);
    card.classList.toggle('is-active', index === closestIndex && exitPhase < 0.15 && navPhase === 0);
  });

  updateNavReveal(navPhase);
  updateHomeFooter(footerPhase);

  if (homeHeroProgress) {
    homeHeroProgress.textContent = `${Math.round(progress * 100)}%`;
  }

  document.body.classList.toggle('home-flow-complete', footerPhase > 0.15 || navPhase > 0.12);
}

function setHeroHeight() {
  if (!homeHero) return;
  const totalSegments = getTotalSegments();
  homeHero.style.height = `${totalSegments * 100}vh`;
  homeHero.style.height = `${totalSegments * 100}dvh`;
}

if (homeHero) {
  setHeroHeight();
  updateHomeExperience();
  window.addEventListener('scroll', updateHomeExperience, { passive: true });
  window.addEventListener('resize', () => {
    setHeroHeight();
    updateHomeExperience();
  });
}
