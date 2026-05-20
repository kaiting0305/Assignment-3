/* ── PRODUCT DETAIL PAGE SCRIPT ── */

/* ── 1. Read product id from URL ── */
const params  = new URLSearchParams(window.location.search);
const product = products.find(p => p.id === Number(params.get('id')));

if (!product) {
  /* No matching product — redirect back to shop */
  window.location.href = 'product-list.html';
}

/* ── 2. Populate page with product data ── */
document.title = `${product.name} — MAKES Handcrafted Jewellery`;

document.getElementById('pd-name').textContent        = product.name;
document.getElementById('pd-price').textContent       = `$${product.price}`;
document.getElementById('pd-short-desc').textContent  = product.shortDescription || '';

/* Main image */
const mainImg = document.getElementById('pd-main-img');
mainImg.src = product.image;
mainImg.alt = product.name;

/* Thumbnail strip — one thumb per image in product.images */
const thumbStrip = document.getElementById('pd-thumbs');
(product.images || [product.image]).forEach((src, i) => {
  const img = document.createElement('img');
  img.src       = src;
  img.alt       = `${product.name} view ${i + 1}`;
  img.className = 'pd-thumb' + (i === 0 ? ' active' : '');
  img.addEventListener('click', () => {
    mainImg.src = src;
    thumbStrip.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
    img.classList.add('active');
  });
  thumbStrip.appendChild(img);
});

/* Tab content */
document.getElementById('tab-description').textContent  = product.shortDescription || '';
document.getElementById('tab-measurements').textContent = product.measurements || '';
document.getElementById('tab-productCare').textContent  = product.productCare || '';

/* ── 3. Quantity selector ── */
let qty = 1;
const qtyDisplay = document.getElementById('qty-display');

document.getElementById('qty-minus').addEventListener('click', () => {
  if (qty > 1) { qty--; qtyDisplay.textContent = qty; }
});
document.getElementById('qty-plus').addEventListener('click', () => {
  qty++;
  qtyDisplay.textContent = qty;
});

/* ── 4. Cart toast ── */
const toast = document.getElementById('cart-toast');
let toastTimer;

function showToast() {
  clearTimeout(toastTimer);
  toast.classList.add('visible');
  /* Re-init lucide icons inside the toast (arrow-right) */
  if (window.lucide) lucide.createIcons();
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
}

/* ── 5. Add to Cart ── */
document.getElementById('add-to-cart-btn').addEventListener('click', () => {
  addToCart(product.id, qty);
  showToast();
});

/* ── 6. Buy Now ── */
document.getElementById('buy-now-btn').addEventListener('click', () => {
  addToCart(product.id, qty);
  window.location.href = 'shopping-cart.html';
});

/* ── 7. Desktop tab switching ── */
const tabBtns    = document.querySelectorAll('.pd-tab-btn');
const tabPanels  = document.querySelectorAll('.tab-panel');
const tabContent = document.getElementById('pd-tab-content');
let   mobilePanelOpen = false;

tabBtns.forEach(btn => {
  if (btn.classList.contains('reviews-tab')) return; /* Reviews not clickable */

  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    const isMobile = window.innerWidth <= 768;

    /* Update active button */
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    /* Show correct panel */
    tabPanels.forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${target}`).classList.add('active');

    if (isMobile) {
      /* On mobile: show content area on first click; always open once clicked */
      tabContent.classList.add('mobile-open');
      mobilePanelOpen = true;
    }
  });
});

/* ── 8. Recommendations (3 random products, excluding current) ── */
const recsGrid = document.getElementById('pd-recs-grid');
const pool     = products.filter(p => p.id !== product.id);

/* Shuffle and take first 3 */
const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);

shuffled.forEach(p => {
  const card = document.createElement('a');
  card.href      = `product-detail.html?id=${p.id}`;
  card.className = 'product-card';
  card.innerHTML = `
    <img src="${p.image}" alt="${p.name}" class="product-card-img" loading="lazy">
    <div class="product-card-info">
      <p class="product-card-name">${p.name}</p>
      <p class="product-card-price">$${p.price}</p>
    </div>
  `;
  recsGrid.appendChild(card);
});
