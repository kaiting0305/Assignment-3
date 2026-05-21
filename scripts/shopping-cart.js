/* ── SHOPPING CART PAGE SCRIPT ── */

const itemListEl   = document.getElementById('sc-item-list');
const emptyEl      = document.getElementById('sc-empty');
const discountRow  = document.getElementById('sc-discount-row');
const summaryCol   = document.getElementById('sc-summary-col');
const subtotalEl   = document.getElementById('sc-subtotal');
const totalEl      = document.getElementById('sc-total');
const checkoutBtn  = document.getElementById('sc-checkout-btn');

/* ── Format price ── */
function fmt(n) {
  return '$' + n;
}

/* ── Calculate subtotal ── */
function calcSubtotal(cart) {
  return cart.reduce((sum, item) => {
    const p = products.find(p => p.id === item.id);
    return p ? sum + p.price * item.qty : sum;
  }, 0);
}

/* ── Update order summary panel ── */
function updateSummary() {
  const cart     = getCart();
  const subtotal = calcSubtotal(cart);
  subtotalEl.textContent = fmt(subtotal);
  totalEl.textContent    = fmt(subtotal);
}

/* ── Render a single cart item row ── */
function buildItemRow(item, product) {
  const lineTotal = product.price * item.qty;

  const row = document.createElement('div');
  row.className   = 'sc-item';
  row.dataset.id  = product.id;

  row.innerHTML = `
    <a href="product-detail.html?id=${product.id}" class="sc-item-img-link">
      <img src="${product.image}" alt="${product.name}" class="sc-item-img">
    </a>
    <div class="sc-item-info">
      <a href="product-detail.html?id=${product.id}" class="sc-item-name-link">
        <p class="sc-item-name">${product.name}</p>
      </a>
      <p class="sc-item-price">${fmt(product.price)}</p>
    </div>
    <div class="sc-item-qty">
      <button class="sc-qty-btn ${item.qty <= 1 ? 'sc-qty-btn--disabled' : ''}" data-action="minus" data-id="${product.id}" aria-label="Decrease quantity" ${item.qty <= 1 ? 'disabled' : ''}>&#8722;</button>
      <div class="sc-qty-display">${item.qty}</div>
      <button class="sc-qty-btn" data-action="plus" data-id="${product.id}" aria-label="Increase quantity">&#43;</button>
    </div>
    <span class="sc-item-total">${fmt(lineTotal)}</span>
    <button class="sc-item-delete" data-id="${product.id}" aria-label="Remove ${product.name}">
      <i data-lucide="trash-2"></i>
    </button>
  `;

  return row;
}

/* ── Main render function ── */
function renderCart() {
  const cart = getCart();
  itemListEl.innerHTML = '';

  if (cart.length === 0) {
    /* Empty state */
    emptyEl.style.display       = 'block';
    discountRow.style.display   = 'none';
    summaryCol.style.display    = 'none';
    checkoutBtn.classList.add('disabled');
    subtotalEl.textContent = '$0';
    totalEl.textContent    = '$0';
    return;
  }

  /* Has items */
  emptyEl.style.display     = 'none';
  discountRow.style.display = 'flex';
  summaryCol.style.display  = 'block';
  checkoutBtn.classList.remove('disabled');

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return; /* guard: product removed from catalogue */
    itemListEl.appendChild(buildItemRow(item, product));
  });

  /* Re-init Lucide icons (for the × remove buttons) */
  if (window.lucide) lucide.createIcons();

  updateSummary();
  attachEvents();
}

/* ── Attach qty + delete event listeners ── */
function attachEvents() {
  /* Quantity buttons */
  itemListEl.querySelectorAll('.sc-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;

      const id     = Number(btn.dataset.id);
      const action = btn.dataset.action;
      const cart   = getCart();
      const item   = cart.find(i => i.id === id);
      if (!item) return;

      if (action === 'plus') {
        item.qty += 1;
        saveCart(cart);
        renderCart();
      } else if (action === 'minus' && item.qty > 1) {
        /* Minimum quantity is 1 — never remove via minus */
        item.qty -= 1;
        saveCart(cart);
        renderCart();
      }
    });
  });

  /* Delete (trash) buttons — only these remove the item entirely */
  itemListEl.querySelectorAll('.sc-item-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(Number(btn.dataset.id));
      renderCart();
    });
  });
}

/* ── Discount Apply (visual only — no actual discount logic) ── */
document.querySelector('.sc-apply-btn')?.addEventListener('click', () => {
  const input = document.getElementById('sc-discount-input');
  if (input.value.trim()) {
    /* Could show a toast or message — keeping visual for now */
    input.value = '';
    input.placeholder = 'Code applied';
  }
});

/* ── Initial render ── */
renderCart();
