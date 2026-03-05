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

// Get product ID from URL: detail.html?id=5
const params = new URLSearchParams(location.search);
const productId = parseInt(params.get('id'));

fetch('products.json')
  .then(r => r.json())
  .then(data => {
    product = data.find(p => p.id === productId);
    if (!product) {
      document.getElementById('detailContent').innerHTML =
        `<div class="empty-state"><div class="es-icon">📦</div><p>Mahsulot topilmadi</p></div>`;
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
function pSpecKey(s)  { return typeof s.key === 'object' ? (s.key[getLang()] || s.key.ru) : s.key; }

function renderDetail(p) {
  const lang = getLang();
  const isFav = favorites.includes(p.id);
  const qty = getQty(p.id);

  // Short name for header (first 20 chars)
  const shortName = pName(p);
  document.getElementById('headerTitle').textContent =
    shortName.length > 22 ? shortName.slice(0, 20) + '…' : shortName;

  // Build specs HTML
  let specsHtml = '';
  if (p.specs && p.specs.length) {
    const rows = p.specs.map(s => `
      <tr>
        <td>${pSpecKey(s)}</td>
        <td>${s.value}</td>
      </tr>`).join('');
    specsHtml = `
      <div class="detail-section">
        <div class="detail-section-title" data-i18n-section="specs">
          ${lang === 'uz' ? 'Texnik xarakteristikalar' : lang === 'en' ? 'Specifications' : 'Технические характеристики'}
        </div>
        <table class="specs-table">${rows}</table>
      </div>`;
  }

  // Build description HTML
  const desc = pDesc(p);
  let descHtml = '';
  if (desc) {
    descHtml = `
      <div class="detail-section">
        <div class="detail-section-title">
          ${lang === 'uz' ? 'Tavsif' : lang === 'en' ? 'Description' : 'Описание'}
        </div>
        <div class="detail-description">${desc}</div>
      </div>`;
  }

  document.getElementById('detailContent').innerHTML = `
    <!-- HERO -->
    <div class="detail-hero">
      <img class="detail-img"
           src="${p.img}"
           onerror="this.src='https://placehold.co/600x400/f2f3f5/9ca3af?text=Rebar'"
           alt="${pName(p)}">
      <div class="detail-hero-body">
        <div class="detail-cat">${pCat(p)}</div>
        <h2 class="detail-name">${pName(p)}</h2>
        <div class="detail-price-row">
          <span class="detail-price">${p.price.toLocaleString('ru-RU')}</span>
          <span class="detail-price-unit">${pCurrency(p)} / ${pUnit(p)}</span>
        </div>
        <div class="detail-add-row">
          <div class="counter-pill" id="counterPill">
            <button class="cp-btn" id="btnMinus">−</button>
            <input type="number" class="cp-input" id="qtyInput" value="${qty}" min="0">
            <button class="cp-btn" id="btnPlus">+</button>
          </div>
          <button class="add-cart-btn" id="addCartBtn">
            🛒 ${lang === 'uz' ? 'Savatga qo\'shish' : lang === 'en' ? 'Add to cart' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>

    ${specsHtml}
    ${descHtml}

    <!-- Fav + external link row -->
    <div style="display:flex;gap:10px;padding:0 10px 16px;">
      <button id="favBtn" style="
        flex:1; height:44px; border-radius:22px;
        border:1.5px solid var(--border); background:#fff;
        font-size:13px; font-weight:700; font-family:'Nunito',sans-serif;
        cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
        ${isFav ? '❤️' : '🤍'}
        ${lang === 'uz' ? (isFav ? 'Sevimlilardan olib tashlash' : 'Sevimliga qo\'shish') :
          lang === 'en' ? (isFav ? 'Remove from favorites' : 'Add to favorites') :
          (isFav ? 'Из избранного' : 'В избранное')}
      </button>
      <a href="${p.url}" target="_blank" style="
        flex:1; height:44px; border-radius:22px;
        border:1.5px solid var(--border); background:#fff;
        font-size:13px; font-weight:700; font-family:'Nunito',sans-serif;
        cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;
        text-decoration:none; color:var(--text);">
        🌐 rebar.uz
      </a>
    </div>
  `;

  // Counter logic
  const inp = document.getElementById('qtyInput');
  const setQty = v => {
    v = Math.max(0, +v || 0);
    inp.value = v;
    updateCart(p.id, p, v);
    updateNavBadge();
  };
  document.getElementById('btnMinus').addEventListener('click', () => setQty(+inp.value - 1));
  document.getElementById('btnPlus').addEventListener('click',  () => setQty(+inp.value + 1));
  inp.addEventListener('input', () => setQty(inp.value));

  // Add to cart button — increments by 1
  document.getElementById('addCartBtn').addEventListener('click', () => {
    const cur = +inp.value || 0;
    setQty(cur + 1);
    showToast('🛒 ' + (lang === 'uz' ? 'Savatga qo\'shildi' : lang === 'en' ? 'Added to cart' : 'Добавлено в корзину'));
  });

  // Favorite button
  document.getElementById('favBtn').addEventListener('click', () => {
    const idx = favorites.indexOf(p.id);
    if (idx === -1) {
      favorites.push(p.id);
      showToast('❤️ ' + (lang === 'uz' ? 'Sevimliga qo\'shildi' : lang === 'en' ? 'Added to favorites' : 'Добавлено в избранное'));
    } else {
      favorites.splice(idx, 1);
    }
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    renderDetail(p); // re-render to update button state
  });
}

// ===== CART =====
function getQty(id)  { const l = cart.find(x => x.id === id); return l ? l.qty : 0; }
function updateCart(id, p, newQty) {
  let line = cart.find(x => x.id === id);
  if (newQty === 0)  { cart = cart.filter(x => x.id !== id); }
  else if (line)     { line.qty = newQty; }
  else               { cart.push({ id, name: pName(p), price: p.price, qty: newQty, unit: pUnit(p) }); }
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
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}
