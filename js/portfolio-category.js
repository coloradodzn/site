const PORTFOLIO_SERVICES = [
  { value: 'creative-direction', i18n: 'portfolio.service.creativeDirection' },
  { value: 'brand', i18n: 'portfolio.service.brand' },
  { value: 'logo', i18n: 'portfolio.service.logo' },
  { value: 'visual', i18n: 'portfolio.service.visual' },
  { value: 'web', i18n: 'portfolio.service.web' },
  { value: 'motion', i18n: 'portfolio.service.motion' },
  { value: 'uxui', i18n: 'portfolio.service.uxui' },
  { value: 'editorial', i18n: 'portfolio.service.editorial' },
  { value: 'photography', i18n: 'portfolio.service.photography' }
];

const PORTFOLIO_SECTORS = [
  { value: 'gaming', i18n: 'portfolio.sector.gaming' },
  { value: 'food-beverage', i18n: 'portfolio.sector.foodBeverage' },
  { value: 'fashion', i18n: 'portfolio.sector.fashion' },
  { value: 'sport', i18n: 'portfolio.sector.sport' },
  { value: 'social-media', i18n: 'portfolio.sector.socialMedia' },
  { value: 'esports', i18n: 'portfolio.sector.esports' },
  { value: 'entertainment', i18n: 'portfolio.sector.entertainment' },
  { value: 'music', i18n: 'portfolio.sector.music' },
  { value: 'art-museum', i18n: 'portfolio.sector.artMuseum' },
  { value: 'tourism', i18n: 'portfolio.sector.tourism' },
  { value: 'social-impact', i18n: 'portfolio.sector.socialImpact' },
  { value: 'environment-impact', i18n: 'portfolio.sector.environmentImpact' },
  { value: 'mobility-transport', i18n: 'portfolio.sector.mobilityTransport' }
];

function getDictText(key, fallback = '') {
  if (typeof I18N === 'undefined' || typeof i18nDetectLang !== 'function') return fallback;
  const dict = I18N[i18nDetectLang()] || I18N.it;
  const value = dict[key];
  return value != null ? String(value).replace(/\n/g, ' ') : fallback;
}

function parseTokens(value) {
  return (value || '').trim().split(/\s+/).filter(Boolean);
}

