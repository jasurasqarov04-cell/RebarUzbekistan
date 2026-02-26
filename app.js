const CART_KEY = 'rebar_cart';
const FAV_KEY  = 'rebar_favorites';

let catalog = [];
let cart = [];
let favorites = [];
let currentCat = 'all';

loadCart();
loadFavorites();

fetch('products.json')
  .then(r => r.json())
  .then(data => {
    catalog = data;
    buildCategoryTabs(data);
    renderCatalog(data);
    updateBadge();
  });

// Init language UI
initLangSwitcher();
applyLangUI();

// Search
document.getElementById('search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = catalog.filter(p => {
    const matchCat = currentCat === 'all' || p.category === currentCat;
    const matchQ = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  renderCatalog(filtered);
});

// ===== CATEGORY TABS =====
function buildCategoryTabs(data) {
  const cats = ['all', ...new Set(data.map(p => p.category))];
  const tabsEl = document.getElementById('catTabs');
  tabsEl.innerHTML = cats.map(c => `
    <button class="cat-tab ${c === 'all' ? 'active' : ''}" data-cat="${c}">
      ${c === 'all' ? t('all') : c}
    </button>
  `).join('');

  tabsEl.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCat = btn.dataset.cat;
      tabsEl.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const q = document.getElementById('search').value.toLowerCase();
      const filtered = catalog.filter(p => {
        const matchCat = currentCat === 'all' || p.category === currentCat;
        const matchQ = p.name.toLowerCase().includes(q);
        return matchCat && matchQ;
      });
      renderCatalog(filtered);
    });
  });
}

// ===== RENDER CATALOG =====
function renderCatalog(list) {
  if (!list.length) {
    document.getElementById('catalog').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="es-icon">📦</div>
        <p>Mahsulot topilmadi</p>
      </div>`;
    return;
  }

  const html = list.map(p => {
    const isFav = favorites.includes(p.id);
    return `
    <div class="card">
      <div class="card-img-wrap">
        <img src="${p.img}" 
          onerror="this.src='https://placehold.co/300x200/f2f3f5/9ca3af?text=Rebar'"
          alt="${p.name}" loading="lazy">
        <button class="fav-btn" data-fav-id="${p.id}" title="${t('add_fav')}">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="card-body">
        <div class="card-cat">${p.category}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-price">
          ${p.price.toLocaleString('ru-RU')} <span>${t('sum')} ${t('per')} ${p.unit}</span>
        </div>
        <div class="row-btn">
          <div class="counter-pill" data-id="${p.id}">
            <button class="cp-btn" aria-label="minus">−</button>
            <input type="number" class="cp-input" value="${getQty(p.id)}" min="0">
            <button class="cp-btn" aria-label="plus">+</button>
          </div>
          <a class="detail-btn" href="${p.url}" target="_blank">${t('details')}</a>
        </div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('catalog').innerHTML = html;

  // Counter events
  document.querySelectorAll('.counter-pill').forEach(el => {
    const id = +el.dataset.id;
    const inp = el.querySelector('.cp-input');
    const set = v => {
      v = Math.max(0, +v || 0);
      inp.value = v;
      const product = catalog.find(p => p.id === id);
      updateCart(id, product, v);
      updateBadge();
    };
    el.querySelector('.cp-btn:first-of-type').addEventListener('click', () => set(+inp.value - 1));
    el.querySelector('.cp-btn:last-of-type').addEventListener('click', () => set(+inp.value + 1));
    inp.addEventListener('input', () => set(inp.value));
  });

  // Favorites events
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.favId;
      toggleFavorite(id, btn);
    });
  });
}

// ===== CART =====
function loadCart() {
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function getQty(id) {
  const line = cart.find(x => x.id === id);
  return line ? line.qty : 0;
}
function updateCart(id, product, newQty) {
  let line = cart.find(x => x.id === id);
  if (newQty === 0) {
    cart = cart.filter(x => x.id !== id);
  } else if (line) {
    line.qty = newQty;
  } else {
    cart.push({ id, name: product.name, price: product.price, qty: newQty, unit: product.unit });
  }
  saveCart();
}
function updateBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const navBadge = document.getElementById('navCartBadge');
  if (navBadge) {
    navBadge.textContent = total;
    navBadge.style.display = total > 0 ? 'flex' : 'none';
  }
}

// ===== FAVORITES =====
function loadFavorites() {
  try { favorites = JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { favorites = []; }
}
function saveFavorites() {
  localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
}
function toggleFavorite(id, btn) {
  const idx = favorites.indexOf(id);
  if (idx === -1) {
    favorites.push(id);
    if (btn) btn.textContent = '❤️';
    showToast('❤️ ' + t('add_fav'));
  } else {
    favorites.splice(idx, 1);
    if (btn) btn.textContent = '🤍';
  }
  saveFavorites();
}

// ===== TOAST =====
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}
