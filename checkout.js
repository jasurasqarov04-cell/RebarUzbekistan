// ═══════════════════════════════════════════════════════════════
// Rebar Market — Checkout page
// ═══════════════════════════════════════════════════════════════

const CART_KEY   = 'rebar_cart';
const BX_WEBHOOK = 'https://rebar.bitrix24.kz/rest/1/slgm6bd5z4cq971h/crm.lead.add.json';

let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }

initLangSwitcher();
applyLangUI();

renderCheckout();

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
  localStorage.removeItem(CART_KEY);

  // Show success state inline
  const container = document.getElementById('checkoutCart');
  container.innerHTML = `
    <div class="empty-state reveal in-view" style="padding:40px 20px;">
      <div class="es-icon" style="background:var(--green-bg);width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;">
        <span style="color:var(--green);width:42px;height:42px;display:flex;">${getIcon('check')}</span>
      </div>
      <p style="font-size:16px;color:var(--text);">${t('order_sent')}</p>
    </div>`;
  document.getElementById('orderForm').style.display = 'none';

  setTimeout(() => { location.href = 'index.html'; }, 2500);
});

function renderCheckout() {
  const container = document.getElementById('checkoutCart');
  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">${getIcon('cart', 'icon-muted')}</div>
        <p>${t('cart_empty')}</p>
      </div>`;
    document.getElementById('orderForm').style.display = 'none';
    return;
  }

  const itemsHtml = cart.map((item, idx) => `
    <div class="checkout-item" style="animation-delay:${idx * 40}ms">
      <div class="ci-name">${escapeHtml(item.name)}</div>
      <div class="ci-qty">${item.qty} ${escapeHtml(item.unit || '')}</div>
      <div class="ci-price">${(item.price * item.qty).toLocaleString('ru-RU')} ${t('sum')}</div>
      <button class="ci-remove" data-idx="${idx}" type="button" aria-label="remove">${getIcon('trash')}</button>
    </div>`).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  container.innerHTML = `
    <div class="checkout-list">${itemsHtml}</div>
    <div class="checkout-total-row reveal">
      <span class="ct-label">${t('total')}:</span>
      <span class="ct-value">${total.toLocaleString('ru-RU')} ${t('sum')}</span>
    </div>`;

  container.querySelectorAll('.ci-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.hap) window.hap('soft');
      cart.splice(+btn.dataset.idx, 1);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      renderCheckout();
    });
  });

  document.getElementById('orderForm').style.display = 'block';
  if (window.TPAnim) window.TPAnim.refresh();
}

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
