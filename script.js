// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand?.();
  tg.MainButton?.hide?.();
}

// === Настройки ===
const BITRIX_WEBHOOK_URL = "https://rebar.bitrix24.kz/rest/1/njvrqx0snxon2xw3/crm.lead.add.json"; 
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
    image: "https://rebar.uz/wp-content/uploads/2024/08/artboard-13.png"
  },
  // можно добавить другие товары
  {
    id: "p-bas-6",
    name: "Базальто-композитная арматура 6 мм",
    description: `Базальто-композитная арматура 6мм, прочнее 4мм. Идеально подходит для усиленных бетонных конструкций, таких как балки, колонны и перекрытия.`,
    properties: [
      { k: "Вес 1-го погонного метра", v: "1.2 кг" },
      { k: "Вес 50-метровой бухты", v: "6.0 кг" },
      { k: "Вес 100-метровой бухты", v: "12.0 кг" }
    ],
    pricePerMeter: 36000,
    image: "https://rebar.uz/wp-content/uploads/2024/08/artboard-1.png"
  },
  {
    id: "p-bas-8",
    name: "Базальто-композитная арматура 8 мм",
    description: `Базальто-композитная арматура 8мм, максимальная прочность. Применяется для самых нагруженных конструкций, мостов и высокоэтажного строительства.`,
    properties: [
      { k: "Вес 1-го погонного метра", v: "1.8 кг" },
      { k: "Вес 50-метровой бухты", v: "9.0 кг" },
      { k: "Вес 100-метровой бухты", v: "18.0 кг" }
    ],
    pricePerMeter: 54000,
    image: "https://rebar.uz/wp-content/uploads/2024/08/artboard-2.png"
  },
  {
    id: "p-bas-10",
    name: "Базальто-композитная арматура 10 мм",
    description: `Базальто-композитная арматура 10мм, экстра прочность. Для особо ответственных и тяжелых строительных объектов, где требуется максимальная нагрузочная способность.`,
    properties: [
      { k: "Вес 1-го погонного метра", v: "2.5 кг" },
      { k: "Вес 50-метровой бухты", v: "12.5 кг" },
      { k: "Вес 100-метровой бухты", v: "25.0 кг" }
    ],
    pricePerMeter: 75000,
    image: "https://rebar.uz/wp-content/uploads/2024/08/artboard-3.png"
  },
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
    // Убираем описание и калькулятор из основной карточки
    el.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.name)}" />
      <div class="info">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="price">${formatCurrency(p.pricePerMeter || DEFAULT_PRICE_PER_METER)} сум</div>
        <button class="btn-choose add-to-cart-card" data-id="${p.id}" data-price="${p.pricePerMeter || DEFAULT_PRICE_PER_METER}">Savatchaga</button>
        <button class="btn-details hidden" data-id="${p.id}">Подробнее</button> </div>
    `;
    resultsRoot.appendChild(el);
    
    // Обработчик кнопки "Savatchaga"
    el.querySelector(".add-to-cart-card").addEventListener("click", (e) => {
      const productId = e.currentTarget.getAttribute("data-id");
      const product = PRODUCTS.find(prod => prod.id === productId);
      if (product) {
        addToCart(product, 1); // Добавляем по 1 метру/штуке
        openCart();
      }
    });

    // Обработчик кнопки "Подробнее" (если решите ее показывать)
    el.querySelector(".btn-details").addEventListener("click", () => {
      showProductModal(p.id);
    });
  });
}

// Product modal
const modal = document.getElementById("productModal");
const modalClose = document.getElementById("modalClose");
const modalBackBtn = document.getElementById("modalBackBtn"); 

modalClose.addEventListener("click", () => closeModal());
modalBackBtn.addEventListener("click", () => closeModal()); 

function showProductModal(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  
  document.getElementById("modalImage").src = p.image;
  document.getElementById("modalTitle").innerText = p.name;
  document.getElementById("modalDesc").innerText = p.description; // Описание теперь только здесь
  
  const propsList = document.getElementById("modalProps");
  propsList.innerHTML = "";
  p.properties.forEach(it => {
    const li = document.createElement("li");
    li.innerText = `${it.k}: ${it.v}`;
    propsList.appendChild(li);
  });
  
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

  const itemsDescription = cart.map(i => {
    const price = (i.product.pricePerMeter || DEFAULT_PRICE_PER_METER);
    const totalItemPrice = price * i.meters;
    return `${i.product.name} — ${i.meters} м — ${formatCurrency(totalItemPrice)} сум (Цена за 1 м: ${formatCurrency(price)})`;
  }).join("\n");
  
  const total = cart.reduce((s,i)=> s + ((i.product.pricePerMeter||DEFAULT_PRICE_PER_METER) * i.meters), 0);
  const leadTitle = `Заказ из Telegram WebApp на сумму ${formatCurrency(total)} сум`;
  const comments = `
    --- ДЕТАЛИ ЗАКАЗА ---
    ${itemsDescription}
    
    Имя клиента: ${name || "Не указано"}
    Телефон: ${phone}
  `;

  const payload = {
      fields: {
          TITLE: leadTitle,
          NAME: name || "Клиент Telegram WebApp",
          OPPORTUNITY: total,
          CURRENCY_ID: 'SUM',
          COMMENTS: comments.trim(),
          PHONE: [{
              VALUE: phone,
              VALUE_TYPE: 'WORK'
          }]
      },
  };

  try {
    const res = await fetch(BITRIX_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload) 
    });
    
    if (!res.ok) throw new Error(`Ошибка отправки. Статус: ${res.status}`); 
    
    const result = await res.json();
    if (result.error) {
        throw new Error("Bitrix API Error: " + result.error_description);
    }
    
    alert(`Заказ отправлен в Bitrix! ID Лида: ${result.result}`);
    
    cart = [];
    document.getElementById("buyerName").value = ''; 
    document.getElementById("buyerPhone").value = '';
    renderCartPanel();
    renderCartCount();
    updateCartTotal();
    
    window.Telegram?.WebApp?.close(); 
  } catch (err) {
    console.error(err);
    alert("Ошибка при отправке в Bitrix (Статус 400). Проверьте URL вебхука: " + err.message);
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
