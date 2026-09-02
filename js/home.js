let homeHero = document.getElementById('home-hero');
let homeHeroBg = document.getElementById('home-hero-bg');
let homeHeroBgImg = homeHeroBg?.querySelector('.home-hero__bg-img');
let homeHeroScrim = document.getElementById('home-hero-scrim');
let homeHeroProgress = document.getElementById('home-hero-progress');
let homeNavReveal = document.getElementById('home-nav-reveal');
let homeFooter = document.getElementById('home-footer');
let homeClaim = document.getElementById('home-hero-claim');
let homeClaimTrigger = document.getElementById('home-hero-claim-trigger');
let workCards = homeHero ? [...homeHero.querySelectorAll('.home-work-card')] : [];

let claimShattered = false;
let claimShatterAnimating = false;
let claimEnterPlayed = false;
let lastProgressPercent = 0;
let lastHeroProgress = 0;
let navAutoDrive = false;
let navAutoStart = 0;

const Z_STEP = 1950;
const TARGET_Z = -200;
const BG_ZOOM_START = 1;
const BG_ZOOM_END = 2.35;
const HOME_SCRIM_MAX = 0.24;
const EXTRA_SCROLL_SEGMENTS = 4;
const CARD_CLICK_OPACITY = 0.4;
const CARD_CLICK_DEPTH = 0.36;
const CARD_HIDE_PERCENT = 62;
const CLAIM_SHOW_PERCENT = 62;
const CLAIM_SHATTER_START_PERCENT = 63;
const CLAIM_SHATTER_END_PERCENT = 68;
const NAV_START_PERCENT = 68;
const NAV_CENTER_PERCENT = 80;
const FOOTER_START_PERCENT = 88;
const FOOTER_END_PERCENT = 97;
const CLAIM_ANIM_MS = 850;

const DEFAULT_OFFSETS = [
  { x: -34, y: -12, rotateY: 12 },
  { x: 30, y: 8, rotateY: -10 },
  { x: -28, y: 14, rotateY: 8 },
  { x: 32, y: -10, rotateY: -11 },
  { x: -14, y: 5, rotateY: 6 },
];

let navRevealLinks = [];
let navSourceLinks = [];
let homeAbort = new AbortController();

function refreshHomeRefs() {
  homeHero = document.getElementById('home-hero');
  homeHeroBg = document.getElementById('home-hero-bg');
  homeHeroBgImg = homeHeroBg?.querySelector('.home-hero__bg-img');
  homeHeroScrim = document.getElementById('home-hero-scrim');
  homeHeroProgress = document.getElementById('home-hero-progress');
  homeNavReveal = document.getElementById('home-nav-reveal');
  homeFooter = document.getElementById('home-footer');
  homeClaim = document.getElementById('home-hero-claim');
  homeClaimTrigger = document.getElementById('home-hero-claim-trigger');
  workCards = homeHero ? [...homeHero.querySelectorAll('.home-work-card')] : [];
  navRevealLinks = homeNavReveal
    ? [...homeNavReveal.querySelectorAll('.home-nav-reveal__link')]
    : [];
  navSourceLinks = [
    document.querySelector('#navbar-menu > li:nth-child(1) .navbar__link'),
    document.querySelector('#navbar-menu > li:nth-child(2) .navbar__link'),
    document.getElementById('navbar-portfolio-trigger'),
    document.querySelector('#navbar-menu > li:nth-child(4) .navbar__link'),
  ];
}

