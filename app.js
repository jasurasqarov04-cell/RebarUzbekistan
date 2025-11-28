const BX_WEBHOOK = 'https://rebar.bitrix24.kz/rest/1/slgm6bd5z4cq971h/crm.lead.add.json';

let catalog = [];
let cart    = [];

// загрузка каталога
fetch('products.json').then(r=>r.json()).then(data=>{
  catalog = data;
  renderCatalog(data);
});

document.getElementById('search').oninput = (e)=>{
  const q = e.target.value.toLowerCase();
  const filtered = catalog.filter(p=>p.name.toLowerCase().includes(q));
  renderCatalog(filtered);
};

function renderCatalog(list){
  const html = list.map(p=>`
    <div class="card">
      <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      <div class="info">
        <div class="name">${p.name}</div>
        <div class="price">${p.price.toLocaleString('ru-RU')} ${p.currency} / ${p.unit}</div>
        <button class="add" onclick="addToCart(${p.id}, '${p.name}', ${p.price})">+ Добавить</button>
      </div>
    </div>`).join('');
  document.getElementById('catalog').innerHTML = html;
}

function addToCart(id,name,price){
  const line = cart.find(x=>x.id===id);
  line ? line.qty++ : cart.push({id,name,price,qty:1});
  renderCart();
}

function renderCart(){
  const list = cart.map(c=>`<li>${c.name} ×${c.qty}</li>`).join('');
  document.getElementById('cartList').innerHTML = list;
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('total').textContent = total.toLocaleString('ru-RU')+' сум';
}

document.getElementById('checkout').onclick = ()=>{
  document.getElementById('orderForm').style.display = 'block';
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
