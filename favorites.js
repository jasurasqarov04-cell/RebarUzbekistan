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

fetch('products.json')
  .then(r => r.json())
  .then(data => {
    catalog = data;
    renderFavorites();
  });

function renderFavorites() {
  const container = document.getElementById('favCatalog');
  const favProducts = catalog.filter(p => favorites.includes(p.id));

  if (!favProducts.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="es-icon">❤️</div>
        <p>${t('favorites_empty')}</p>
      </div>`;
    return;
  }

  const html = favProducts.map(p => `
    <div class="card">
      <div class="card-img-wrap">
        <img src="${p.img}"
          onerror="this.src='https://placehold.co/300x200/f2f3f5/9ca3af?text=Rebar'"
          alt="${p.name}" loading="lazy">
        <button class="fav-btn active" data-fav-id="${p.id}">❤️</button>
      </div>
      <div class="card-body">
        <div class="card-cat">${p.category}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-price">
          ${p.price.toLocaleString('ru-RU')} <span>${t('sum')} ${t('per')} ${p.unit}</span>
        </div>
        <div class="row-btn">
          <div class="counter-pill" data-id="${p.id}">
            <button class="cp-btn">−</button>
            <input type="number" class="cp-input" value="${getQty(p.id)}" min="0">
            <button class="cp-btn">+</button>
          </div>
          <a class="detail-btn" href="${p.url}" target="_blank">${t('details')}</a>
        </div>
      </div>
    </div>`).join('');

  container.innerHTML = html;

  // Counter events
  container.querySelectorAll('.counter-pill').forEach(el => {
    const id = +el.dataset.id;
    const inp = el.querySelector('.cp-input');
    const set = v => {
      v = Math.max(0, +v || 0);
      inp.value = v;
      updateCart(id, catalog.find(p => p.id === id), v);
      updateNavBadge();
    };
    el.querySelector('.cp-btn:first-of-type').addEventListener('click', () => set(+inp.value - 1));
    el.querySelector('.cp-btn:last-of-type').addEventListener('click', () => set(+inp.value + 1));
    inp.addEventListener('input', () => set(inp.value));
  });

  // Remove from favorites
  container.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.favId;
      const idx = favorites.indexOf(id);
      if (idx !== -1) favorites.splice(idx, 1);
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
      renderFavorites();
    });
  });
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
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateNavBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const navBadge = document.getElementById('navCartBadge');
  if (navBadge) {
    navBadge.textContent = total;
    navBadge.style.display = total > 0 ? 'flex' : 'none';
  }
}
