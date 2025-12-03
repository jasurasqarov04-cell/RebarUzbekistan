const CART_KEY = 'rebar_cart';
let catalog = [];
let cart    = [];

loadCart();
fetch('products.json')
  .then(r=>r.json())
  .then(data=>{
     catalog = data;
     renderCatalog(data);
     updateBadge();
  });

document.getElementById('search').oninput = (e)=>{
  const q = e.target.value.toLowerCase();
  renderCatalog(catalog.filter(p=>p.name.toLowerCase().includes(q)));
};

function renderCatalog(list){
  const html = list.map(p=>`
    <div class="card">
      <img src="${p.img}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      <div class="info">
        <div class="name">${p.name}</div>
        <div class="price">${p.price.toLocaleString('ru-RU')} ${p.currency} / ${p.unit}</div>

        <div class="row-btn">
          <div class="counter-pill" data-id="${p.id}">
            <button class="cp-btn">−</button>
            <input type="number" class="cp-input" value="${getQty(p.id)}" min="0">
            <button class="cp-btn">+</button>
          </div>
          <a class="detail-btn" href="${p.url}" target="_blank" data-id="${p.id}">Подробно</a>
        </div>
      </div>
    </div>`).join('');
  document.getElementById('catalog').innerHTML = html;

  document.querySelectorAll('.counter-pill').forEach(el=>{
    const id  = +el.dataset.id;
    const inp = el.querySelector('.cp-input');
    const set = v=>{
      v = Math.max(0, +v);
      inp.value = v;
      updateCart(id, catalog.find(p=>p.id===id), v);
      updateBadge();
    };
    el.querySelector('.cp-btn:first-of-type').onclick = ()=> set(+inp.value - 1);
    el.querySelector('.cp-btn:last-of-type').onclick  = ()=> set(+inp.value + 1);
    inp.oninput = ()=> set(inp.value);
  });
}

/* ---------- корзина ---------- */
function loadCart(){
  try{ cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch{cart=[];}
}
function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function getQty(id){
  const line = cart.find(x=>x.id===id);
  return line ? line.qty : 0;
}
function updateCart(id, product, newQty){
  let line = cart.find(x=>x.id===id);
  if(newQty === 0){
    cart = cart.filter(x=>x.id!==id);
  }else if(line){
    line.qty = newQty;
  }else{
    cart.push({id, name:product.name, price:product.price, qty:newQty});
  }
  saveCart();
}
function updateBadge(){
  const items = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartBadge').textContent = items;
}
/* прячем клавиатуру при тапе вне поля ввода */
document.addEventListener('touchend', e => {
  if (e.target.tagName !== 'INPUT') document.activeElement.blur();
});
/* закрываем клавиатуру при тапе вне поля */
window.addEventListener('touchend', e => {
  if (e.target.tagName !== 'INPUT') {
    document.activeElement.blur();                 // убираем фокус
    if (window.Telegram?.WebApp) Telegram.WebApp.MainButton.hide(); // просим Telegram свернуть клаву
  }
});
