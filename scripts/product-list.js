/* ── PRODUCT LIST PAGE SCRIPT ── */

/* ── Render product cards into both desktop and mobile grids ── */
function renderProducts() {
  const desktopGrid = document.getElementById('product-grid');
  const mobileGrid  = document.getElementById('product-grid-mobile');

  if (!desktopGrid && !mobileGrid) return;

  const html = products.map(p => `
    <a href="product-detail.html?id=${p.id}" class="product-card">
      <img src="${p.image}" alt="${p.name}" class="product-card-img" loading="lazy">
      <div class="product-card-info">
        <p class="product-card-name">${p.name}</p>
        <p class="product-card-price">$${p.price}</p>
      </div>
    </a>
  `).join('');

  if (desktopGrid) desktopGrid.innerHTML = html;
  if (mobileGrid)  mobileGrid.innerHTML  = html;
}

renderProducts();

/* ── Re-init Lucide icons after JS-rendered cards (not needed — no icons in cards) ── */

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

/* ── Mobile filter overlay ── */
const mobileFilterBtn  = document.getElementById('mobile-filter-btn');
const filterOverlay    = document.getElementById('filter-overlay');
const filterCloseBtn   = document.getElementById('filter-close-btn');
const filterApplyBtn   = document.getElementById('filter-apply-btn');

if (mobileFilterBtn && filterOverlay) {
  mobileFilterBtn.addEventListener('click', () => {
    filterOverlay.classList.add('open');
  });
}

if (filterCloseBtn && filterOverlay) {
  filterCloseBtn.addEventListener('click', () => {
    filterOverlay.classList.remove('open');
  });
}

if (filterApplyBtn && filterOverlay) {
  filterApplyBtn.addEventListener('click', () => {
    filterOverlay.classList.remove('open');
  });
}

/* ── Category tabs (mobile) — visual active state only ── */
const categoryTabs = document.querySelectorAll('.category-tab');
categoryTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    categoryTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

/* ── Pagination — visual active state only ── */
document.querySelectorAll('.page-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Only update active within its own pagination container
    const siblings = btn.closest('.pagination, .pagination-mobile').querySelectorAll('.page-btn');
    siblings.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
