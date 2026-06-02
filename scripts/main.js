/* ── CART BADGE ── */
/* Reads localStorage directly so it works on pages that don't load cart.js */
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.toggle('visible', count > 0);
    } catch (e) {}
}

updateCartBadge();

/* Re-run if cart changes in another tab */
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') updateCartBadge();
});

// Search overlay (visual only — not functional)
const searchOpenBtn = document.getElementById('search-open-btn');
const searchCloseBtn = document.getElementById('search-close-btn');
const searchOverlay = document.getElementById('search-overlay');

if (searchOpenBtn && searchOverlay) {
    searchOpenBtn.addEventListener('click', () => {
        searchOverlay.classList.add('open');
        const input = searchOverlay.querySelector('.search-input');
        if (input) input.focus();
    });
}

if (searchCloseBtn && searchOverlay) {
    searchCloseBtn.addEventListener('click', () => {
        searchOverlay.classList.remove('open');
    });
}

// Close search overlay on backdrop click
if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('open');
        }
    });
}

// Hamburger menu
const hamburgerBtn = document.getElementById('hamburger-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        mobileMenu.classList.add('open');
    });
}

if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
    });
}

// Scroll to top
const scrollTopBtn = document.getElementById('scroll-top');

if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ── LIVE SEARCH ── */
(function initSearch() {
    if (typeof products === 'undefined') return;

    // products.js uses "../assets/..." paths (relative to pages/ subdirectory).
    // On the root page (index.html) we strip the leading "../".
    const inPagesDir = window.location.pathname.toLowerCase().includes('/pages/');

    function resolveHref(p) {
        return inPagesDir
            ? `product-detail.html?id=${p.id}`
            : `pages/product-detail.html?id=${p.id}`;
    }

    function resolveImg(p) {
        return inPagesDir ? p.image : p.image.replace('../', '');
    }

    const searchInput = document.querySelector('.search-input');
    if (!searchInput || !searchOverlay) return;

    // Create results panel as a sibling of search-overlay-inner inside the overlay
    const resultsEl = document.createElement('div');
    resultsEl.className = 'search-results';
    searchOverlay.appendChild(resultsEl);

    function render(query) {
        const q = query.trim().toLowerCase();
        if (!q) {
            resultsEl.style.display = 'none';
            return;
        }

        const matches = products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.replace(/-/g, ' ').includes(q) ||
            p.collection.replace(/-/g, ' ').includes(q)
        ).slice(0, 7);

        if (!matches.length) {
            resultsEl.innerHTML = `<p class="search-no-results">No results for "<em>${query}</em>"</p>`;
            resultsEl.style.display = 'block';
            return;
        }

        resultsEl.innerHTML = matches.map(p => `
            <a href="${resolveHref(p)}" class="search-result-item">
                <img src="${resolveImg(p)}" alt="${p.name}" class="search-result-img">
                <span class="search-result-name">${p.name}</span>
            </a>
        `).join('');
        resultsEl.style.display = 'block';
    }

    searchInput.addEventListener('input', () => render(searchInput.value));

    // Enter key navigates to first result
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const first = resultsEl.querySelector('.search-result-item');
            if (first) first.click();
        }
    });

    // Clear results and input when overlay closes
    const observer = new MutationObserver(() => {
        if (!searchOverlay.classList.contains('open')) {
            resultsEl.style.display = 'none';
            resultsEl.innerHTML = '';
            searchInput.value = '';
        }
    });
    observer.observe(searchOverlay, { attributes: true, attributeFilter: ['class'] });
})();
