const BX_WEBHOOK = 'https://rebar.bitrix24.kz/rest/1/slgm6bd5z4cq971h/crm.lead.add.json';

let catalog   = [];
let cart      = [];          // [{id,name,price,qty}]

fetch('products.json').then(r=>r.json()).then(data=>{
  catalog = data;
  renderCatalog(data);
  updateCartWidget();
});

document.getElementById('search').oninput = e=>{
  const q = e.target.value.toLowerCase();
  renderCatalog(catalog.filter(p=>p.name.toLowerCase().includes(q)));
};

function renderCatalog(list){
  const html = list.map(p=>`
    <div class="card">
      <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
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

  // навесить обработчики на счётчики
  document.querySelectorAll('.counter').forEach(el=>{
    const id   = +el.dataset.id;
    const inp  = el.querySelector('.qty-input');
    const minus= el.querySelector('.minus');
    const plus = el.querySelector('.plus');

    const set = v=>{
      v = Math.max(0, +v);
      inp.value = v;
      updateCart(id, catalog.find(p=>p.id===id), v);
    };
    minus.onclick = ()=> set(+inp.value - 1);
    plus.onclick  = ()=> set(+inp.value + 1);
    inp.oninput   = ()=> set(inp.value);
  });
}

/* helpers cart */
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
  updateCartWidget();
}
function updateCartWidget(){
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const items = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartBadge').textContent = items;
  document.getElementById('cartTotalDrop').textContent = total.toLocaleString('ru-RU')+' сум';

  const listHTML = cart.map(i=>`<li><span>${i.name}</span><span>${i.qty}×</span></li>`).join('');
  document.getElementById('cartListDrop').innerHTML = listHTML || '<li style="color:#888">пусто</li>';
}

/* оформить заказ */
document.getElementById('checkoutDrop').onclick = ()=>{
  document.getElementById('orderForm').style.display = 'block';
  window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});
};

document.getElementById('orderForm').onsubmit = async (e)=>{
  e.preventDefault();
  const name  = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const comment = cart.map(i=>`${i.name} ×${i.qty}`).join('; ');

  await fetch(BX_WEBHOOK,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({fields:{
      TITLE:`Заказ из Telegram Mini App`,
      NAME:name,
      PHONE:[{VALUE:phone,VALUE_TYPE:'WORK'}],
      COMMENTS:comment
    }})
  });

  alert('Заказ принят! Мы скоро свяжемся.');
  window.Telegram.WebApp.close();
};