refreshHomeRefs();

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
  let claimPhase = 0;
  let navPhase = 0;
  let footerPhase = 0;

  if (pos > cardCount) {
    cardPhase = 1;
    exitPhase = clamp(pos - cardCount, 0, 1);
  }

  const progressPercent = Math.round(progress * 100);

  if (progressPercent >= CLAIM_SHATTER_START_PERCENT) {
    claimPhase = clamp(
      (progressPercent - CLAIM_SHATTER_START_PERCENT)
        / (CLAIM_SHATTER_END_PERCENT - CLAIM_SHATTER_START_PERCENT),
      0,
      1
    );
  }

  if (pos > cardCount + 1) {
    exitPhase = 1;
  }

  if (progressPercent >= NAV_START_PERCENT) {
    navPhase = clamp(
      (progressPercent - NAV_START_PERCENT) / (NAV_CENTER_PERCENT - NAV_START_PERCENT),
      0,
      1
    );
  }

  if (progressPercent >= NAV_CENTER_PERCENT) {
    navPhase = 1;
    footerPhase = clamp(
      (progressPercent - FOOTER_START_PERCENT) / (FOOTER_END_PERCENT - FOOTER_START_PERCENT),
      0,
      1
    );
  }

  const tunnelPhase = clamp((cardPhase - 0.06) / 0.94, 0, 1);

  return { cardPhase, tunnelPhase, exitPhase, claimPhase, navPhase, footerPhase, pos };
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
  const isMobile = window.innerWidth < 768;
  const centerY = window.innerHeight * 0.5;

  if (isMobile) {
    const edgeInset = 20;
    const widths = Array.from({ length: count }, (_, index) => {
      const link = navRevealLinks[index];
      if (!link) return 56;
      const rect = link.getBoundingClientRect();
      return rect.width > 0 ? rect.width : 56;
    });
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    const available = window.innerWidth - edgeInset * 2;
    const gap = count > 1 ? Math.max(10, (available - totalWidth) / (count - 1)) : 0;
    let cursor = edgeInset;

    return widths.map((width) => {
      const x = cursor + width / 2;
      cursor += width + gap;
      return { x, y: centerY };
    });
  }

  const centerX = window.innerWidth * 0.5;
  const gap = window.innerWidth < 480
    ? Math.max(76, window.innerWidth * 0.26)
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
      startY = target.y + 32;
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

function canClickCard({ visibleOpacity, exitPhase, claimPhase, navPhase, z = null, depth = null }) {
  if (exitPhase >= 0.15 || claimPhase > 0 || navPhase > 0) return false;
  if (z !== null && z > TARGET_Z) return false;

  const meetsOpacity = visibleOpacity >= CARD_CLICK_OPACITY;
  const meetsDepth = depth !== null && depth >= CARD_CLICK_DEPTH;

  return meetsOpacity || meetsDepth;
}

function storeCardInteraction(card, state) {
  card.__interaction = state;
}

function getCardAtPoint(clientX, clientY) {
  let bestCard = null;
  let bestDepth = -1;

  workCards.forEach((card) => {
    const state = card.__interaction;
    if (!state?.isClickable) return;

    const rect = card.getBoundingClientRect();
    if (
      clientX < rect.left
      || clientX > rect.right
      || clientY < rect.top
      || clientY > rect.bottom
    ) return;

    if (state.depth > bestDepth) {
      bestDepth = state.depth;
      bestCard = card;
    }
  });

  return bestCard;
}

function setCardInteractive(card, isClickable, zIndex = 0, delegateToScene = false) {
  const link = card.querySelector('.home-work-card__link');
  card.classList.toggle('is-clickable', isClickable);

  if (delegateToScene) {
    card.style.pointerEvents = 'none';
    if (link) link.style.pointerEvents = 'none';
  } else {
    card.style.pointerEvents = isClickable ? 'auto' : 'none';
    if (link) link.style.pointerEvents = isClickable ? 'auto' : 'none';
  }

  card.style.zIndex = isClickable ? String(zIndex) : '';
}

function resetClaimFragments() {
  if (!homeClaimTrigger) return;
  delete homeClaimTrigger.dataset.fragmentsReady;
  delete homeClaimTrigger.dataset.fragmentCount;
}

function rebuildClaimLines() {
  if (!homeClaimTrigger) return;

  homeClaimTrigger.innerHTML = `
    <span class="home-hero-claim__line home-hero-claim__line--lead" data-i18n="home.claim.lead"></span>
    <span class="home-hero-claim__line home-hero-claim__line--mid" data-i18n="home.claim.mid"></span>
    <span class="home-hero-claim__line home-hero-claim__line--accent">
      <span class="home-hero-claim__clarity" data-i18n="home.claim.clarity"></span><span class="home-hero-claim__and" data-i18n="home.claim.and"></span><span class="home-hero-claim__vision" data-i18n="home.claim.vision"></span>
    </span>
  `;
  resetClaimFragments();
}

