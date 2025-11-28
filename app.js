const CART_KEY = 'rebar_cart';

let catalog = [];
loadCart();                 // восстановить корзину при старте
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

        <div class="counter" data-id="${p.id}">
          <button class="minus">−</button>
          <input type="number" class="qty-input" value="${getQty(p.id)}" min="0" inputmode="numeric">
          <button class="plus">+</button>
        </div>
      </div>
    </div>`).join('');
  document.getElementById('catalog').innerHTML = html;

  // повесить события
  document.querySelectorAll('.counter').forEach(el=>{
    const id  = +el.dataset.id;
    const inp = el.querySelector('.qty-input');
    const min = el.querySelector('.minus');
    const pl  = el.querySelector('.plus');
    const set = v=>{
      v = Math.max(0, +v);
      inp.value = v;
      updateCart(id, catalog.find(p=>p.id===id), v);
      updateBadge();
    };
    min.onclick = ()=> set(+inp.value - 1);
    pl.onclick  = ()=> set(+inp.value + 1);
    inp.oninput = ()=> set(inp.value);
  });
}

/* ---------- корзина ---------- */
function loadCart(){
  try{ cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch{e=>cart=[];}
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
