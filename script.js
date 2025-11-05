// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand?.();
  tg.MainButton?.hide?.();
}

// === Настройки ===
const BITRIX_WEBHOOK_URL = "https://rebar.bitrix24.kz/rest/1/slgm6bd5z4cq971h/crm.lead.add.json"; 
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
    image: "https://via.placeholder.com/600x600.png?text=Basalto+4mm"
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
    const weightPerMeterText = (p.properties[0] ? p.properties[0].v.replace('кг','') : "—").trim();
    
    // Калькулятор на карточке товара
    const price = p.pricePerMeter || DEFAULT_PRICE_PER_METER;
    el.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.name)}" />
      <div class="info">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description.substring(0,120))}...</p>
        <div class="price">от ${formatCurrency(price)} сум/м</div>
        
        <div class="calculator-in-card" data-id="${p.id}" data-price="${price}" data-weight="${weightPerMeterText}">
            <label>Длина (м): <input type="number" min="1" step="1" value="1" class="calc-meters-input"></label>
            <div class="calc-row">
                <div>Итого: <strong class="calc-total-price">${formatCurrency(price)} сум</strong></div>
                <div>Вес: <strong class="calc-total-weight">${weightPerMeterText} кг</strong></div>
            </div>
            <div class="actions">
                <button class="btn-choose add-to-cart-card">Добавить в корзину</button>
                <button class="btn-search btn-details" data-id="${p.id}">Подробнее</button>
            </div>
        </div>
      </div>
    `;
    resultsRoot.appendChild(el);
    
    // Инициализация калькулятора и обработчика кнопки "Добавить в корзину" на карточке
    handleProductCardCalc(el, p);

    // Обработчик кнопки "Подробнее"
    el.querySelector(".btn-details").addEventListener("click", () => {
      showProductModal(p.id);
    });
  });
}

// Логика калькулятора на карточке товара
function handleProductCardCalc(cardElement, product) {
    const calcRoot = cardElement.querySelector(".calculator-in-card");
    const metersInput = calcRoot.querySelector(".calc-meters-input");
    const totalPriceStrong = calcRoot.querySelector(".calc-total-price");
    const totalWeightStrong = calcRoot.querySelector(".calc-total-weight");
    const addToCartBtn = calcRoot.querySelector(".add-to-cart-card");
    
    const pricePerMeter = parseFloat(calcRoot.getAttribute("data-price"));
    const weightPerMeterRaw = calcRoot.getAttribute("data-weight");
    let weightPerMeter = 0;
    
    // Извлечение числа из строки веса (если есть)
    const raw = weightPerMeterRaw.replace(",", ".").match(/[\d.]+/);
    if (raw) weightPerMeter = parseFloat(raw[0]);
    
    function updateCardCalc() {
        const meters = parseFloat(metersInput.value) || 0;
        const total = pricePerMeter * meters;
        const totalWeight = weightPerMeter * meters;
        
        totalPriceStrong.innerText = formatCurrency(total) + " сум";
        totalWeightStrong.innerText = totalWeight ? totalWeight.toFixed(3) + " кг" : "—";
    }

    metersInput.oninput = updateCardCalc;
    metersInput.onchange = updateCardCalc; // Добавим и change

    addToCartBtn.onclick = function() {
        const meters = parseFloat(metersInput.value) || 1;
        addToCart(product, meters);
        // можно сбросить значение после добавления, но оставим для удобства
        openCart();
    };
    
    updateCardCalc(); // Обновить при инициализации
}


// Product modal
const modal = document.getElementById("productModal");
const modalClose = document.getElementById("modalClose");
const modalBackBtn = document.getElementById("modalBackBtn"); // Новая кнопка "Назад"

modalClose.addEventListener("click", () => closeModal());
modalBackBtn.addEventListener("click", () => closeModal()); // Обработчик для "Назад"

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
  
  // Калькулятор и кнопка "Добавить в корзину" были удалены из модального окна
  
  modal.classList.remove("hidden");
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