function prepareClaimFragments() {
  if (!homeClaimTrigger) return;
  if (homeClaimTrigger.dataset.fragmentsReady === '1') return;

  let delayIndex = 0;

  homeClaimTrigger.querySelectorAll('.home-hero-claim__line').forEach((line) => {
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      const text = node.textContent;
      if (!text) return;

      const replacement = document.createDocumentFragment();

      [...text].forEach((char) => {
        const span = document.createElement('span');
        span.className = 'home-hero-claim__fragment';
        span.textContent = char === ' ' ? '\u00a0' : char;
        span.dataset.delayIndex = String(delayIndex);
        span.style.setProperty('--delay', `${delayIndex * 0.01}s`);
        if (char.trim()) delayIndex += 1;
        replacement.appendChild(span);
      });

      node.parentNode.replaceChild(replacement, node);
    });
  });

  homeClaimTrigger.dataset.fragmentsReady = '1';
  homeClaimTrigger.dataset.fragmentCount = String(Math.max(delayIndex, 1));
}

function assignFragmentScatter(fragment) {
  if (!fragment.dataset.tx) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 48 + Math.random() * 200;
    fragment.dataset.tx = String(Math.cos(angle) * distance);
    fragment.dataset.ty = String(Math.sin(angle) * distance);
    fragment.dataset.rot = String((Math.random() - 0.5) * 720);
  }

  fragment.style.setProperty('--tx', `${fragment.dataset.tx}px`);
  fragment.style.setProperty('--ty', `${fragment.dataset.ty}px`);
  fragment.style.setProperty('--rot', `${fragment.dataset.rot}deg`);
}

function setFragmentScatteredState(fragment) {
  assignFragmentScatter(fragment);
  fragment.style.opacity = '0';
  fragment.style.transform = `translate3d(${fragment.dataset.tx}px, ${fragment.dataset.ty}px, 0) rotate(${fragment.dataset.rot}deg) scale(0.4)`;
}

function releaseFragmentReassemble(fragment) {
  fragment.style.removeProperty('opacity');
  fragment.style.removeProperty('transform');
  fragment.style.animation = '';
}

function clearFragmentMotionStyles() {
  homeClaim?.querySelectorAll('.home-hero-claim__fragment').forEach((fragment) => {
    fragment.style.animation = '';
    fragment.style.removeProperty('transform');
    fragment.style.removeProperty('opacity');
  });
}

function restoreClaimContent() {
  if (!homeClaimTrigger || !homeClaim) return;

  resetClaimFragments();
  homeClaim.classList.remove('is-shattered', 'is-shattering', 'is-reassembling');
  homeClaim.style.opacity = '';

  const lang = document.documentElement.lang || 'en';
  if (typeof i18nApply === 'function') {
    i18nApply(lang);
  }
}

function triggerClaimShatter(fromClick = false) {
  if (claimShattered || claimShatterAnimating || !homeClaim) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    claimShattered = true;
    homeClaim.classList.remove('is-visible', 'is-shattering', 'is-reassembling');
    homeClaim.classList.add('is-shattered');
    homeClaim.style.opacity = '0';
    homeClaim.setAttribute('aria-hidden', 'true');
    if (fromClick) {
      navAutoDrive = true;
      navAutoStart = performance.now();
    }
    updateHomeExperience();
    return;
  }

  prepareClaimFragments();
  claimShatterAnimating = true;

  homeClaim.classList.remove('is-reassembling', 'is-shattered');
  homeClaim.classList.add('is-visible', 'is-shattering');
  homeClaim.style.opacity = '1';
  homeClaim.setAttribute('aria-hidden', 'false');

  const fragments = homeClaim.querySelectorAll('.home-hero-claim__fragment');
  fragments.forEach((fragment) => {
    const delayIndex = Number.parseInt(fragment.dataset.delayIndex || '0', 10);
    fragment.style.animation = '';
    fragment.style.setProperty('--delay', `${delayIndex * 0.01}s`);
    assignFragmentScatter(fragment);
  });

  void homeClaim.offsetWidth;

  window.setTimeout(() => {
    claimShatterAnimating = false;
    claimShattered = true;
    homeClaim.classList.remove('is-visible', 'is-shattering');
    homeClaim.classList.add('is-shattered');
    homeClaim.style.opacity = '0';
    homeClaim.setAttribute('aria-hidden', 'true');
    if (fromClick) {
      navAutoDrive = true;
      navAutoStart = performance.now();
    }
    updateHomeExperience();
  }, CLAIM_ANIM_MS);
}

