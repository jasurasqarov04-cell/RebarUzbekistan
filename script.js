// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand?.();
  tg.MainButton?.hide?.();
}

// === Настройки ===
const BITRIX_WEBHOOK_URL = "https://rebar.bitrix24.kz/rest/1/njvrqx0snxon2xw3/crm.lead.add.json"; 
const DEFAULT_PRICE_PER_METER = 24000; // сум / метр

// === Данные товаров (Добавил больше примеров для тестирования) ===
const PRODUCTS = [
  {
    id: "p-bas-4",
    name: "Базальто-композитная арматура 4 мм",
    description: `Базальто-композитная арматура считается альтернативой металлопроката. Используется для армирования фундаментов, мостов и сооружений.`,
    properties: [
      { k: "Вес 1-го погонного метра", v: "0.085 кг" }, 
      { k: "Сырье", v: "Базальт" }
    ],
    pricePerMeter: DEFAULT_PRICE_PER_METER,
    image: "https://rebar.uz/wp-content/uploads/2024/08/artboard-13.png"
  },
  {
    id: "p-bas-6",
    name: "Базальто-композитная арматура 6 мм",
    description: `Базальто-композитная арматура 6мм, прочнее 4мм. Идеально подходит для усиленных бетонных конструкций.`,
    properties: [
      { k: "Вес 1-го погонного метра", v: "0.120 кг" },
      { k: "Сырье", v: "Базальт" }
    ],
    pricePerMeter: 36000,
    image: "https://rebar.uz/wp-content/uploads/2024/08/artboard-1.png"
  },
  {
    id: "p-bas-8",
    name: "Базальто-композитная арматура 8 мм",
    description: `Базальто-композитная арматура 8мм, максимальная прочность. Применяется для самых нагруженных конструкций.`,
    properties: [
      { k: "Вес 1-го погонного метра", v: "0.180 кг" },
      { k: "Сырье", v: "Базальт" }
    ],
    pricePerMeter: 54000,
    image: "https://rebar.uz/wp-content/uploads/2024/08/artboard-2.png"
  },
  {
    id: "p-bas-10",
    name: "Базальто-композитная арматура 10 мм",
    description: `Базальто-композитная арматура 10мм, экстра прочность. Для особо ответственных и тяжелых строительных объектов.`,
    properties: [
      { k: "Вес 1-го погонного метра", v: "0.250 кг" },
      { k: "Сырье", v: "Базальт" }
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
    
    const price = p.pricePerMeter || DEFAULT_PRICE_PER_METER;
    
    // Ищем свойство "Вес 1-го погонного метра" в массиве properties
    const weightProp = p.properties.find(prop => prop.k.includes('Вес 1-го погонного метра'));
    const weightPerMeterRaw = weightProp ? weightProp.v.replace('кг', '').trim() : "0";
    let weightPerMeter = parseFloat(weightPerMeterRaw) || 0;


    // --- СТРУКТУРА КАРТОЧКИ ---
    el.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.name)}" />
      <div class="info">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="price">${formatCurrency(price)} сум/м</div>
        
        <div class="calculator-in-card" data-id="${p.id}" data-price="${price}" data-weight="${weightPerMeter}">
            
            <div class="calc-output">
                Итого: <strong class="calc-total-price">${formatCurrency(price)} сум</strong>
            </div>

            <div class="calc-controls">
                <button class="btn-calc minus" data-step="-1">–</button>
                <input type="number" min="1" step="1" value="1" class="calc-meters-input">
                <button class="btn-calc plus" data-step="1">+</button>
            </div>
        </div>

        <button class="btn-details btn-search" data-id="${p.id}">Подробнее</button>
      </div>
    `;
    resultsRoot.appendChild(el);
    
    // Инициализация калькулятора и обработчиков кнопок
    handleProductCardCalc(el, p);

    // --- ИСПРАВЛЕНИЕ ОШИБКИ: ДОБАВЛЕНИЕ ОБРАБОТЧИКА "ПОДРОБНЕЕ" ---
    // Обработчик кнопки "Подробнее"
    const detailsButton = el.querySelector(".btn-details");
    if (detailsButton) {
      detailsButton.addEventListener("click", () => {
        // Мы открываем модальное окно, не переходим на новую страницу
        showProductModal(p.id); 
      });
    }
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
  });
}

// Логика калькулятора на карточке товара
function handleProductCardCalc(cardElement, product) {
    const calcRoot = cardElement.querySelector(".calculator-in-card");
    const metersInput = calcRoot.querySelector(".calc-meters-input");
    const totalPriceStrong = calcRoot.querySelector(".calc-total-price");
    const pricePerMeter = parseFloat(calcRoot.getAttribute("data-price"));
    const weightPerMeter = parseFloat(calcRoot.getAttribute("data-weight"));
    
    const plusBtn = calcRoot.querySelector(".plus");
    const minusBtn = calcRoot.querySelector(".minus");
    
    // 1. Функция обновления цены и корзины
    function updateCardCalc() {
        let meters = parseInt(metersInput.value) || 1;
        if (meters < 1 || isNaN(meters)) meters = 1;
        metersInput.value = meters; 

        const total = pricePerMeter * meters;
        
        totalPriceStrong.innerText = formatCurrency(total) + " сум";
        
        // Автоматическое добавление/обновление в корзине при изменении
        addToCart(product, meters, true); 
        
        // Обновляем счетчик корзины в шапке
        renderCartCount(); 
        
        // Деактивируем минус, если количество 1
        minusBtn.disabled = (meters <= 1);
    }
    
    // 2. Обработчики для + и -
    plusBtn.onclick = function() {
        metersInput.value = parseInt(metersInput.value) + 1;
        updateCardCalc();
    };

    minusBtn.onclick = function() {
        let current = parseInt(metersInput.value);
        if (current > 1) {
            metersInput.value = current - 1;
            updateCardCalc();
        }
    };

    // 3. Обработчик прямого ввода
    metersInput.oninput = function() {
        if (parseInt(metersInput.value) < 1 || metersInput.value === "") {
            // Не сразу сбрасываем, даем пользователю ввести
        }
        updateCardCalc();
    };

    metersInput.onblur = function() {
        // Проверка при уходе фокуса
        if (parseInt(metersInput.value) < 1 || isNaN(parseInt(metersInput.value))) {
             metersInput.value = 1;
        }
        updateCardCalc();
    }
    
    // 4. Инициализация (загружаем, если уже есть в корзине)
    const existingCartItem = cart.find(i => i.product.id === product.id);
    if (existingCartItem) {
        metersInput.value = existingCartItem.meters;
    }
    
    updateCardCalc(); // Обновить при инициализации
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
  document.getElementById("modalDesc").innerText = p.description; 
  
  const propsList = document.getElementById("modalProps");
  propsList.innerHTML = "";
  p.properties.forEach(it => {
    const li = document.createElement("li");
    li.innerText = `${it.k}: ${it.v}`;
    propsList.appendChild(li);
  });
  
  // Убеждаемся, что модальное окно открывается в одном листе
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

// Cart functions
function addToCart(product, meters, update = false) {
  const existingIndex = cart.findIndex(i => i.product.id === product.id);

  if (meters < 1) {
      if (existingIndex !== -1) {
          cart.splice(existingIndex, 1);
      }
      return;
  }
  
  if (existingIndex !== -1) {
    if (update) {
      cart[existingIndex].meters = meters; 
    } else {
      cart[existingIndex].meters += meters; 
    }
  } else {
    cart.push({ product, meters });
  }
  renderCartCount(); 
}

function renderCartCount() {
  // Фильтруем пустые элементы
  cart = cart.filter(i => i.meters > 0); 
  // ИСПРАВЛЕНИЕ: Используем длину массива для подсчета уникальных товаров
  document.getElementById("cartCount").innerText = cart.length; 
}


// Cart panel
const cartPanel = document.getElementById("cartPanel");

// ИСПРАВЛЕНИЕ: Убеждаемся, что эти элементы существуют и прикрепляем обработчики
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");

if (openCartBtn) openCartBtn.addEventListener("click", openCart);
if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
// --- КОНЕЦ ИСПРАВЛЕНИЯ ---


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
      // Перерисовываем главный экран, чтобы обновить калькуляторы
      renderResults(searchProducts(qInput.value)); 
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
  const leadTitle = `Заказ из Telegram
