const pricePerMeter = 2500;
const priceEl = document.getElementById("price");
const quantityEl = document.getElementById("quantity");
const totalEl = document.getElementById("total");
const increaseBtn = document.getElementById("increase");
const decreaseBtn = document.getElementById("decrease");

function updateTotal() {
  const quantity = parseInt(quantityEl.value);
  totalEl.textContent = pricePerMeter * quantity;
}

increaseBtn.addEventListener("click", () => {
  quantityEl.value = parseInt(quantityEl.value) + 1;
  updateTotal();
});

decreaseBtn.addEventListener("click", () => {
  if (parseInt(quantityEl.value) > 1) {
    quantityEl.value = parseInt(quantityEl.value) - 1;
    updateTotal();
  }
});

document.getElementById("addToCart").addEventListener("click", () => {
  alert(`Добавлено в корзину: ${quantityEl.value} м (${totalEl.textContent} сум)`);
});

// Модальное окно
const modal = document.getElementById("modal");
const openModal = document.getElementById("moreInfo");
const closeModal = document.querySelector(".close");

openModal.onclick = () => modal.style.display = "block";
closeModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
