// ═══════════════════════════════════════════════════════════════
// Rebar Market — Favorites page
// ═══════════════════════════════════════════════════════════════

const CART_KEY = 'rebar_cart';
const FAV_KEY  = 'rebar_favorites';

let cart = [];
let favorites = [];
let catalog = [];

try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }
try { favorites = JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { favorites = []; }

initLangSwitcher();
applyLangUI();
updateNavBadge();

function pName(p)     { return typeof p.name     === 'object' ? (p.name[getLang()]     || p.name.ru)     : p.name; }
function pCat(p)      { return typeof p.category === 'object' ? (p.category[getLang()] || p.category.ru) : p.category; }
function pCurrency(p) { return typeof p.currency === 'object' ? (p.currency[getLang()] || p.currency.ru) : p.currency; }
function pUnit(p)     { return typeof p.unit     === 'object' ? (p.unit[getLang()]     || p.unit.ru)     : p.unit; }

fetch('products.json')
  .then(r => r.json())
  .then(data => {
    catalog = data;
    renderFavorites();
  })
  .catch(() => {
    document.getElementById('favCatalog').innerHTML =
      `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">${getIcon('heart', 'icon-muted')}</div><p>${t('favorites_empty')}</p></div>`;
  });

function renderFavorites() {
  const container = document.getElementById('favCatalog');
  const favProducts = catalog.filter(p => favorites.includes(p.id));

  const bar = document.getElementById('favCountBar');
  if (bar) {
    bar.innerHTML = `<span>${t('favorites_title')} <span style="color:var(--text-3);font-weight:600;margin-left:6px;">${favProducts.length}</span></span>`;
  }

  if (!favProducts.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="es-icon">${getIcon('heart', 'icon-muted')}</div>
        <p>${t('favorites_empty')}</p>
      </div>`;
    return;
  }

  container.innerHTML = favProducts.map(p => `
    <div class="card" data-card-id="${p.id}">
      <div class="card-img-wrap">
        <img src="${p.img}" onerror="this.src='https://placehold.co/300x200/ECEAE4/9B9789?text=Rebar'" alt="${escapeHtml(pName(p))}" loading="lazy">
        <button class="fav-btn active" data-fav-id="${p.id}" aria-label="favorite">${getIcon('heartFilled')}</button>
      </div>
      <div class="card-body">
        <div class="card-cat">${escapeHtml(pCat(p))}</div>
        <div class="card-name">${escapeHtml(pName(p))}</div>
        <div class="card-price">${p.price.toLocaleString('ru-RU')} <span>${escapeHtml(pCurrency(p))} / ${escapeHtml(pUnit(p))}</span></div>
        <div class="row-btn">
          <div class="counter-pill" data-id="${p.id}">
            <button class="cp-btn cp-minus" type="button" aria-label="minus">${getIcon('minus')}</button>
            <input type="number" class="cp-input" value="${getQty(p.id)}" min="0" inputmode="numeric">
            <button class="cp-btn cp-plus" type="button" aria-label="plus">${getIcon('plus')}</button>
          </div>
          <a class="detail-btn" href="detail.html?id=${p.id}">${t('details')}</a>
        </div>
      </div>
    </div>`).join('');

  container.querySelectorAll('.counter-pill').forEach(el => {
    const id = +el.dataset.id;
    const inp = el.querySelector('.cp-input');
    const set = v => {
      v = Math.max(0, +v || 0);
      const prev = +inp.value || 0;
      inp.value = v;
      updateCart(id, catalog.find(p => p.id === id), v);
      updateNavBadge();
      if (v > prev) {
        if (window.hap) window.hap('light');
        if (window.flyToCart) window.flyToCart(el.closest('.card'));
      } else if (v < prev) {
        if (window.hap) window.hap('soft');
      }
    };
    el.querySelector('.cp-minus').addEventListener('click', () => set(+inp.value - 1));
    el.querySelector('.cp-plus').addEventListener('click',  () => set(+inp.value + 1));
    inp.addEventListener('input', () => set(inp.value));
  });

  container.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.favId;
      const idx = favorites.indexOf(id);
      if (idx !== -1) {
        favorites.splice(idx, 1);
        if (window.hap) window.hap('soft');
      }
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
      // Animate card removal
      const card = btn.closest('.card');
      if (card) {
        card.style.transition = 'opacity .25s, transform .25s';
        card.style.opacity = '0';
        card.style.transform = 'scale(.95)';
        setTimeout(() => renderFavorites(), 260);
      } else {
        renderFavorites();
      }
    });
  });

  if (window.TPAnim) window.TPAnim.refresh();
}

function getQty(id) { const l = cart.find(x => x.id === id); return l ? l.qty : 0; }
function updateCart(id, product, newQty) {
  if (!product) return;
  let line = cart.find(x => x.id === id);
  if (newQty === 0) { cart = cart.filter(x => x.id !== id); }
  else if (line) { line.qty = newQty; }
  else {
    cart.push({
      id,
      name: pName(product),
      price: product.price,
      qty: newQty,
      unit: pUnit(product),
      img: product.img
    });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function updateNavBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const nb = document.getElementById('navCartBadge');
  if (nb) { nb.textContent = total; nb.style.display = total > 0 ? 'flex' : 'none'; }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
