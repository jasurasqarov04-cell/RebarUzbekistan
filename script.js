// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand?.();
  tg.MainButton?.hide?.();
}

// === Настройки (Возвращаем настройки Bitrix) ===
const BITRIX_WEBHOOK_URL = "https://rebar.bitrix24.kz/rest/1/njvrqx0snxon2xw3/crm.lead.add.json"; 
const DEFAULT_PRICE_PER_METER = 24000; // сум / метр

// === Данные товаров (РАЗДЕЛЕНЫ НА КАТЕГОРИИ) ===

const ABK_PRODUCTS = [
  {
    id: "p-bas-4",
    type: "ABK",
    name: "Базальто-композитная арматура 4 мм (АБК)",
    description: `Базальто-композитная арматура считается альтернативой металлопроката. Используется для армирования фундаментов, мостов и сооружений.`,
    properties: [
      { k: "Вес 1-го погонного метра", v: "0.85 кг" },
      { k: "Сырье", v: "Базальт" }
    ],
    pricePerMeter: DEFAULT_PRICE_PER_METER,
    image: "https://rebar.uz/wp-content/uploads/2024/08/artboard-13.png"
  },
  // Добавьте больше товаров АБК здесь, если нужно
];

const ASK_PRODUCTS = [
    {
        id: "p-glass-6",
        type: "ASK",
        name: "Стеклокомпозитная арматура 6 мм (АСК)",
        description: `Стеклокомпозитная арматура легкая, не подвержена коррозии. Используется для армирования дорожных покрытий, полов, и садовых конструкций.`,
        properties: [
            { k: "Вес 1-го погонного метра", v: "0.95 кг" },
            { k: "Сырье", v: "Стекловолокно" }
        ],
        pricePerMeter: 18000, // Пример другой цены
        image: "https://rebar.uz/wp-content/uploads/2024/08/artboard-1.png" // Пример другого изображения
    },
    // Добавьте больше товаров АСК здесь, если нужно
];

// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let cart = [];
let currentProductType = 'ABK'; // По умолчанию показываем АБК

// === UI и ИНИЦИАЛИЗАЦИЯ ===

const resultsRoot = document.getElementById("results");
const qInput = document.getElementById("q");
const switchABKBtn = document.getElementById("switchABK");
const switchASKBtn = document.getElementById("switchASK");


// --- Обработчики переключения ---
switchABKBtn.addEventListener("click", () => {
    setCurrentProductType('ABK');
});

switchASKBtn.addEventListener("click", () => {
    setCurrentProductType('ASK');
});


// Функция смены типа продукта
function setCurrentProductType(type) {
    if (currentProductType === type) return;

    currentProductType = type;
    
    // Обновляем внешний вид кнопок
    switchABKBtn.classList.remove('active');
    switchASKBtn.classList.remove('active');
    
    if (type === 'ABK') {
        switchABKBtn.classList.add('active');
    } else {
        switchASKBtn.classList.add('active');
    }

    // Очищаем поиск и перерисовываем каталог
    qInput.value = '';
    renderResults(searchProducts(qInput.value));
}

// Получение текущего каталога
function getCurrentCatalog() {
    return currentProductType === 'ABK' ? ABK_PRODUCTS : ASK_PRODUCTS;
}

// Обработчик поиска
document.getElementById("btnSearch").addEventListener("click", () => {
  renderResults(searchProducts(qInput.value));
});

// render initial
renderResults(getCurrentCatalog());

// Search
function searchProducts(q) {
  const s = (q || "").trim().toLowerCase();
  const currentCatalog = getCurrentCatalog();
  if (!s) return currentCatalog;
  
  // Ищем только в текущем активном каталоге
  return currentCatalog.filter(p => p.name.toLowerCase().includes(s));
}

// Render listing
function renderResults(list) {
  resultsRoot.innerHTML = "";
  if (!list.length) {
    resultsRoot.innerHTML = `<div style="color:#777">Ничего не найдено в категории ${currentProductType}</div>`;
    return;
  }
  list.forEach(p => {
    const el = document.createElement("div");
    el.className = "card";
    // Ищем свойство "Вес 1-го погонного метра" в массиве properties
    const weightProp = p.properties.find(prop => prop.k.includes('Вес 1-го погонного метра'));
    const weightPerMeterText = (weightProp?.v.replace('кг','') || "—").trim();
    
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
        openCart();
    };
    
    updateCardCalc(); // Обновить при инициализации
}


// Product modal
const modal = document.getElementById("productModal");
const modalClose = document.getElementById("modalClose");
const modalBackBtn = document.getElementById("modalBackBtn"); 

modalClose.addEventListener("click", () => closeModal());
modalBackBtn.addEventListener("click", () => closeModal()); 

function showProductModal(productId) {
  // Ищем продукт во всех каталогах для модального окна
  const p = [...ABK_PRODUCTS, ...ASK_PRODUCTS].find(x => x.id === productId);
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

// === ФУНКЦИЯ ОТПРАВКИ В BITRIX24 (Вернулась к исходному JSON-POST) ===
document.getElementById("sendToBitrix").addEventListener("click", async ()=>{
  const name = document.getElementById("buyerName").value.trim();
  const phone = document.getElementById("buyerPhone").value.trim();
  if (!phone) return alert("Укажите телефон");
  if (!cart.length) return alert("Корзина пуста");

  // Формируем описание заказа для поля КОММЕНТАРИЙ (COMMENTS)
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

  // Структура JSON, которая ранее выдавала ошибку 400
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

  // Отправляем на Bitrix webhook
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
    
    // очистка
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

// send order to bot via tg.sendData (осталась как отдельная кнопка, чтобы не ломать структуру)
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
