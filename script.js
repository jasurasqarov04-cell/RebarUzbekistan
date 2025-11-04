// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand?.();
  tg.MainButton?.hide?.();
}

// === Настройки ===
// Замените на ваш URL входящего webhook Bitrix (пример: https://your-domain.bitrix24.ru/rest/1/XXXX/crm.lead.add.json )
const BITRIX_WEBHOOK_URL = "https://rebar.bitrix24.kz/rest/1/njvrqx0snxon2xw3/crm.lead.add.json"; // <- подставь сюда реальный URL

// Цена за метр (пример). Можно указать perProduct.pricePerMeter в объекте.
const DEFAULT_PRICE_PER_METER = 24000; // сум / метр

// === Данные товаров ===
const PRODUCTS = [
  {
    id: "p-bas-4",
    name: "Базальто-композитная арматура 4 мм",
    description: `Базальто-композитная арматура считается альтернативой металлопроката. Ее используют для армирования основных строительных конструкций при возведении фундаментов зданий жилого и нежилого назначения, строительстве мостов и прочих инфраструктурных сооружений.`,
    properties: [
      { k: "Вес 1-го погонного метра", v: "0.85 кг" },
      { k: "Вес 50-метровой бухты", v: "2.55 кг" },
      { k: "Вес 100-метровой бухты", v: "5.1 кг" }
    ],
    pricePerMeter: DEFAULT_PRICE_PER_METER,
    image: "https://github.com/jasurasqarov04-cell/RebarUzbekistan/blob/c403b306beacce2873b3f7b235936958f4211477/artboard-13.png"
  },

  // можно добавить другие товары
];

// === Cart ===
let cart = [];

// === UI ===
const resultsRoot = document.getElementById("results");
const qInput = document.getElementById("q");
document.getElementById("btnSearch").addEventListener("click", () => {
  renderResults(searchProducts(qInput.value));
});

// render initial
renderResults(PRODUCTS);

// Search
function searchProducts(q) {
  const s = (q || "").trim().toLowerCase();
  if (!s) return PRODUCTS;
  return PRODUCTS.filter(p => p.name.toLowerCase().includes(s));
}

// Render listing
function renderResults(list) {
  resultsRoot.innerHTML = "";
  if (!list.length) {
    resultsRoot.innerHTML = `<div style="color:#777">Ничего не найдено</div>`;
    return;
  }
  list.forEach(p => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.name)}" />
      <div class="info">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description.substring(0,120))}...</p>
        <div class="price">от ${formatCurrency(p.pricePerMeter)} сум/м</div>
      </div>
      <div class="actions">
        <button class="btn-choose" data-id="${p.id}">Подробнее</button>
      </div>
    `;
    resultsRoot.appendChild(el);
    el.querySelector(".btn-choose").addEventListener("click", () => {
      showProductModal(p.id);
    });
  });
}

// Product modal
const modal = document.getElementById("productModal");
const modalClose = document.getElementById("modalClose");
modalClose.addEventListener("click", () => closeModal());
function showProductModal(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  document.getElementById("modalImage").src = p.image;
  document.getElementById("modalTitle").innerText = p.name;
  document.getElementById("modalDesc").innerText = p.description;
  const propsList = document.getElementById("modalProps");
  propsList.innerHTML = "";
  p.properties.forEach(it => {
    const li = document.createElement("li");
    li.innerText = `${it.k}: ${it.v}`;
    propsList.appendChild(li);
  });

  document.getElementById("pricePerMeter").innerText = formatCurrency(p.pricePerMeter) + " сум";
  document.getElementById("weightPerMeter").innerText = (p.properties[0] ? p.properties[0].v : "—");
  const metersInput = document.getElementById("calcMeters");
  metersInput.value = 1;
  updateCalcValues(p, 1);

  // пересчёт при изменении метров
  metersInput.oninput = function() {
    const meters = parseFloat(metersInput.value) || 0;
    updateCalcValues(p, meters);
  };

  // добавление в корзину
  const addBtn = document.getElementById("addToCartBtn");
  addBtn.onclick = function() {
    const meters = parseFloat(metersInput.value) || 0;
    addToCart(p, meters);
    closeModal();
    openCart();
  };

  modal.classList.remove("hidden");
}

function updateCalcValues(p, meters) {
  const price = (p.pricePerMeter || DEFAULT_PRICE_PER_METER) * meters;
  document.getElementById("calcTotalPrice").innerText = formatCurrency(price) + " сум";

  // рассчитываем вес — берем свойство Вес 1-го погонного метра если есть
  let wPer = 0;
  if (p.properties && p.properties.length) {
    // пытаемся извлечь число из строки "0.85кг" или "0.85 кг"
    const raw = p.properties[0].v.replace(",", ".").match(/[\d.]+/);
    if (raw) wPer = parseFloat(raw[0]);
  }
  const totalWeight = (wPer * meters);
  document.getElementById("calcTotalWeight").innerText = totalWeight ? totalWeight.toFixed(3) + " кг" : "—";
}

function closeModal() {
  modal.classList.add("hidden");
}

// Cart functions
function addToCart(product, meters) {
  const existing = cart.find(i => i.product.id === product.id);
  if (existing) {
    existing.meters += meters;
  } else {
    cart.push({ product, meters });
  }
  renderCartCount();
}

function renderCartCount() {
  document.getElementById("cartCount").innerText = cart.reduce((s,i)=>s+ (i.meters?1:0), 0);
}

// Cart panel
const cartPanel = document.getElementById("cartPanel");
document.getElementById("openCartBtn").addEventListener("click", openCart);
document.getElementById("closeCartBtn").addEventListener("click", closeCart);

function openCart(){
  renderCartPanel();
  cartPanel.classList.remove("hidden");
}
function closeCart(){ cartPanel.classList.add("hidden"); }

function renderCartPanel(){
  const root = document.getElementById("cartItems");
  root.innerHTML = "";
  if (!cart.length) {
    root.innerHTML = "<div>Корзина пуста</div>";
  } else {
    cart.forEach((it, idx) => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <img src="${it.product.image}" />
        <div style="flex:1">
          <div style="font-weight:600">${escapeHtml(it.product.name)}</div>
          <div style="font-size:13px;color:#666">Длина: ${it.meters} м</div>
          <div style="font-size:13px;color:#16a34a">Цена: ${formatCurrency((it.product.pricePerMeter||DEFAULT_PRICE_PER_METER)*it.meters)} сум</div>
        </div>
        <div>
          <button data-idx="${idx}" class="btn-search remove-item">✖</button>
        </div>
      `;
      root.appendChild(div);
    });
  }
  // attach remove handlers
  root.querySelectorAll(".remove-item").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      const idx = parseInt(e.currentTarget.getAttribute("data-idx"));
      cart.splice(idx,1);
      renderCartPanel();
      renderCartCount();
      updateCartTotal();
    });
  });
  updateCartTotal();
}

