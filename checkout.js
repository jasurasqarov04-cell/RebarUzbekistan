// ═══════════════════════════════════════════════════════════════
// Rebar Market — Checkout page (3-step wizard)
//   1. Cart        — items + total + CTA "Place order"
//   2. Data        — name/phone form + summary + submit
//   3. Done        — success state, link back to catalog
// ═══════════════════════════════════════════════════════════════

const CART_KEY   = 'rebar_cart';
const BX_WEBHOOK = 'https://rebar.bitrix24.kz/rest/1/slgm6bd5z4cq971h/crm.lead.add.json';

let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }

let currentStep = 1;
const maxReachedStep = { v: 1 };

initLangSwitcher();
applyLangUI();

renderCheckout();
setStep(1, /*silent*/ true);

// ───────────────────── STEP NAVIGATION ─────────────────────
function setStep(n, silent = false) {
  if (n < 1 || n > 3) return;
  currentStep = n;
  if (n > maxReachedStep.v) maxReachedStep.v = n;

  document.getElementById('checkoutRoot').dataset.step = String(n);

  document.querySelectorAll('.step-panel').forEach(p => {
    p.hidden = +p.dataset.stepPanel !== n;
  });

  document.querySelectorAll('.stepper-item').forEach(item => {
    const step = +item.dataset.stepGo;
    item.classList.toggle('is-active', step === n);
    item.classList.toggle('is-done', step < n);
    // Allow jumping back to earlier steps (or to a previously reached step).
    item.disabled = step > maxReachedStep.v;
  });

  if (n === 2) updateDataStepTotal();
  if (!silent) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.hap) window.hap('selection');
  }
}

// Stepper click — navigate back to a previously reached step
document.querySelectorAll('.stepper-item').forEach(item => {
  item.addEventListener('click', () => {
    if (item.disabled) return;
    const step = +item.dataset.stepGo;
    if (step === 3 && currentStep !== 3) return; // can't jump to "done" without submitting
    setStep(step);
  });
});

// Step 1 → Step 2
const goToDataBtn = document.getElementById('goToDataBtn');
if (goToDataBtn) {
  goToDataBtn.addEventListener('click', () => {
    if (!cart.length) return;
    setStep(2);
    setTimeout(() => document.getElementById('name')?.focus(), 250);
  });
}

// Step 2 → Step 1 (back)
const backToCartBtn = document.getElementById('backToCartBtn');
if (backToCartBtn) {
  backToCartBtn.addEventListener('click', () => setStep(1));
}

function updateDataStepTotal() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const el = document.getElementById('dataStepTotal');
  if (el) el.textContent = `${total.toLocaleString('ru-RU')} ${t('sum')}`;
}

// ───────────────────── FORM SUBMIT (step 2 → 3) ─────────────────────
document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn   = document.getElementById('submitBtn');
  const name  = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!name || phone.replace(/\D/g, '').length < 7) {
    if (window.hap) window.hap('error');
    showToast(getIcon('info', 'toast-icon') + ' ' + t('fill_form'));
    document.getElementById(!name ? 'name' : 'phone').focus();
    return;
  }

  btn.disabled = true;
  const origBtn = btn.innerHTML;
  btn.innerHTML = getIcon('loader', 'spinner') + ' …';

  const comment = cart.map(i =>
    `${i.name} ×${i.qty} ${i.unit || ''} — ${(i.price * i.qty).toLocaleString('ru-RU')} ${t('sum')}`
  ).join('\n');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  try {
    await fetch(BX_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          TITLE: `Rebar Mini App – ${name}`,
          NAME: name,
          PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
          COMMENTS: comment + `\n\n${t('total')}: ${total.toLocaleString('ru-RU')} сум`
        }
      })
    });
  } catch (err) {
    console.error('Bitrix24 error:', err);
  }

  if (window.hap) window.hap('success');
  showToast(getIcon('check', 'toast-icon') + ' ' + t('order_sent'));

  cart = [];
  localStorage.removeItem(CART_KEY);

  btn.innerHTML = origBtn;
  btn.disabled = false;

  setStep(3);
});