function triggerClaimReassemble() {
  if (!homeClaim || claimShatterAnimating || !claimShattered) return;

  const fragments = homeClaim.querySelectorAll('.home-hero-claim__fragment');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !fragments.length) {
    claimShattered = false;
    navAutoDrive = false;
    lastProgressPercent = 0;
    restoreClaimContent();
    updateHomeExperience();
    return;
  }

  claimShatterAnimating = true;
  claimShattered = false;
  navAutoDrive = false;

  homeClaim.classList.remove('is-shattered', 'is-shattering', 'is-visible', 'is-reassembling');
  homeClaim.style.opacity = '0';
  homeClaim.setAttribute('aria-hidden', 'true');

  const total = fragments.length;
  fragments.forEach((fragment) => {
    const delayIndex = Number.parseInt(fragment.dataset.delayIndex || '0', 10);
    fragment.style.animation = 'none';
    setFragmentScatteredState(fragment);
    fragment.style.setProperty('--delay', `${(total - 1 - delayIndex) * 0.008}s`);
  });

  void homeClaim.offsetWidth;

  homeClaim.classList.add('is-visible', 'is-reassembling');
  homeClaim.style.opacity = '1';
  homeClaim.setAttribute('aria-hidden', 'false');

  fragments.forEach((fragment) => {
    releaseFragmentReassemble(fragment);
  });

  window.setTimeout(() => {
    claimShatterAnimating = false;
    homeClaim.classList.remove('is-reassembling');
    clearFragmentMotionStyles();
    updateHomeExperience();
  }, CLAIM_ANIM_MS);
}

function updateHomeClaim(progress, scrollingBack) {
  if (!homeClaim || claimShatterAnimating) return;

  const progressPercent = Math.round(progress * 100);

  if (claimShattered) {
    homeClaim.classList.remove('is-visible', 'is-shattering', 'is-reassembling');
    homeClaim.classList.add('is-shattered');
    homeClaim.style.opacity = '0';
    homeClaim.setAttribute('aria-hidden', 'true');
    lastProgressPercent = progressPercent;
    return;
  }

  if (progressPercent < CLAIM_SHOW_PERCENT) {
    if (!homeClaimTrigger?.dataset.fragmentsReady) {
      claimEnterPlayed = false;
    }
    homeClaim.classList.remove('is-visible', 'is-shattering', 'is-reassembling', 'is-shattered');
    homeClaim.style.opacity = '0';
    homeClaim.setAttribute('aria-hidden', 'true');
    lastProgressPercent = progressPercent;
    return;
  }

  const opacity = easeOutCubic(clamp((progressPercent - (CLAIM_SHOW_PERCENT - 1)) / 2, 0, 1));

  if (!claimEnterPlayed) {
    claimEnterPlayed = true;
    if (!homeClaimTrigger?.dataset.fragmentsReady) {
      homeClaimTrigger?.classList.add('is-entering');
    }
  }

  homeClaim.classList.remove('is-shattered', 'is-shattering', 'is-reassembling');
  homeClaim.classList.add('is-visible');
  homeClaim.style.opacity = String(opacity);
  homeClaim.setAttribute('aria-hidden', String(opacity < 0.08));

  const crossedShatterStart = progressPercent >= CLAIM_SHATTER_START_PERCENT
    && lastProgressPercent < CLAIM_SHATTER_START_PERCENT;

  if (
    !scrollingBack
    && progressPercent >= CLAIM_SHATTER_START_PERCENT
    && (crossedShatterStart || !homeClaimTrigger?.dataset.fragmentsReady)
  ) {
    triggerClaimShatter(false);
  }

  lastProgressPercent = progressPercent;
}