function getSelectedValues(filterEl) {
  return [...filterEl.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
}

function itemMatchesSelection(itemTokens, selected) {
  if (!selected.length) return true;
  return selected.some((token) => itemTokens.includes(token));
}

function applyCatalogFilters(catalog) {
  const serviceFilter = catalog.querySelector('[data-filter-group="service"]');
  const sectorFilter = catalog.querySelector('[data-filter-group="sector"]');
  const selectedServices = serviceFilter ? getSelectedValues(serviceFilter) : [];
  const selectedSectors = sectorFilter ? getSelectedValues(sectorFilter) : [];
  let visibleCount = 0;

  catalog.querySelectorAll('.portfolio-grid__item').forEach((item) => {
    const services = parseTokens(item.dataset.service);
    const sectors = parseTokens(item.dataset.sector);
    const matchService = itemMatchesSelection(services, selectedServices);
    const matchSector = itemMatchesSelection(sectors, selectedSectors);
    const isVisible = matchService && matchSector;
    item.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  catalog.querySelectorAll('.portfolio-grid-group').forEach((group) => {
    const hasVisible = [...group.querySelectorAll('.portfolio-grid__item')].some((item) => !item.hidden);
    group.hidden = !hasVisible;
  });

  const countEl = catalog.querySelector('[data-catalog-count]');
  if (countEl) countEl.textContent = String(visibleCount);

  updateFilterSummary(serviceFilter);
  updateFilterSummary(sectorFilter);
}

function updateFilterSummary(filterEl) {
  if (!filterEl) return;

  const summaryEl = filterEl.querySelector('[data-filter-summary]');
  if (!summaryEl) return;

  const checked = [...filterEl.querySelectorAll('input[type="checkbox"]:checked')];
  if (!checked.length) {
    summaryEl.textContent = getDictText(
      filterEl.dataset.filterGroup === 'service' ? 'portfolio.filter.allServices' : 'portfolio.filter.allSectors',
      filterEl.dataset.filterGroup === 'service' ? 'Tutti i servizi' : 'Tutti i settori'
    );
    return;
  }

  if (checked.length === 1) {
    const label = checked[0].closest('.portfolio-filter__option');
    const textEl = label?.querySelector('[data-i18n]');
    summaryEl.textContent = textEl?.textContent?.trim() || checked[0].value;
    return;
  }

  summaryEl.textContent = getDictText('portfolio.filter.selectedCount', '{{n}} selezionati').replace('{{n}}', String(checked.length));
}

function closeFilterPanels(catalog, except) {
  catalog.querySelectorAll('.portfolio-filter').forEach((filterEl) => {
    if (except && filterEl === except) return;
    const panel = filterEl.querySelector('.portfolio-filter__panel');
    const trigger = filterEl.querySelector('.portfolio-filter__trigger');
    if (panel) panel.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    filterEl.classList.remove('is-open');
  });
}

function buildFilterOption(option) {
  const li = document.createElement('li');
  li.className = 'portfolio-filter__item';
  const label = getDictText(option.i18n, option.value);
  li.innerHTML = `
    <label class="portfolio-filter__option">
      <input type="checkbox" class="portfolio-filter__checkbox" value="${option.value}">
      <span class="portfolio-filter__check" aria-hidden="true"></span>
      <span class="portfolio-filter__text" data-i18n="${option.i18n}">${label}</span>
    </label>
  `;
  return li;
}

function buildFilterGroup(groupName, labelKey, options) {
  const filter = document.createElement('div');
  filter.className = 'portfolio-filter';
  filter.dataset.filterGroup = groupName;

  const triggerLabel = getDictText(labelKey, groupName);
  filter.innerHTML = `
    <button type="button" class="portfolio-filter__trigger" aria-expanded="false" aria-haspopup="listbox" aria-label="${triggerLabel}">
      <span class="portfolio-filter__summary" data-filter-summary></span>
      <span class="portfolio-filter__chevron" aria-hidden="true"></span>
    </button>
    <div class="portfolio-filter__panel" hidden>
      <ul class="portfolio-filter__list" role="listbox" aria-multiselectable="true"></ul>
    </div>
  `;

  const list = filter.querySelector('.portfolio-filter__list');
  options.forEach((option) => list.appendChild(buildFilterOption(option)));

  return filter;
}

let portfolioFilterGlobalBound = false;

function bindPortfolioFilterGlobalListeners() {
  if (portfolioFilterGlobalBound) return;
  portfolioFilterGlobalBound = true;

  document.addEventListener('click', (event) => {
    const catalog = document.querySelector('[data-portfolio-catalog]');
    if (!catalog) return;
    if (!event.target.closest('.portfolio-filter')) {
      closeFilterPanels(catalog);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const catalog = document.querySelector('[data-portfolio-catalog]');
    if (catalog) closeFilterPanels(catalog);
  });
}

function mountCatalogFilters(catalog) {
  const mount = catalog.querySelector('[data-filter-mount]');
  if (!mount || mount.dataset.filtersMounted === 'true') return;

  const serviceFilter = buildFilterGroup('service', 'portfolio.filter.service', PORTFOLIO_SERVICES);
  const sectorFilter = buildFilterGroup('sector', 'portfolio.filter.sector', PORTFOLIO_SECTORS);
  mount.append(serviceFilter, sectorFilter);
  mount.dataset.filtersMounted = 'true';

  mount.querySelectorAll('.portfolio-filter').forEach((filterEl) => {
    const trigger = filterEl.querySelector('.portfolio-filter__trigger');
    const panel = filterEl.querySelector('.portfolio-filter__panel');

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = panel.hidden;
      closeFilterPanels(catalog);
      panel.hidden = !willOpen;
      trigger.setAttribute('aria-expanded', String(willOpen));
      filterEl.classList.toggle('is-open', willOpen);
    });

    filterEl.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => applyCatalogFilters(catalog));
    });
  });

  bindPortfolioFilterGlobalListeners();
}

function initCatalogFilters() {
  const catalog = document.querySelector('[data-portfolio-catalog]');
  if (!catalog) return;

  mountCatalogFilters(catalog);
  applyCatalogFilters(catalog);
  if (typeof window.initUiIcons === 'function') window.initUiIcons();
}

document.addEventListener('DOMContentLoaded', initCatalogFilters);
document.addEventListener('colorado:pagechange', initCatalogFilters);
document.addEventListener('colorado:langchange', () => {
  const catalog = document.querySelector('[data-portfolio-catalog]');
  if (catalog) applyCatalogFilters(catalog);
});
