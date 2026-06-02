/* ── MAKES Handcrafted Jewellery — Cart Helpers ── */
/* Loaded on: product-detail, shopping-cart, order-confirmation */

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

function addToCart(id, qty) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty });
  }
  saveCart(cart);
}

function removeFromCart(id) {
  saveCart(getCart().filter(item => item.id !== id));
}

function updateQty(id, qty) {
  const cart = getCart();
  const item = cart.find(item => item.id === id);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart(cart);
  }
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}
