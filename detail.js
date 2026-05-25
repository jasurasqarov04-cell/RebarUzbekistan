// ═══════════════════════════════════════════════════════════════
// Rebar Market — Detail page
// ═══════════════════════════════════════════════════════════════

const CART_KEY = 'rebar_cart';
const FAV_KEY  = 'rebar_favorites';

let cart = [];
let favorites = [];
let product = null;

try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }
try { favorites = JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { favorites = []; }

initLangSwitcher();
applyLangUI();
updateNavBadge();

const params = new URLSearchParams(location.search);
const productId = parseInt(params.get('id'));

document.getElementById('detailContent').innerHTML =
  `<div class="loading">${getIcon('loader', 'spinner')}</div>`;

fetch('products.json')
  .then(r => r.json())
  .then(data => {
    product = data.find(p => p.id === productId);
    if (!product) {
      document.getElementById('detailContent').innerHTML =
        `<div class="empty-state"><div class="es-icon">${getIcon('box')}</div><p>${t('not_found')}</p></div>`;
      return;
    }
    renderDetail(product);
  });

// ===== LOCALIZED FIELD HELPERS =====
function pName(p)     { return typeof p.name        === 'object' ? (p.name[getLang()]        || p.name.ru)        : p.name; }
function pCat(p)      { return typeof p.category    === 'object' ? (p.category[getLang()]    || p.category.ru)    : p.category; }
function pCurrency(p) { return typeof p.currency    === 'object' ? (p.currency[getLang()]    || p.currency.ru)    : p.currency; }
function pUnit(p)     { return typeof p.unit        === 'object' ? (p.unit[getLang()]        || p.unit.ru)        : p.unit; }
function pDesc(p)     { return p.description ? (typeof p.description === 'object' ? (p.description[getLang()] || p.description.ru) : p.description) : null; }
function pSpecKey(s)  { return typeof s.key   === 'object' ? (s.key[getLang()]   || s.key.ru)   : s.key; }
function pSpecVal(s)  { return typeof s.value === 'object' ? (s.value[getLang()] || s.value.ru) : s.value; }

function renderDetail(p) {
  const lang = getLang();
  const isFav = favorites.includes(p.id);
  const qty = getQty(p.id);

  const shortName = pName(p);
  document.getElementById('headerTitle').textContent =
    shortName.length > 22 ? shortName.slice(0, 20) + '…' : shortName;

  let specsHtml = '';
  if (p.specs && p.specs.length) {
    const rows = p.specs.map(s => `
      <tr>
        <td>${escapeHtml(pSpecKey(s))}</td>
        <td>${escapeHtml(pSpecVal(s))}</td>
      </tr>`).join('');
    specsHtml = `
      <div class="detail-section reveal">
        <div class="detail-section-title">
          ${getIcon('list')}
          <span>${t('specs_title')}</span>
        </div>
        <table class="specs-table">${rows}</table>
      </div>`;
  }

  const desc = pDesc(p);
  let descHtml = '';
  if (desc) {
    descHtml = `
      <div class="detail-section reveal">
        <div class="detail-section-title">
          ${getIcon('info')}
          <span>${t('desc_title')}</span>
        </div>
        <div class="detail-description">${escapeHtml(desc)}</div>
      </div>`;
  }

  const root = document.getElementById('detailContent');
  root.innerHTML = `
    <!-- HERO -->
    <div class="detail-hero reveal">
      <div class="detail-img-wrap">
        <img class="detail-img"
             src="${p.img}"
             onerror="this.src='https://placehold.co/600x400/ECEAE4/9B9789?text=Rebar'"
             alt="${escapeHtml(pName(p))}">
        <span class="detail-img-pattern"></span>
        <span class="detail-img-overlay"></span>
        <button class="detail-fav-corner ${isFav ? 'active' : ''}" id="favBtn" aria-label="favorite">
          ${getIcon(isFav ? 'heartFilled' : 'heart')}
        </button>
      </div>
      <div class="detail-hero-body">
        <div class="detail-cat">${escapeHtml(pCat(p))}</div>
        <h2 class="detail-name">${escapeHtml(pName(p))}</h2>
        <div class="detail-price-row">
          <span class="detail-price">${p.price.toLocaleString('ru-RU')}</span>
          <span class="detail-price-unit">${escapeHtml(pCurrency(p))} / ${escapeHtml(pUnit(p))}</span>
        </div>
        <div class="detail-add-row">
          <div class="counter-pill" id="counterPill">
            <button class="cp-btn" id="btnMinus" type="button" aria-label="minus">${getIcon('minus')}</button>
            <input type="number" class="cp-input" id="qtyInput" value="${qty}" min="0" inputmode="numeric">
            <button class="cp-btn" id="btnPlus" type="button" aria-label="plus">${getIcon('plus')}</button>
          </div>
          <button class="add-cart-btn" id="addCartBtn" type="button">
            ${getIcon('cart', 'btn-icon')} <span>${t('add_to_cart')}</span>
          </button>
        </div>
      </div>
    </div>

    ${specsHtml}
    ${descHtml}

    <div class="detail-action-row reveal">
      <button id="favBtn2" type="button" class="detail-secondary-btn ${isFav ? 'active' : ''}">
        ${getIcon(isFav ? 'heartFilled' : 'heart', 'fav-icon-main')}
        <span>${isFav ? t('remove_fav_btn') : t('add_fav_btn')}</span>
      </button>
      ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener" class="detail-secondary-btn">
        ${getIcon('globe', 'btn-icon')} <span>rebar.uz</span>
      </a>` : ''}
    </div>
  `;

  if (window.TPAnim) window.TPAnim.refresh();

  // Counter
  const inp = document.getElementById('qtyInput');
  const setQty = v => {
    v = Math.max(0, +v || 0);
    const prev = +inp.value || 0;
    inp.value = v;
    updateCart(p.id, p, v);
    updateNavBadge();
    if (v > prev && window.hap) window.hap('light');
    else if (v < prev && window.hap) window.hap('soft');
  };
  document.getElementById('btnMinus').addEventListener('click', () => setQty(+inp.value - 1));
  document.getElementById('btnPlus').addEventListener('click',  () => setQty(+inp.value + 1));
  inp.addEventListener('input', () => setQty(inp.value));

  // Add to cart
  document.getElementById('addCartBtn').addEventListener('click', () => {
    const cur = +inp.value || 0;
    setQty(cur + 1);
    if (window.flyToCart) window.flyToCart(document.querySelector('.detail-img-wrap'));
    showToast(getIcon('cart', 'toast-icon') + ' ' + t('add_cart'));
  });

  // Favorite buttons (corner + bottom)
  [document.getElementById('favBtn'), document.getElementById('favBtn2')].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const idx = favorites.indexOf(p.id);
      if (idx === -1) {
        favorites.push(p.id);
        if (window.hap) window.hap('success');
        showToast(getIcon('heartFilled', 'toast-icon') + ' ' + t('add_fav'));
      } else {
        favorites.splice(idx, 1);
        if (window.hap) window.hap('soft');
        showToast(getIcon('heart', 'toast-icon') + ' ' + t('rm_fav'));
      }
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
      renderDetail(p);
    });
  });
}

// ===== CART =====
function getQty(id)  { const l = cart.find(x => x.id === id); return l ? l.qty : 0; }
function updateCart(id, p, newQty) {
  let line = cart.find(x => x.id === id);
  if (newQty === 0)  { cart = cart.filter(x => x.id !== id); }
  else if (line)     { line.qty = newQty; }
  else {
    cart.push({
      id,
      name: pName(p),
      price: p.price,
      qty: newQty,
      unit: pUnit(p),
      img: p.img
    });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function updateNavBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const nb = document.getElementById('navCartBadge');
  if (nb) { nb.textContent = total; nb.style.display = total > 0 ? 'flex' : 'none'; }
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

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
