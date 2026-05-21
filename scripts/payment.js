/* ── PAYMENT PAGE SCRIPT ── */

/* ── Helpers ── */
function fmt(n) { return '$' + Number(n).toFixed(2); }

function calcSubtotal(cart) {
  return cart.reduce((sum, item) => {
    const p = products.find(p => p.id === item.id);
    return p ? sum + p.price * item.qty : sum;
  }, 0);
}

/* ── Build a summary item card (used in both desktop & mobile) ── */
function buildSummaryItem(item, product) {
  const el = document.createElement('div');
  el.className = 'pm-summary-item';
  el.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="pm-summary-item-img">
    <div class="pm-summary-item-info">
      <p class="pm-summary-item-name">${product.name}</p>
      <p class="pm-summary-item-price">${fmt(product.price * item.qty)}${item.qty > 1 ? ' &times; ' + item.qty : ''}</p>
    </div>
  `;
  return el;
}

/* ── Populate order summary panels ── */
function renderSummary() {
  const cart      = getCart();
  const subtotal  = calcSubtotal(cart);
  const SHIPPING_THRESHOLD = 80;
  const shippingFree = subtotal >= SHIPPING_THRESHOLD;
  const shippingCost = shippingFree ? 0 : 9.95;
  const total = subtotal + shippingCost;

  /* Desktop sidebar */
  const desktopItems    = document.getElementById('pm-desktop-items');
  const desktopSubtotal = document.getElementById('pm-desktop-subtotal');
  const desktopTotal    = document.getElementById('pm-desktop-total');

  /* Mobile accordion */
  const mobileItems    = document.getElementById('pm-mobile-items');
  const mobileSubtotal = document.getElementById('pm-mobile-subtotal');
  const mobileTotal    = document.getElementById('pm-mobile-total');
  const mobilePayTotal = document.getElementById('pm-mobile-pay-total');

  desktopItems.innerHTML = '';
  mobileItems.innerHTML  = '';

  if (cart.length === 0) {
    const empty = '<p style="font-size:0.84rem;opacity:0.6;padding:8px 0;">Your cart is empty.</p>';
    desktopItems.innerHTML = empty;
    mobileItems.innerHTML  = empty;
  } else {
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return;
      desktopItems.appendChild(buildSummaryItem(item, product));
      mobileItems.appendChild(buildSummaryItem(item, product));
    });
  }

  const fmtSubtotal = fmt(subtotal);
  const fmtTotal    = fmt(total);

  desktopSubtotal.textContent = fmtSubtotal;
  desktopTotal.textContent    = fmtTotal;
  mobileSubtotal.textContent  = fmtSubtotal;
  mobileTotal.textContent     = fmtTotal;
  if (mobilePayTotal) mobilePayTotal.textContent = fmtTotal;
}

/* ── Mobile Order Summary accordion ── */
const mobileHeader = document.getElementById('pm-mobile-summary-header');
const mobileBody   = document.getElementById('pm-mobile-summary-body');

if (mobileHeader && mobileBody) {
  mobileHeader.addEventListener('click', () => {
    const isOpen = mobileBody.classList.toggle('open');
    mobileHeader.classList.toggle('open', isOpen);
    if (window.lucide) lucide.createIcons();
  });
}

/* ── Card number formatting (spaces every 4 digits) ── */
const cardInput = document.getElementById('pm-card-number');
if (cardInput) {
  cardInput.addEventListener('input', () => {
    let val = cardInput.value.replace(/\D/g, '').substring(0, 16);
    cardInput.value = val.match(/.{1,4}/g)?.join(' ') ?? val;
  });
}

/* ── Expiry date formatting (MM / YY) — slash appears after 2nd digit ── */
const expiryInput = document.getElementById('pm-expiry');
if (expiryInput) {
  /* Prevent backspace getting trapped on the " / " separator */
  expiryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && expiryInput.value.endsWith(' / ')) {
      e.preventDefault();
      expiryInput.value = expiryInput.value.slice(0, -3);
    }
  });

  expiryInput.addEventListener('input', () => {
    const digits = expiryInput.value.replace(/\D/g, '').substring(0, 4);
    if (digits.length >= 2) {
      expiryInput.value = digits.substring(0, 2) + ' / ' + digits.substring(2);
    } else {
      expiryInput.value = digits;
    }
  });
}

/* ── CVC: exactly 3 digits ── */
const cvcInput = document.getElementById('pm-cvc');
if (cvcInput) {
  cvcInput.addEventListener('input', () => {
    cvcInput.value = cvcInput.value.replace(/\D/g, '').substring(0, 3);
  });
}

/* ── Clear error state when user types ── */
document.querySelectorAll('.pm-input').forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('pm-input--error');
  });
});

/* ── Required fields for billing (description is excluded) ── */
const REQUIRED_BILLING = [
  'pm-first-name', 'pm-last-name', 'pm-email', 'pm-phone',
  'pm-country', 'pm-state', 'pm-postcode', 'pm-address'
];
const REQUIRED_PAYMENT = [
  'pm-card-number', 'pm-expiry', 'pm-cvc', 'pm-card-name'
];

/* ── Validate form: returns true if valid, false + marks errors if not ── */
function validateForm() {
  let valid = true;

  [...REQUIRED_BILLING, ...REQUIRED_PAYMENT].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const empty = el.value.trim() === '';
    el.classList.toggle('pm-input--error', empty);
    if (empty) valid = false;
  });

  /* CVC must be exactly 3 digits */
  const cvcEl = document.getElementById('pm-cvc');
  if (cvcEl && cvcEl.value.replace(/\D/g, '').length !== 3) {
    cvcEl.classList.add('pm-input--error');
    valid = false;
  }

  return valid;
}

/* ── Show validation note on both desktop + mobile ── */
function showValidationNote() {
  const noteDesktop = document.getElementById('pm-validation-note-desktop');
  const noteMobile  = document.getElementById('pm-validation-note-mobile');
  if (noteDesktop) noteDesktop.classList.add('visible');
  if (noteMobile)  noteMobile.classList.add('visible');
}

function hideValidationNote() {
  const noteDesktop = document.getElementById('pm-validation-note-desktop');
  const noteMobile  = document.getElementById('pm-validation-note-mobile');
  if (noteDesktop) noteDesktop.classList.remove('visible');
  if (noteMobile)  noteMobile.classList.remove('visible');
}

/* ── Collect billing snapshot for sessionStorage ── */
function collectBilling(paymentMethod) {
  const cardVal   = (document.getElementById('pm-card-number')?.value || '').replace(/\s/g, '');
  const cardLast4 = cardVal.length >= 4 ? cardVal.slice(-4) : '';
  const state     = document.getElementById('pm-state')?.value.trim()    || '';
  const postcode  = document.getElementById('pm-postcode')?.value.trim() || '';
  const country   = document.getElementById('pm-country')?.value.trim()  || 'Australia';

  return { cardLast4, state, postcode, country, paymentMethod };
}

/* ── Navigate to order confirmation ── */
function goToConfirmation(billing) {
  sessionStorage.setItem('makes_billing', JSON.stringify(billing));
  sessionStorage.setItem('makes_order_placed', 'true');
  sessionStorage.removeItem('makes_order_number');
  window.location.href = 'order-confirmation.html';
}

/* ── Pay Now buttons (Credit Card) ── */
document.querySelectorAll('.pm-pay-now-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      window.location.href = 'shopping-cart.html';
      return;
    }

    if (!validateForm()) {
      showValidationNote();
      /* Scroll first error into view */
      const firstError = document.querySelector('.pm-input--error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    hideValidationNote();
    goToConfirmation(collectBilling('Credit Card'));
  });
});

/* ── Express Checkout buttons ── */
function setupExpressBtn(selector, paymentMethod) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', () => {
      const cart = getCart();
      if (cart.length === 0) {
        window.location.href = 'shopping-cart.html';
        return;
      }
      /* Express checkout: use whatever address fields are filled, no validation */
      const billing = collectBilling(paymentMethod);
      /* If no address filled, default to Australia */
      if (!billing.state && !billing.postcode) {
        billing.state = '';
        billing.postcode = '';
        billing.country = billing.country || 'Australia';
      }
      goToConfirmation(billing);
    });
  });
}

setupExpressBtn('.pm-gpay-btn',    'Google Pay');
setupExpressBtn('.pm-paypal-btn',  'PayPal');
setupExpressBtn('.pm-applepay-btn','Apple Pay');

/* ── Initial render ── */
renderSummary();
