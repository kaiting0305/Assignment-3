/* ── MAKES Handcrafted Jewellery — Order Confirmation ── */
/* Reads the last order snapshot from sessionStorage (saved by payment.js),
   then clears the cart from localStorage so the cart starts fresh.
   Guards against direct access with no order placed. */

(function () {
  'use strict';

  /* ── Guard: only accessible after a real order placement ── */
  if (sessionStorage.getItem('makes_order_placed') !== 'true') {
    window.location.replace('shopping-cart.html');
    return;
  }
  /* Consume the flag so refreshing the page redirects gracefully */
  sessionStorage.removeItem('makes_order_placed');

  /* ── Helpers ── */
  const fmt = (n) => '$' + Number(n).toFixed(2);

  function generateOrderNumber() {
    return '#' + Math.floor(1000000 + Math.random() * 9000000);
  }

  /* ── Read cart BEFORE clearing it ── */
  const cart = getCart();
  const SHIPPING_THRESHOLD = 80;

  /* ── Snapshot billing info saved by payment.js ── */
  let billing = {};
  try {
    billing = JSON.parse(sessionStorage.getItem('makes_billing') || '{}');
  } catch (e) { /* ignore */ }

  /* ── Clear cart now that order is confirmed ── */
  saveCart([]);

  /* ── Populate Order Number ── */
  const orderNumberEl = document.getElementById('oc-order-number');
  if (orderNumberEl) {
    let orderNo = sessionStorage.getItem('makes_order_number');
    if (!orderNo) {
      orderNo = generateOrderNumber();
      sessionStorage.setItem('makes_order_number', orderNo);
    }
    orderNumberEl.textContent = orderNo;
  }

  /* ── Populate Payment Method ── */
  const paymentMethodEl = document.getElementById('oc-payment-method');
  if (paymentMethodEl) {
    const method = billing.paymentMethod || 'Credit Card';
    if (method === 'Credit Card' && billing.cardLast4) {
      paymentMethodEl.textContent = 'Visa ending in ' + billing.cardLast4;
    } else {
      paymentMethodEl.textContent = method;
    }
  }

  /* ── Populate Shipping Address ── */
  const shippingAddressEl = document.getElementById('oc-shipping-address');
  if (shippingAddressEl) {
    const parts = [billing.state, billing.postcode].filter(Boolean);
    if (parts.length) {
      shippingAddressEl.textContent = parts.join(' ') + ', ' + (billing.country || 'Australia');
    } else {
      shippingAddressEl.textContent = billing.country || 'Australia';
    }
  }

  /* ── Render Items ── */
  const itemsEl = document.getElementById('oc-items');
  if (itemsEl) {
    if (cart.length === 0) {
      itemsEl.innerHTML = '<p style="font-size:0.85rem;opacity:0.6;">No items found.</p>';
    } else {
      cart.forEach((entry) => {
        const product = products.find((p) => p.id === entry.id);
        if (!product) return;

        const item = document.createElement('div');
        item.className = 'oc-item';
        item.innerHTML = `
          <img class="oc-item-img" src="${product.image}" alt="${product.name}">
          <div class="oc-item-info">
            <p class="oc-item-name">${product.name}</p>
            <p class="oc-item-price">Qty: ${entry.qty}</p>
          </div>
          <p class="oc-item-price">$${(product.price * entry.qty).toFixed(2)}</p>
        `;
        itemsEl.appendChild(item);
      });
    }
  }

  /* ── Calculate and render Totals ── */
  const subtotal = cart.reduce((sum, entry) => {
    const product = products.find((p) => p.id === entry.id);
    return product ? sum + product.price * entry.qty : sum;
  }, 0);

  const shippingFree = subtotal >= SHIPPING_THRESHOLD;
  const shippingCost = shippingFree ? 0 : 9.95;
  const total = subtotal + shippingCost;

  const subtotalEl = document.getElementById('oc-subtotal');
  const shippingEl = document.getElementById('oc-shipping');
  const totalEl    = document.getElementById('oc-total');

  if (subtotalEl) subtotalEl.textContent = fmt(subtotal);
  if (shippingEl) shippingEl.textContent = shippingFree ? 'Free' : fmt(shippingCost);
  if (totalEl)    totalEl.textContent    = fmt(total);

})();
