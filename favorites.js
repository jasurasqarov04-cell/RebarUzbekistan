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

document.getElementById('favCatalog').innerHTML = `<div class="loading">${getIcon('loader', 'spinner')}</div>`;

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
        <div class="es-icon">${getIcon('heart', 'icon-muted')}</div>
        <p>${t('favorites_empty')}</p>
      </div>`;
    return;
  }

  container.innerHTML = favProducts.map(p => `
    <div class="card">
      <div class="card-img-wrap">
        <img src="${p.img}" onerror="this.src='https://placehold.co/300x200/f2f3f5/9ca3af?text=Rebar'" alt="${pName(p)}" loading="lazy">
        <button class="fav-btn active" data-fav-id="${p.id}">${getIcon('heartFilled')}</button>
      </div>
      <div class="card-body">
        <div class="card-cat">${pCat(p)}</div>
        <div class="card-name">${pName(p)}</div>
        <div class="card-price">${p.price.toLocaleString('ru-RU')} <span>${pCurrency(p)} / ${pUnit(p)}</span></div>
        <div class="row-btn">
          <div class="counter-pill" data-id="${p.id}">
            <button class="cp-btn">${getIcon('minus')}</button>
            <input type="number" class="cp-input" value="${getQty(p.id)}" min="0">
            <button class="cp-btn">${getIcon('plus')}</button>
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
      inp.value = v;
      updateCart(id, catalog.find(p => p.id === id), v);
      updateNavBadge();
    };
    el.querySelector('.cp-btn:first-of-type').addEventListener('click', () => set(+inp.value - 1));
    el.querySelector('.cp-btn:last-of-type').addEventListener('click',  () => set(+inp.value + 1));
    inp.addEventListener('input', () => set(inp.value));
  });

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

function getQty(id) { const l = cart.find(x => x.id === id); return l ? l.qty : 0; }
function updateCart(id, product, newQty) {
  let line = cart.find(x => x.id === id);
  if (newQty === 0) { cart = cart.filter(x => x.id !== id); }
  else if (line) { line.qty = newQty; }
  else { cart.push({ id, name: pName(product), price: product.price, qty: newQty, unit: pUnit(product) }); }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function updateNavBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const nb = document.getElementById('navCartBadge');
  if (nb) { nb.textContent = total; nb.style.display = total > 0 ? 'flex' : 'none'; }
}
