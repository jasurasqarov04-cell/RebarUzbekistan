// ═══════════════════════════════════════════════════════════════
// Rebar Market — Catalog page
// ═══════════════════════════════════════════════════════════════

const CART_KEY = 'rebar_cart';
const FAV_KEY  = 'rebar_favorites';

let catalog = [];
let cart = [];
let favorites = [];
let currentCat = 'all';

loadCart();
loadFavorites();

initLangSwitcher();
applyLangUI();

fetch('products.json')
  .then(r => r.json())
  .then(data => {
    catalog = data;
    buildCategoryTabs(data);
    renderCatalog(data);
    updateBadge();
  })
  .catch(() => {
    document.getElementById('catalog').innerHTML =
      `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">${getIcon('box')}</div><p>${t('no_products')}</p></div>`;
  });

document.getElementById('search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  applyFilter(q);
});

// ===== LOCALIZED FIELD HELPERS =====
function pName(p)     { return typeof p.name     === 'object' ? (p.name[getLang()]     || p.name.ru)     : p.name; }
function pCat(p)      { return typeof p.category === 'object' ? (p.category[getLang()] || p.category.ru) : p.category; }
function pCurrency(p) { return typeof p.currency === 'object' ? (p.currency[getLang()] || p.currency.ru) : p.currency; }
function pUnit(p)     { return typeof p.unit     === 'object' ? (p.unit[getLang()]     || p.unit.ru)     : p.unit; }

function applyFilter(qRaw) {
  const q = (qRaw || '').toLowerCase();
  const filtered = catalog.filter(p => {
    const matchCat = currentCat === 'all' || pCat(p) === currentCat;
    const matchQ = pName(p).toLowerCase().includes(q) || pCat(p).toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  renderCatalog(filtered);
}

// ===== CATEGORY TABS =====
function buildCategoryTabs(data) {
  const cats = ['all', ...new Set(data.map(p => pCat(p)))];
  const tabsEl = document.getElementById('catTabs');
  tabsEl.innerHTML = cats.map(c => `
    <button class="cat-tab ${c === 'all' ? 'active' : ''}" data-cat="${c}">
      ${c === 'all' ? t('all') : c}
    </button>`).join('');

  tabsEl.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.hap) window.hap('light');
      currentCat = btn.dataset.cat;
      tabsEl.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const q = (document.getElementById('search').value || '').toLowerCase();
      applyFilter(q);
    });
  });
}

// ===== RENDER CATALOG =====
function renderCatalog(list) {
  const root = document.getElementById('catalog');
  if (!list.length) {
    root.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="es-icon">${getIcon('box')}</div>
        <p>${t('no_products')}</p>
      </div>`;
    return;
  }
  root.innerHTML = list.map(p => {
    const isFav = favorites.includes(p.id);
    return `
    <div class="card" data-card-id="${p.id}">
      <div class="card-img-wrap">
        <img src="${p.img}" onerror="this.src='https://placehold.co/300x200/ECEAE4/9B9789?text=Rebar'" alt="${escapeHtml(pName(p))}" loading="lazy">
        <button class="fav-btn ${isFav ? 'active' : ''}" data-fav-id="${p.id}" aria-label="favorite">
          ${getIcon(isFav ? 'heartFilled' : 'heart')}
        </button>
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
    </div>`;
  }).join('');

  // Counters
  root.querySelectorAll('.counter-pill').forEach(el => {
    const id = +el.dataset.id;
    const inp = el.querySelector('.cp-input');
    const set = (v, evt) => {
      v = Math.max(0, +v || 0);
      const prev = +inp.value || 0;
      inp.value = v;
      updateCart(id, catalog.find(p => p.id === id), v);
      updateBadge();
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

  // Favorites
  root.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(+btn.dataset.favId, btn);
    });
  });

  if (window.TPAnim) window.TPAnim.refresh();
}

// ===== CART =====
function loadCart() {
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
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
  saveCart();
}
function updateBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const nb = document.getElementById('navCartBadge');
  if (nb) {
    nb.textContent = total;
    nb.style.display = total > 0 ? 'flex' : 'none';
  }
}

// ===== FAVORITES =====
function loadFavorites() {
  try { favorites = JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { favorites = []; }
}
function saveFavorites() { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); }
function toggleFavorite(id, btn) {
  const idx = favorites.indexOf(id);
  if (idx === -1) {
    favorites.push(id);
    if (btn) {
      btn.innerHTML = getIcon('heartFilled');
      btn.classList.add('active');
    }
    if (window.hap) window.hap('success');
    showToast(getIcon('heartFilled', 'toast-icon') + ' ' + t('add_fav'));
  } else {
    favorites.splice(idx, 1);
    if (btn) {
      btn.innerHTML = getIcon('heart');
      btn.classList.remove('active');
    }
    if (window.hap) window.hap('soft');
    showToast(getIcon('heart', 'toast-icon') + ' ' + t('rm_fav'));
  }
  saveFavorites();
}

// ===== TOAST =====
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

// ===== HTML escape =====
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
