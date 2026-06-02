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