function updateCartTotal(){
  const total = cart.reduce((s,i)=> s + ((i.product.pricePerMeter||DEFAULT_PRICE_PER_METER) * i.meters), 0);
  document.getElementById("cartTotal").innerText = formatCurrency(total) + " сум";
  renderCartCount();
}

// Send order to Bitrix
document.getElementById("sendToBitrix").addEventListener("click", async ()=>{
  const name = document.getElementById("buyerName").value.trim();
  const phone = document.getElementById("buyerPhone").value.trim();
  if (!phone) return alert("Укажите телефон");
  if (!cart.length) return alert("Корзина пуста");

  // Формируем описание заказа
  const items = cart.map(i => `${i.product.name} — ${i.meters} м — ${formatCurrency((i.product.pricePerMeter||DEFAULT_PRICE_PER_METER)*i.meters)} сум`).join("\n");
  const total = cart.reduce((s,i)=> s + ((i.product.pricePerMeter||DEFAULT_PRICE_PER_METER) * i.meters), 0);

  const payload = {
    // Структура универсальная — подставь под свой webhook Bitrix (см. инструкцию ниже)
    name: name || "Клиент Telegram WebApp",
    phone,
    items,
    total
  };

  // Отправляем на Bitrix webhook (замени URL на свой)
  try {
    const res = await fetch(BITRIX_WEBHOOK_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Ошибка отправки");
    alert("Заказ отправлен в Bitrix!");
    // очистка корзины
    cart = [];
    renderCartPanel();
    renderCartCount();
    updateCartTotal();
  } catch (err) {
    console.error(err);
    alert("Ошибка при отправке в Bitrix. Проверьте BITRIX_WEBHOOK_URL.");
  }
});

// send order to bot via tg.sendData (если запущено в Telegram)
document.getElementById("sendToBot").addEventListener("click", ()=>{
  if (!tg || typeof tg.sendData !== "function") {
    alert("WebApp API недоступен — откройте приложение внутри Telegram.");
    return;
  }
  const name = document.getElementById("buyerName").value.trim() || "Клиент";
  const phone = document.getElementById("buyerPhone").value.trim() || "";
  const items = cart.map(i => ({name:i.product.name, meters:i.meters, pricePerMeter:i.product.pricePerMeter || DEFAULT_PRICE_PER_METER}));
  const out = {action:"order", buyer:{name, phone}, items, total: cart.reduce((s,i)=> s + ((i.product.pricePerMeter||DEFAULT_PRICE_PER_METER) * i.meters), 0)};
  tg.sendData(JSON.stringify(out));
  tg.close();
});

// Helpers
function formatCurrency(n){
  return Number(n).toLocaleString('ru-RU');
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]));
}
