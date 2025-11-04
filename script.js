// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.MainButton.hide();
}

const PRODUCTS = [
  {
    id: "p1",
    name: "Арматура композитная Ø6 мм",
    manufacturer: "RebarUzbekistan",
    country: "Узбекистан",
    price: "от 24 000 сум/м",
    availability: "в наличии"
  },
  {
    id: "p2",
    name: "Арматура композитная Ø8 мм",
    manufacturer: "RebarUzbekistan",
    country: "Узбекистан",
    price: "от 28 000 сум/м",
    availability: "в наличии"
  }
];

function searchProducts(q) {
  const s = (q || "").trim().toLowerCase();
  if (!s) return PRODUCTS;
  return PRODUCTS.filter(p => p.name.toLowerCase().includes(s));
}

function renderResults(list) {
  const root = document.getElementById("results");
  root.innerHTML = "";
  if (list.length === 0) {
    root.innerHTML = `<div style="color:#777">Ничего не найдено</div>`;
    return;
  }
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="https://via.placeholder.com/72.png?text=${encodeURIComponent(p.name)}" alt="${p.name}" />
      <div class="info">
        <h3>${p.name}</h3>
        <p>${p.manufacturer} · ${p.country}</p>
        <div class="price">${p.price}</div>
        <div style="font-size:12px;color:#6b7280">${p.availability}</div>
      </div>
      <div class="actions">
        <button class="btn-choose">Выбрать</button>
        <button class="btn-search">Поиск</button>
      </div>`;
    card.querySelector(".btn-choose").addEventListener("click", () => {
      sendToBot({action:"choose", product: p});
    });
    card.querySelector(".btn-search").addEventListener("click", () => {
      sendToBot({action:"search_similar", query: p.name});
    });
    root.appendChild(card);
  });
}

function sendToBot(payload) {
  const json = JSON.stringify(payload);
  if (tg && typeof tg.sendData === "function") {
    tg.sendData(json);
    tg.close();
  } else {
    alert("Запустите приложение внутри Telegram.");
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]));
}

document.getElementById("btnSearch").addEventListener("click", () => {
  const q = document.getElementById("q").value;
  renderResults(searchProducts(q));
});
renderResults(PRODUCTS);
