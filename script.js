const API = 'https://fakestoreapi.com/products';

const productsEl = document.getElementById('products');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const categoryEl = document.getElementById('category');
const sortEl = document.getElementById('sort');
const cartPanel = document.getElementById('cartPanel');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const totalEl = document.getElementById('total');

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

async function loadProducts() {
  try {
    const res = await fetch(API);
    products = await res.json();
    statusEl.textContent = '';
    const cats = [...new Set(products.map(p => p.category))];
    cats.forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c;
      categoryEl.appendChild(o);
    });
    renderProducts();
  } catch (e) {
    statusEl.textContent = 'Failed to load products. Check your internet.';
  }
}

function renderProducts() {
  let list = [...products];
  const q = searchEl.value.toLowerCase();
  if (q) list = list.filter(p => p.title.toLowerCase().includes(q));
  if (categoryEl.value !== 'all') list = list.filter(p => p.category === categoryEl.value);
  if (sortEl.value === 'low') list.sort((a, b) => a.price - b.price);
  if (sortEl.value === 'high') list.sort((a, b) => b.price - a.price);

  productsEl.innerHTML = '';
  if (!list.length) { statusEl.textContent = 'No products found.'; return; }
  statusEl.textContent = '';

  list.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <h4>${p.title}</h4>
      <span class="price">$${p.price.toFixed(2)}</span>
      <small>⭐ ${p.rating.rate} (${p.rating.count})</small>
      <button>Add to Cart</button>`;
    div.querySelector('button').onclick = () => addToCart(p);
    productsEl.appendChild(div);
  });
}

function addToCart(p) {
  const item = cart.find(i => i.id === p.id);
  if (item) item.qty++;
  else cart.push({ id: p.id, title: p.title, price: p.price, image: p.image, qty: 1 });
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = '';
  if (!cart.length) cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';

  cart.forEach(i => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${i.image}" alt="" />
      <div class="info">
        <div>${i.title.slice(0, 40)}...</div>
        <b>$${(i.price * i.qty).toFixed(2)}</b>
        <div class="qty">
          <button class="minus">-</button><span>${i.qty}</span><button class="plus">+</button>
        </div>
      </div>
      <button class="remove">✕</button>`;
    div.querySelector('.minus').onclick = () => changeQty(i.id, -1);
    div.querySelector('.plus').onclick = () => changeQty(i.id, 1);
    div.querySelector('.remove').onclick = () => removeItem(i.id);
    cartItemsEl.appendChild(div);
  });

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  totalEl.textContent = `Total: $${total.toFixed(2)}`;
  cartCountEl.textContent = count;
}

searchEl.addEventListener('input', renderProducts);
categoryEl.addEventListener('change', renderProducts);
sortEl.addEventListener('change', renderProducts);
document.getElementById('cartBtn').onclick = () => cartPanel.classList.add('open');
document.getElementById('closeCart').onclick = () => cartPanel.classList.remove('open');

renderCart();
loadProducts();
