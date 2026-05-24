const TRANSLATIONS = {
  uz: {
    search: "Mahsulot qidirish...",
    all: "Barchasi",
    details: "Batafsil",
    nav_home: "Asosiy",
    nav_cart: "Savat",
    nav_favorites: "Sevimli",
    nav_about: "Biz haqida",
    cart_empty: "Savat bo'sh",
    cart_title: "Savat",
    order_title: "Buyurtma berish",
    name_placeholder: "Ismingiz",
    phone_placeholder: "Telefon raqam",
    submit_order: "Buyurtma yuborish",
    total: "Jami",
    order_sent: "Buyurtma yuborildi! Tez orada siz bilan bog'lanamiz.",
    back: "← Ortga",
    sum: "so'm",
    favorites_empty: "Sevimlilar ro'yxati bo'sh",
    favorites_title: "Sevimlilar",
    about_title: "Biz haqida",
    about_text: "Rebar Uzbekistan — O'zbekistonda kompozit armatura va to'r ishlab chiqaruvchi va yetkazib beruvchi.",
    contact_phone: "Telefon",
    contact_email: "Email",
    contact_address: "Manzil",
    address_val: "Toshkent, O'zbekiston",
    category_label: "Kategoriya",
    remove: "O'chirish",
    add_fav: "Sevimliga qo'shish",
    per: "/"
  },
  ru: {
    search: "Поиск товаров...",
    all: "Все",
    details: "Подробно",
    nav_home: "Главная",
    nav_cart: "Корзина",
    nav_favorites: "Избранное",
    nav_about: "О нас",
    cart_empty: "Корзина пуста",
    cart_title: "Корзина",
    order_title: "Оформить заказ",
    name_placeholder: "Имя",
    phone_placeholder: "Телефон",
    submit_order: "Отправить заказ",
    total: "Итого",
    order_sent: "Заказ отправлен! Мы свяжемся с вами в ближайшее время.",
    back: "← Назад",
    sum: "сум",
    favorites_empty: "Список избранного пуст",
    favorites_title: "Избранное",
    about_title: "О нас",
    about_text: "Rebar Uzbekistan — производитель и поставщик композитной арматуры и сеток в Узбекистане.",
    contact_phone: "Телефон",
    contact_email: "Email",
    contact_address: "Адрес",
    address_val: "Ташкент, Узбекистан",
    category_label: "Категория",
    remove: "Удалить",
    add_fav: "В избранное",
    per: "/"
  },
  en: {
    search: "Search products...",
    all: "All",
    details: "Details",
    nav_home: "Home",
    nav_cart: "Cart",
    nav_favorites: "Favorites",
    nav_about: "About",
    cart_empty: "Cart is empty",
    cart_title: "Cart",
    order_title: "Place order",
    name_placeholder: "Your name",
    phone_placeholder: "Phone number",
    submit_order: "Submit order",
    total: "Total",
    order_sent: "Order submitted! We'll contact you shortly.",
    back: "← Back",
    sum: "UZS",
    favorites_empty: "Favorites list is empty",
    favorites_title: "Favorites",
    about_title: "About Us",
    about_text: "Rebar Uzbekistan — manufacturer and supplier of composite rebar and mesh in Uzbekistan.",
    contact_phone: "Phone",
    contact_email: "Email",
    contact_address: "Address",
    address_val: "Tashkent, Uzbekistan",
    category_label: "Category",
    remove: "Remove",
    add_fav: "Save",
    per: "/"
  }
};

const LANG_KEY = 'rebar_lang';

function getLang() {
  return localStorage.getItem(LANG_KEY) || 'uz';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

function t(key) {
  const lang = getLang();
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS['ru'][key] || key;
}

function applyLangUI() {
  const lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll('[data-icon]').forEach(el => {
    const iconName = el.dataset.icon;
    if (typeof getIcon === 'function') {
      el.innerHTML = getIcon(iconName);
    }
  });
  // highlight active lang button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function initLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
      location.reload();
    });
  });
}

// Bottom nav active state
function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}
