/* ── PRODUCT LIST PAGE SCRIPT ── */

/* ── Filter state ── */
const activeFilters = {
  types:       new Set(),
  collections: new Set()
};

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

/* ── Apply active filters to the products array ── */
function getFilteredProducts() {
  return products.filter(p => {
    const typeOk = activeFilters.types.size === 0       || activeFilters.types.has(p.category);
    const collOk = activeFilters.collections.size === 0 || activeFilters.collections.has(p.collection);
    return typeOk && collOk;
  });
}

/* ── Render product cards into both desktop and mobile grids ── */
function renderProducts(list) {
  if (list === undefined) list = products;

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

renderProducts();

/* ── Helpers: read checked boxes from a container into activeFilters ── */
function readFiltersFrom(containerSelector) {
  activeFilters.types.clear();
  activeFilters.collections.clear();

  document.querySelectorAll(`${containerSelector} .filter-group`).forEach(group => {
    const titleEl = group.querySelector('.filter-group-title');
    if (!titleEl) return;
    const groupKey = titleEl.textContent.trim().toLowerCase();

    group.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      const label = cb.closest('.filter-option').querySelector('span').textContent.trim().toLowerCase();
      if (groupKey === 'product type' && typeMap[label])       activeFilters.types.add(typeMap[label]);
      if (groupKey === 'collections'  && collectionMap[label]) activeFilters.collections.add(collectionMap[label]);
    });
  });
}

/* ── Desktop sidebar: live-filter on every checkbox change ── */
document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', () => {
    readFiltersFrom('.filter-sidebar');
    /* Reset mobile category tabs back to "Best Sellers" to avoid conflict */
    resetCategoryTabs();
    renderProducts(getFilteredProducts());
  });
});

/* Desktop "Apply Filters" button (also triggers live, belt-and-braces) */
const desktopApplyBtn = document.querySelector('.filter-apply-desktop-btn');
if (desktopApplyBtn) {
  desktopApplyBtn.addEventListener('click', () => {
    readFiltersFrom('.filter-sidebar');
    resetCategoryTabs();
    renderProducts(getFilteredProducts());
  });
}

/* ── Mobile filter overlay: apply on "Apply Filters" button ── */
const mobileFilterBtn  = document.getElementById('mobile-filter-btn');
const filterOverlay    = document.getElementById('filter-overlay');
const filterCloseBtn   = document.getElementById('filter-close-btn');
const filterApplyBtn   = document.getElementById('filter-apply-btn');

if (mobileFilterBtn && filterOverlay) {
  mobileFilterBtn.addEventListener('click', () => filterOverlay.classList.add('open'));
}

if (filterCloseBtn && filterOverlay) {
  filterCloseBtn.addEventListener('click', () => filterOverlay.classList.remove('open'));
}

if (filterApplyBtn && filterOverlay) {
  filterApplyBtn.addEventListener('click', () => {
    readFiltersFrom('.filter-overlay');
    resetCategoryTabs();
    renderProducts(getFilteredProducts());
    filterOverlay.classList.remove('open');
  });
}

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

    if (label !== 'best sellers') {
      const mapped = typeMap[label];
      if (mapped) activeFilters.types.add(mapped);
    }

    /* Clear mobile overlay checkboxes so they stay in sync */
    document.querySelectorAll('.filter-overlay input[type="checkbox"]').forEach(cb => cb.checked = false);

    renderProducts(getFilteredProducts());
  });
});

/* ── Order By dropdown toggle (desktop) ── */
const orderByBtn      = document.getElementById('order-by-btn');
const orderByDropdown = document.getElementById('order-by-dropdown');

if (orderByBtn && orderByDropdown) {
  orderByBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = orderByDropdown.classList.toggle('open');
    orderByBtn.setAttribute('aria-expanded', isOpen);
  });
}

/* ── Order By dropdown toggle (mobile) ── */
const mobileOrderBtn      = document.getElementById('mobile-order-btn');
const mobileOrderDropdown = document.getElementById('mobile-order-dropdown');

if (mobileOrderBtn && mobileOrderDropdown) {
  mobileOrderBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileOrderDropdown.classList.toggle('open');
    mobileOrderBtn.setAttribute('aria-expanded', isOpen);
  });
}

/* ── Close all dropdowns when clicking outside ── */
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
function initPriceFilter(wrap) {
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

  rangeMin.addEventListener('input', () => {
    if (parseInt(rangeMin.value) > parseInt(rangeMax.value) - GAP)
      rangeMin.value = parseInt(rangeMax.value) - GAP;
    updateFill();
  });

  rangeMax.addEventListener('input', () => {
    if (parseInt(rangeMax.value) < parseInt(rangeMin.value) + GAP)
      rangeMax.value = parseInt(rangeMin.value) + GAP;
    updateFill();
  });

  if (inputMin) {
    inputMin.addEventListener('change', () => {
      let val = Math.min(Math.max(parseInt(inputMin.value) || MIN, MIN), parseInt(rangeMax.value) - GAP);
      rangeMin.value = val;
      inputMin.value = val;
      updateFill();
    });
  }

  if (inputMax) {
    inputMax.addEventListener('change', () => {
      let val = Math.max(Math.min(parseInt(inputMax.value) || MAX, MAX), parseInt(rangeMin.value) + GAP);
      rangeMax.value = val;
      inputMax.value = val;
      updateFill();
    });
  }

  updateFill();
}

document.querySelectorAll('.price-filter').forEach(initPriceFilter);
