/* ── PRODUCT LIST PAGE SCRIPT ── */

/* ── Filter state ── */
const activeFilters = {
  types:           new Set(),
  collections:     new Set(),
  bestSellersOnly: false,
  priceMin:        0,
  priceMax:        300
};

/* ── Sort state ── */
let activeSort = 'default'; // 'default' | 'featured' | 'price-asc' | 'price-desc' | 'newest'

/* Maps checkbox/tab label text → product data values */
const typeMap = {
  'necklaces':         'necklaces',
  'earrings':          'earrings',
  'charms & pendants': 'charms-pendants',
  'rings':             'rings'
};

const collectionMap = {
  'by the seashore': 'by-the-seashore',
  'hello petal':     'hello-petal',
  'hey babe':        'hey-babe',
  'in black':        'in-black',
  'in love':         'in-love',
  'lucky':           'lucky',
  'petite pieces':   'petite-pieces',
  'tackle':          'tackle'
};

/* ── Apply active filters ── */
function getFilteredProducts() {
  return products.filter(p => {
    const typeOk  = activeFilters.types.size === 0       || activeFilters.types.has(p.category);
    const collOk  = activeFilters.collections.size === 0 || activeFilters.collections.has(p.collection);
    const bsOk    = !activeFilters.bestSellersOnly       || p.bestSeller === true;
    const priceOk = p.price >= activeFilters.priceMin && p.price <= activeFilters.priceMax;
    return typeOk && collOk && bsOk && priceOk;
  });
}

/* ── Apply active sort to a filtered list ── */
function getSortedProducts(list) {
  const arr = [...list]; // never mutate the original
  switch (activeSort) {
    case 'default':
      return arr.sort((a, b) => a.id - b.id);
    case 'featured':
      // Best sellers first (in id order), then the rest (in id order)
      return arr.sort((a, b) => {
        if (a.bestSeller && !b.bestSeller) return -1;
        if (!a.bestSeller && b.bestSeller) return  1;
        return a.id - b.id;
      });
    case 'price-asc':
      return arr.sort((a, b) => a.price !== b.price ? a.price - b.price : a.id - b.id);
    case 'price-desc':
      return arr.sort((a, b) => a.price !== b.price ? b.price - a.price : a.id - b.id);
    case 'newest':
      return arr.sort((a, b) => b.id - a.id);
    default:
      return arr.sort((a, b) => a.id - b.id);
  }
}

/* Convenience: get the final display list (filtered + sorted) */
function getDisplayList() {
  return getSortedProducts(getFilteredProducts());
}

/* ── Render product cards into both grids ── */
function renderProducts(list) {
  if (list === undefined) list = getSortedProducts(products);

  const desktopGrid = document.getElementById('product-grid');
  const mobileGrid  = document.getElementById('product-grid-mobile');
  if (!desktopGrid && !mobileGrid) return;

  const html = list.map(p => `
    <a href="product-detail.html?id=${p.id}" class="product-card">
      <img src="${p.image}" alt="${p.name}" class="product-card-img" loading="lazy">
      <div class="product-card-info">
        <p class="product-card-name">${p.name}</p>
        <p class="product-card-price">$${p.price}</p>
      </div>
    </a>
  `).join('');

  const emptyMsg = '<p style="grid-column:1/-1;padding:24px 0;opacity:0.5;font-size:0.9rem;">No products match your filters.</p>';
  if (desktopGrid) desktopGrid.innerHTML = html || emptyMsg;
  if (mobileGrid)  mobileGrid.innerHTML  = html || emptyMsg;

  /* Update result counts */
  const n = list.length;
  const countStr = n === 0 ? 'No results' : `Showing 1 — ${n} of ${n} results`;
  const desktopCount = document.getElementById('desktop-product-count');
  if (desktopCount) desktopCount.textContent = countStr;
  const mobileCountEl = document.querySelector('.mobile-results-row .product-count');
  if (mobileCountEl) mobileCountEl.textContent = n === 0 ? 'No results' : `Showing 1 — ${n} of ${n} Results`;
}

renderProducts(getDisplayList());
setActiveOrderOption('Default');

