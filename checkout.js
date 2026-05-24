const CART_KEY   = 'rebar_cart';
const BX_WEBHOOK = 'https://rebar.bitrix24.kz/rest/1/slgm6bd5z4cq971h/crm.lead.add.json';

let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }

initLangSwitcher();
applyLangUI();

renderCheckout();

document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn   = e.target.querySelector('.submit-btn');
  const name  = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if (!name || !phone) return;

  btn.disabled = true;
  btn.innerHTML = getIcon('loader', 'spinner') + ' ...';

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
  } catch (err) { console.error('Bitrix24 error:', err); }

  showToast(getIcon('check', 'toast-icon') + ' ' + t('order_sent'));
  localStorage.removeItem(CART_KEY);
  setTimeout(() => { location.href = 'index.html'; }, 2000);
});

function renderCheckout() {
  const container = document.getElementById('checkoutCart');
  if (!cart.length) {
    container.innerHTML = `<div class="empty-state"><div class="es-icon">${getIcon('cart', 'icon-muted')}</div><p>${t('cart_empty')}</p></div>`;
    document.getElementById('orderForm').style.display = 'none';
    return;
  }

  const itemsHtml = cart.map((item, idx) => `
    <div class="checkout-item">
      <div class="ci-name">${item.name}</div>
      <div class="ci-qty">${item.qty} ${item.unit || ''}</div>
      <div class="ci-price">${(item.price * item.qty).toLocaleString('ru-RU')} ${t('sum')}</div>
      <button class="ci-remove" data-idx="${idx}">${getIcon('remove')}</button>
    </div>`).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  container.innerHTML = `
    <div class="checkout-list">${itemsHtml}</div>
    <div class="checkout-total-row">
      <span class="ct-label">${t('total')}:</span>
      <span class="ct-value">${total.toLocaleString('ru-RU')} ${t('sum')}</span>
    </div>`;

  container.querySelectorAll('.ci-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.splice(+btn.dataset.idx, 1);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      renderCheckout();
      if (!cart.length) document.getElementById('orderForm').style.display = 'none';
    });
  });

  document.getElementById('orderForm').style.display = 'block';
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}