// ───────────────────── STEP 1 CART RENDER ─────────────────────
function renderCheckout() {
  const container = document.getElementById('checkoutCart');
  const actions   = document.getElementById('cartActions');

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">${getIcon('cart', 'icon-muted')}</div>
        <p>${t('cart_empty')}</p>
        <a href="index.html" class="btn-red" style="margin-top:18px;display:inline-flex;">
          ${getIcon('arrowRight', 'btn-icon')}
          <span>${t('keep_shopping')}</span>
        </a>
      </div>`;
    if (actions) actions.hidden = true;
    document.querySelectorAll('.stepper-item').forEach(item => {
      if (+item.dataset.stepGo > 1) item.disabled = true;
    });
    return;
  }

  const itemsHtml = cart.map((item, idx) => {
    const lineTotal = (item.price * item.qty).toLocaleString('ru-RU');
    const unitPrice = item.price.toLocaleString('ru-RU');
    const unit = escapeHtml(item.unit || '');
    const thumb = item.img
      ? `<img src="${escapeHtml(item.img)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ci-thumb-fallback',innerHTML:getIcon('box')}))">`
      : `<span class="ci-thumb-fallback">${getIcon('box')}</span>`;
    return `
    <div class="checkout-item" style="animation-delay:${idx * 40}ms">
      <div class="ci-thumb">${thumb}</div>
      <div>
        <div class="ci-name">${escapeHtml(item.name)}</div>
        <div class="ci-sub">${unitPrice} ${t('sum')} / ${unit || '—'}</div>
      </div>
      <div class="ci-qty-row">
        <div class="counter-pill" role="group" aria-label="quantity">
          <button class="cp-btn" data-act="dec" data-idx="${idx}" type="button" aria-label="minus">${getIcon('minus')}</button>
          <input class="cp-input" type="text" inputmode="numeric" value="${item.qty}" data-idx="${idx}" aria-label="quantity"/>
          <button class="cp-btn" data-act="inc" data-idx="${idx}" type="button" aria-label="plus">${getIcon('plus')}</button>
        </div>
        <span class="ci-qty-unit">${unit}</span>
      </div>
      <div class="ci-side">
        <div class="ci-price">${lineTotal}</div>
        <button class="ci-remove" data-idx="${idx}" type="button" aria-label="remove">${getIcon('trash')}</button>
      </div>
    </div>`;
  }).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  container.innerHTML = `
    <div class="checkout-list">${itemsHtml}</div>
    <div class="checkout-total-row reveal">
      <span class="ct-label">${t('total')}</span>
      <span class="ct-value">${total.toLocaleString('ru-RU')} ${t('sum')}</span>
    </div>`;

  container.querySelectorAll('.ci-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.hap) window.hap('soft');
      cart.splice(+btn.dataset.idx, 1);
      saveCart();
      renderCheckout();
    });
  });

  container.querySelectorAll('.cp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.idx;
      const act = btn.dataset.act;
      if (!cart[i]) return;
      if (act === 'inc') cart[i].qty += 1;
      else if (act === 'dec') cart[i].qty = Math.max(0, cart[i].qty - 1);
      if (cart[i].qty === 0) cart.splice(i, 1);
      if (window.hap) window.hap('selection');
      saveCart();
      renderCheckout();
    });
  });

  container.querySelectorAll('.cp-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const i = +inp.dataset.idx;
      const v = Math.max(0, parseInt(inp.value, 10) || 0);
      if (!cart[i]) return;
      if (v === 0) cart.splice(i, 1);
      else cart[i].qty = v;
      saveCart();
      renderCheckout();
    });
  });

  if (actions) actions.hidden = false;
  // Re-enable step 2 navigation when there are items
  document.querySelectorAll('.stepper-item').forEach(item => {
    const s = +item.dataset.stepGo;
    if (s === 2) item.disabled = false;
    if (s === 3) item.disabled = currentStep !== 3;
  });

  if (currentStep === 2) updateDataStepTotal();
  if (window.TPAnim) window.TPAnim.refresh();
}

function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