/* ── Helpers: read all filter inputs from a container into activeFilters ── */
function readFiltersFrom(containerSelector) {
  activeFilters.types.clear();
  activeFilters.collections.clear();
  activeFilters.bestSellersOnly = false;

  /* Read price range from slider */
  const container = document.querySelector(containerSelector);
  const rangeMin  = container?.querySelector('.range-min');
  const rangeMax  = container?.querySelector('.range-max');
  activeFilters.priceMin = rangeMin ? parseInt(rangeMin.value) : 0;
  activeFilters.priceMax = rangeMax ? parseInt(rangeMax.value) : 300;

  document.querySelectorAll(`${containerSelector} .filter-group`).forEach(group => {
    const titleEl = group.querySelector('.filter-group-title');
    if (!titleEl) return;
    const groupKey = titleEl.textContent.trim().toLowerCase();

    group.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      const label = cb.closest('.filter-option').querySelector('span').textContent.trim().toLowerCase();
      if (groupKey === 'featured'     && label === 'best sellers') activeFilters.bestSellersOnly = true;
      if (groupKey === 'product type' && typeMap[label])           activeFilters.types.add(typeMap[label]);
      if (groupKey === 'collections'  && collectionMap[label])     activeFilters.collections.add(collectionMap[label]);
    });
  });
}

/* ── Desktop sidebar: live-filter on every checkbox change ── */
document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', () => {
    readFiltersFrom('.filter-sidebar');
    resetCategoryTabs();
    renderProducts(getDisplayList());
  });
});

/* Desktop "Apply Filters" button */
const desktopApplyBtn = document.querySelector('.filter-apply-desktop-btn');
if (desktopApplyBtn) {
  desktopApplyBtn.addEventListener('click', () => {
    readFiltersFrom('.filter-sidebar');
    resetCategoryTabs();
    renderProducts(getDisplayList());
  });
}

/* ── Mobile filter overlay ── */
const filterOverlay = document.getElementById('filter-overlay');

document.getElementById('mobile-filter-btn')?.addEventListener('click', () => {
  filterOverlay?.classList.add('open');
});

document.getElementById('filter-close-btn')?.addEventListener('click', () => {
  filterOverlay?.classList.remove('open');
});

document.getElementById('filter-apply-btn')?.addEventListener('click', () => {
  readFiltersFrom('.filter-overlay');
  resetCategoryTabs();
  renderProducts(getDisplayList());
  filterOverlay?.classList.remove('open');
});

/* ── Mobile category tabs ── */
const categoryTabs = document.querySelectorAll('.category-tab');

function resetCategoryTabs() {
  categoryTabs.forEach((t, i) => t.classList.toggle('active', i === 0));
}

categoryTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    categoryTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const label = tab.textContent.trim().toLowerCase();
    activeFilters.types.clear();
    activeFilters.collections.clear();
    activeFilters.bestSellersOnly = false;

    if (label === 'best sellers') {
      activeFilters.bestSellersOnly = true;
    } else {
      const mapped = typeMap[label];
      if (mapped) activeFilters.types.add(mapped);
    }

    /* Clear mobile overlay checkboxes to stay in sync */
    document.querySelectorAll('.filter-overlay input[type="checkbox"]').forEach(cb => cb.checked = false);

    renderProducts(getDisplayList());
  });
});

/* ── Order By ── */
const sortLabelMap = {
  'default':            'default',
  'featured':           'featured',
  'price: low to high': 'price-asc',
  'price: high to low': 'price-desc',
  'newest':             'newest'
};

const orderByBtn      = document.getElementById('order-by-btn');
const orderByDropdown = document.getElementById('order-by-dropdown');
const mobileOrderBtn  = document.getElementById('mobile-order-btn');
const mobileOrderDropdown = document.getElementById('mobile-order-dropdown');

/* Update button label text (preserves the chevron icon) */
function updateOrderByLabel(displayText) {
  [orderByBtn, mobileOrderBtn].forEach(btn => {
    if (!btn) return;
    btn.innerHTML = `${displayText} <i data-lucide="chevron-down" style="width:14px;height:14px;"></i>`;
  });
  if (window.lucide) lucide.createIcons();
}

/* Mark the matching option as active in both dropdowns */
function setActiveOrderOption(displayText) {
  document.querySelectorAll('.order-by-option').forEach(opt => {
    opt.classList.toggle('active', opt.textContent.trim().toLowerCase() === displayText.toLowerCase());
  });
}

function handleSortClick(optEl) {
  const label = optEl.textContent.trim();
  const key   = sortLabelMap[label.toLowerCase()];
  if (!key) return;
  activeSort = key;
  updateOrderByLabel(label);
  setActiveOrderOption(label);
  renderProducts(getDisplayList());
}

if (orderByBtn && orderByDropdown) {
  orderByBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = orderByDropdown.classList.toggle('open');
    orderByBtn.setAttribute('aria-expanded', isOpen);
  });
}