function getDrivenNavPhase(navPhase) {
  if (!navAutoDrive) return navPhase;

  const autoPhase = easeOutCubic(clamp((performance.now() - navAutoStart) / 1200, 0, 1));
  if (autoPhase >= 1) navAutoDrive = false;
  return Math.max(navPhase, autoPhase);
}

function getDrivenFooterPhase(_navPhase, footerPhase) {
  return footerPhase;
}

function initClaimInteraction(signal) {
  if (!homeClaimTrigger) return;

  homeClaimTrigger.addEventListener('animationend', (event) => {
    if (event.animationName === 'home-claim-enter') {
      homeClaimTrigger.classList.remove('is-entering');
    }
  }, { signal });

  homeClaimTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    if (!homeClaim?.classList.contains('is-visible')) return;
    triggerClaimShatter(true);
  }, { signal });

  window.addEventListener('colorado:langchange', () => {
    if (!homeClaimTrigger?.querySelector('.home-hero-claim__fragment')) return;
    claimShattered = false;
    claimShatterAnimating = false;
    restoreClaimContent();
    const lang = document.documentElement.lang || 'en';
    if (typeof i18nApply === 'function') {
      i18nApply(lang);
    }
    updateHomeExperience();
  }, { signal });
}

function updateHomeExperience() {
  if (!homeHero || !workCards.length) return;

  const cardCount = getCardCount();
  const progress = getHeroProgress();
  const scrollingBack = progress < lastHeroProgress - 0.0001;
  lastHeroProgress = progress;
  const progressPercent = Math.round(progress * 100);
  let phases = getScrollPhases(progress);

  if (
    claimShattered
    && !claimShatterAnimating
    && scrollingBack
    && progressPercent < CLAIM_SHATTER_END_PERCENT
  ) {
    triggerClaimReassemble();
    phases = getScrollPhases(progress);
  }

  const { tunnelPhase, exitPhase, claimPhase, navPhase, footerPhase, pos } = phases;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollOffset = tunnelPhase * Z_STEP * cardCount + exitPhase * Z_STEP * 1.35;
  let cardVisibility = 1;

  if (navPhase > 0 || progressPercent >= CARD_HIDE_PERCENT) {
    cardVisibility = 0;
  } else if (exitPhase > 0) {
    cardVisibility = 1 - easeOutCubic(
      clamp((progressPercent - (CARD_HIDE_PERCENT - 2)) / 2, 0, 1)
    );
  }
  const settleEased = getSettlePhase(pos, cardCount);
  const tunnelBgProgress = clamp((progress * getTotalSegments()) / (cardCount + 1), 0, 1);

  if (reducedMotion) {
    const activeIndex = Math.min(cardCount - 1, Math.floor(tunnelPhase * cardCount));
    const spreadFactor = getSpreadMultiplier();

    updateHomeBackground(settleEased, tunnelBgProgress);

    workCards.forEach((card, index) => {
      const layout = getCardLayout(card, index);
      const isActive = index === activeIndex && exitPhase < 0.15 && claimPhase === 0 && navPhase === 0;
      const spread = isActive ? 0 : spreadFactor;
      const x = (layout.x / 100) * window.innerWidth * spread;
      const y = (layout.y / 100) * window.innerHeight * spread;

      card.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${isActive ? 1 : 0.88})`;
      const visibleOpacity = isActive ? cardVisibility : 0.2 * cardVisibility;
      const isClickable = canClickCard({
        visibleOpacity,
        exitPhase,
        claimPhase,
        navPhase,
        depth: isActive ? 1 : 0.2,
      });

      card.style.opacity = String(visibleOpacity);
      card.classList.toggle('is-active', isActive);
      storeCardInteraction(card, {
        depth: isActive ? 1 : 0.2,
        isClickable,
      });
      setCardInteractive(card, isClickable, isActive ? 20 : 10, false);
    });

    updateHomeClaim(progress, scrollingBack);
    const drivenNavPhase = getDrivenNavPhase(navPhase);
    const drivenFooterPhase = getDrivenFooterPhase(navPhase, footerPhase);
    updateNavReveal(drivenNavPhase);
    updateHomeFooter(drivenFooterPhase);

    if (homeHeroProgress) homeHeroProgress.textContent = `${Math.round(progress * 100)}%`;
    document.body.classList.toggle('home-flow-complete', drivenFooterPhase > 0.2 || drivenNavPhase > 0.5);
    if (navAutoDrive) window.requestAnimationFrame(updateHomeExperience);
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
    const visibleOpacity = cardOpacity * cardVisibility;
    card.style.opacity = String(visibleOpacity);
    const isFront = index === closestIndex && exitPhase < 0.15 && claimPhase === 0 && navPhase === 0;
    const isClickable = canClickCard({
      visibleOpacity,
      exitPhase,
      claimPhase,
      navPhase,
      z,
      depth,
    });

    card.classList.toggle('is-active', isFront);
    storeCardInteraction(card, { depth, isClickable });
    setCardInteractive(
      card,
      isClickable,
      isClickable ? Math.max(1, Math.round(depth * 100)) : 0,
      true
    );
  });

  updateHomeClaim(progress, scrollingBack);
  const drivenNavPhase = getDrivenNavPhase(navPhase);
  const drivenFooterPhase = getDrivenFooterPhase(navPhase, footerPhase);
  updateNavReveal(drivenNavPhase);
  updateHomeFooter(drivenFooterPhase);

  if (homeHeroProgress) {
    homeHeroProgress.textContent = `${Math.round(progress * 100)}%`;
  }

  document.body.classList.toggle('home-flow-complete', drivenFooterPhase > 0.15 || drivenNavPhase > 0.12);
  if (navAutoDrive) window.requestAnimationFrame(updateHomeExperience);
}

function setHeroHeight() {
  if (!homeHero) return;
  const totalSegments = getTotalSegments();
  homeHero.style.height = `${totalSegments * 100}vh`;
  homeHero.style.height = `${totalSegments * 100}dvh`;
}

function initWorkCardNavigation(signal) {
  const scene = document.getElementById('home-hero-scene');
  if (!scene) return;

  scene.addEventListener('click', (event) => {
    if (document.body.classList.contains('home-intro-active')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const card = getCardAtPoint(event.clientX, event.clientY);
    if (!card) return;

    const href = card.querySelector('.home-work-card__link')?.getAttribute('href');
    if (!href) return;

    event.preventDefault();
    if (typeof window.coloradoNavigate === 'function') {
      window.coloradoNavigate(href);
    } else {
      window.location.assign(href);
    }
  }, { signal });

  scene.addEventListener('mousemove', (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = getCardAtPoint(event.clientX, event.clientY);
    scene.style.cursor = card ? 'pointer' : '';
  }, { signal });
}

function initHomePage() {
  homeAbort.abort();
  homeAbort = new AbortController();
  const { signal } = homeAbort;

  refreshHomeRefs();
  claimShattered = false;
  claimShatterAnimating = false;
  claimEnterPlayed = false;
  lastProgressPercent = 0;
  lastHeroProgress = 0;
  navAutoDrive = false;
  navAutoStart = 0;

  if (!homeHero) return;

  setHeroHeight();
  initWorkCardNavigation(signal);
  initClaimInteraction(signal);
  updateHomeExperience();
  window.addEventListener('scroll', updateHomeExperience, { passive: true, signal });
  window.addEventListener('resize', () => {
    setHeroHeight();
    updateHomeExperience();
  }, { signal });
}

initHomePage();
document.addEventListener('colorado:pagechange', initHomePage);
