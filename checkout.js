const CART_KEY = 'rebar_cart';
const BX_WEBHOOK = 'https://rebar.bitrix24.kz/rest/1/slgm6bd5z4cq971h/crm.lead.add.json';

let cart = [];
try{ cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch{cart=[]}

renderCheckout();

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

  alert('Заказ отправлен!');
  localStorage.removeItem(CART_KEY);
  location.href = 'index.html';
};

function renderCheckout(){
  if(!cart.length){
    document.getElementById('checkoutCart').innerHTML = '<p style="text-align:center">Корзина пуста</p>';
    document.getElementById('orderForm').style.display = 'none';
    return;
  }
  const html = cart.map(i=>`
    <div class="checkout-item">
      <span>${i.name}</span>
      <span>${i.qty} × ${i.price.toLocaleString('ru-RU')} сум</span>
    </div>`).join('');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('checkoutCart').innerHTML = html + `<div class="checkout-total">Итого: ${total.toLocaleString('ru-RU')} сум</div>`;
}