if (mobileOrderBtn && mobileOrderDropdown) {
  mobileOrderBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = mobileOrderDropdown.classList.toggle('open');
    mobileOrderBtn.setAttribute('aria-expanded', isOpen);
  });
}

document.querySelectorAll('#order-by-dropdown .order-by-option').forEach(opt => {
  opt.addEventListener('click', () => {
    handleSortClick(opt);
    orderByDropdown.classList.remove('open');
    if (orderByBtn) orderByBtn.setAttribute('aria-expanded', false);
  });
});

document.querySelectorAll('#mobile-order-dropdown .order-by-option').forEach(opt => {
  opt.addEventListener('click', () => {
    handleSortClick(opt);
    mobileOrderDropdown.classList.remove('open');
    if (mobileOrderBtn) mobileOrderBtn.setAttribute('aria-expanded', false);
  });
});

/* Close all dropdowns when clicking outside */
document.addEventListener('click', () => {
  if (orderByDropdown)      orderByDropdown.classList.remove('open');
  if (mobileOrderDropdown)  mobileOrderDropdown.classList.remove('open');
});

/* ── View toggle (desktop: grid / list) — visual only ── */
const viewGridBtn = document.getElementById('view-grid-btn');
const viewListBtn = document.getElementById('view-list-btn');

if (viewGridBtn && viewListBtn) {
  viewGridBtn.addEventListener('click', () => {
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
  });
  viewListBtn.addEventListener('click', () => {
    viewListBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
  });
}

/* ── Pagination — visual active state only ── */
document.querySelectorAll('.page-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const siblings = btn.closest('.pagination, .pagination-mobile').querySelectorAll('.page-btn');
    siblings.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ── PRICE RANGE FILTER ── */
/* liveFilter = true → re-render products on every drag (desktop sidebar)
   liveFilter = false → only update UI; filtering happens on Apply button (mobile) */
function initPriceFilter(wrap, liveFilter) {
  const rangeMin = wrap.querySelector('.range-min');
  const rangeMax = wrap.querySelector('.range-max');
  const fill     = wrap.querySelector('.price-track-fill');
  const inputMin = wrap.querySelector('.input-min');
  const inputMax = wrap.querySelector('.input-max');

  if (!rangeMin || !rangeMax) return;

  const MIN = parseInt(rangeMin.min);
  const MAX = parseInt(rangeMin.max);
  const GAP = 5;

  function updateFill() {
    const minVal   = parseInt(rangeMin.value);
    const maxVal   = parseInt(rangeMax.value);
    const leftPct  = ((minVal - MIN) / (MAX - MIN)) * 100;
    const rightPct = ((maxVal - MIN) / (MAX - MIN)) * 100;
    if (fill) {
      fill.style.left  = leftPct + '%';
      fill.style.right = (100 - rightPct) + '%';
    }
    if (inputMin) inputMin.value = minVal;
    if (inputMax) inputMax.value = maxVal;
  }

  function applyPrice() {
    if (!liveFilter) return;
    activeFilters.priceMin = parseInt(rangeMin.value);
    activeFilters.priceMax = parseInt(rangeMax.value);
    renderProducts(getDisplayList());
  }

  rangeMin.addEventListener('input', () => {
    if (parseInt(rangeMin.value) > parseInt(rangeMax.value) - GAP)
      rangeMin.value = parseInt(rangeMax.value) - GAP;
    updateFill();
    applyPrice();
  });

  rangeMax.addEventListener('input', () => {
    if (parseInt(rangeMax.value) < parseInt(rangeMin.value) + GAP)
      rangeMax.value = parseInt(rangeMin.value) + GAP;
    updateFill();
    applyPrice();
  });

  if (inputMin) {
    inputMin.addEventListener('change', () => {
      let val = Math.min(Math.max(parseInt(inputMin.value) || MIN, MIN), parseInt(rangeMax.value) - GAP);
      rangeMin.value = val;
      inputMin.value = val;
      updateFill();
      applyPrice();
    });
  }

  if (inputMax) {
    inputMax.addEventListener('change', () => {
      let val = Math.max(Math.min(parseInt(inputMax.value) || MAX, MAX), parseInt(rangeMin.value) + GAP);
      rangeMax.value = val;
      inputMax.value = val;
      updateFill();
      applyPrice();
    });
  }

  updateFill();
}

/* Desktop sidebar: live filter on drag. Mobile overlay: apply on button click. */
const desktopPF = document.querySelector('.filter-sidebar .price-filter');
const mobilePF  = document.querySelector('.filter-overlay .price-filter');
if (desktopPF) initPriceFilter(desktopPF, true);
if (mobilePF)  initPriceFilter(mobilePF, false);
