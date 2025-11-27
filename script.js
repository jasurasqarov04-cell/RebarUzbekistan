const BX_WEBHOOK = 'https://rebar.bitrix24.kz/rest/1/slgm6bd5z4cq971h/crm.lead.add.json';

let cart = [];

fetch('products.json').then(r=>r.json()).then(renderCatalog);

function renderCatalog(list){
  const html = list.map(p=>`
    <div class="item">
      <span>${p.name} — ${p.price} ${p.currency}</span>
      <button onclick="addToCart(${p.id}, '${p.name}', ${p.price})">+</button>
    </div>`).join('');
  document.getElementById('catalog').innerHTML = html;
}

function addToCart(id,name,price){
  const line = cart.find(x=>x.id===id);
  line ? line.qty++ : cart.push({id,name,price,qty:1});
  renderCart();
}

function renderCart(){
  const list = cart.map(c=>`<li>${c.name} x${c.qty}</li>`).join('');
  document.getElementById('cart').innerHTML = list;
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('total').textContent = `(${total} сум)`;
}

document.getElementById('checkout').onclick = () => {
  document.getElementById('orderForm').style.display = 'block';
};

document.getElementById('orderForm').onsubmit = async (e) => {
  e.preventDefault();
  const name  = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const comment = cart.map(i=>`${i.name} x${i.qty}`).join('; ');

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

  alert('Спасибо! Мы скоро свяжемся.');
  window.Telegram.WebApp.close(); // закрыть приложение
};
