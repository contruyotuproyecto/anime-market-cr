"use strict";

const CART_KEY = "anime_market_cr_demo_cart_v1";
const FAVORITES_KEY = "anime_market_cr_demo_favorites_v1";
const grid = document.getElementById("productGrid");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const cartDialog = document.getElementById("cartDialog");
const detailDialog = document.getElementById("detailDialog");
const noticeDialog = document.getElementById("noticeDialog");
const openCartButton = document.getElementById("openCart");
const favoritesToggle = document.getElementById("favoritesToggle");
const toast = document.getElementById("toast");
const formatter = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 });

let products = [];
let activeFilter = "all";
let showFavoritesOnly = false;
let toastTimer;
let cart = readList(CART_KEY).filter((item) => item && typeof item.id === "string");
let favorites = new Set(readList(FAVORITES_KEY).filter((id) => typeof id === "string"));

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    showToast("El navegador no guardó este cambio.");
  }
}

function money(amount) {
  return "₡" + formatter.format(amount);
}

function svgHeart() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M20.8 8.7c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10a4.7 4.7 0 0 1 8.8-2.3 4.7 4.7 0 0 1 8.8 2.3Z");
  svg.append(path);
  return svg;
}

function visibleProducts() {
  return products.filter((product) => {
    const matchesCategory = activeFilter === "all" || product.categoria === activeFilter;
    const matchesFavorites = !showFavoritesOnly || favorites.has(product.id);
    return matchesCategory && matchesFavorites;
  });
}

function renderProducts() {
  const visible = visibleProducts();
  grid.replaceChildren();
  visible.forEach((product) => grid.append(createCard(product)));
  grid.setAttribute("aria-busy", "false");
  emptyState.hidden = visible.length > 0;
  resultsCount.textContent = showFavoritesOnly
    ? visible.length + (visible.length === 1 ? " FAVORITO" : " FAVORITOS")
    : visible.length + (visible.length === 1 ? " PIEZA EN ESTA VITRINA" : " PIEZAS EN ESTA VITRINA");
}

function createCard(product) {
  const article = document.createElement("article");
  article.className = "product-card";

  const visual = document.createElement("div");
  visual.className = "product-visual";
  const detailButton = document.createElement("button");
  detailButton.className = "product-art-button";
  detailButton.type = "button";
  detailButton.setAttribute("aria-label", "Ver detalle de " + product.nombre);
  const image = document.createElement("img");
  image.src = product.imagen;
  image.alt = "";
  image.width = 640;
  image.height = 640;
  image.loading = "lazy";
  image.decoding = "async";
  detailButton.append(image);
  detailButton.addEventListener("click", () => openDetail(product));

  const stamp = document.createElement("span");
  stamp.className = "product-stamp";
  stamp.textContent = product.etiqueta;

  const favoriteButton = document.createElement("button");
  favoriteButton.className = "favorite-button";
  favoriteButton.type = "button";
  favoriteButton.dataset.productId = product.id;
  favoriteButton.setAttribute("aria-label", (favorites.has(product.id) ? "Quitar " : "Agregar ") + product.nombre + " " + (favorites.has(product.id) ? "de" : "a") + " favoritos");
  favoriteButton.setAttribute("aria-pressed", String(favorites.has(product.id)));
  favoriteButton.append(svgHeart());
  favoriteButton.addEventListener("click", () => toggleFavorite(product));
  visual.append(detailButton, stamp, favoriteButton);

  const info = document.createElement("div");
  info.className = "product-info";
  const category = document.createElement("p");
  category.className = "product-category";
  category.textContent = product.categoria;
  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = product.nombre;
  const description = document.createElement("p");
  description.className = "product-description";
  description.textContent = product.descripcion;

  const meta = document.createElement("div");
  meta.className = "product-meta";
  const priceBlock = document.createElement("div");
  priceBlock.className = "price-block";
  const price = document.createElement("strong");
  price.textContent = money(product.precio);
  const priceNote = document.createElement("small");
  priceNote.textContent = "precio de muestra";
  priceBlock.append(price, priceNote);
  const addButton = document.createElement("button");
  addButton.className = "add-button";
  addButton.type = "button";
  addButton.textContent = "+";
  addButton.setAttribute("aria-label", "Añadir " + product.nombre + " a la bolsa demo");
  addButton.addEventListener("click", () => addToCart(product));
  meta.append(priceBlock, addButton);
  info.append(category, name, description, meta);
  article.append(visual, info);
  return article;
}

function toggleFavorite(product) {
  if (favorites.has(product.id)) favorites.delete(product.id);
  else favorites.add(product.id);
  saveList(FAVORITES_KEY, [...favorites]);
  updateFavoritesButton();
  renderProducts();
  const nextFocus = Array.from(document.querySelectorAll(".favorite-button")).find((button) => button.dataset.productId === product.id);
  (nextFocus || favoritesToggle).focus();
  showToast(favorites.has(product.id) ? "Agregado a favoritos" : "Quitado de favoritos");
}

function updateFavoritesButton() {
  document.getElementById("favoritesCount").textContent = String(favorites.size);
  favoritesToggle.setAttribute("aria-pressed", String(showFavoritesOnly));
  favoritesToggle.setAttribute("aria-label", showFavoritesOnly ? "Mostrar toda la colección" : "Mostrar favoritos; " + favorites.size + (favorites.size === 1 ? " guardado" : " guardados"));
}

function setFilter(filter) {
  activeFilter = filter;
  showFavoritesOnly = false;
  document.querySelectorAll(".category-link").forEach((button) => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  updateFavoritesButton();
  renderProducts();
}

function addToCart(product) {
  const item = cart.find((entry) => entry.id === product.id);
  if (item) item.quantity = Math.min(item.quantity + 1, 9);
  else cart.push({ id: product.id, quantity: 1 });
  saveList(CART_KEY, cart);
  renderCart();
  showToast(product.nombre + " · agregado a tu bolsa demo");
}

function changeQuantity(id, amount) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity = Math.min(9, item.quantity + amount);
  if (item.quantity < 1) cart = cart.filter((entry) => entry.id !== id);
  saveList(CART_KEY, cart);
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  cartItems.replaceChildren();
  cart = cart.filter((entry) => products.some((product) => product.id === entry.id))
    .map((entry) => ({ id: entry.id, quantity: Math.min(9, Math.max(1, Number(entry.quantity) || 1)) }));
  const entries = cart.map((entry) => ({ entry, product: products.find((product) => product.id === entry.id) }));
  const count = entries.reduce((sum, item) => sum + item.entry.quantity, 0);
  const total = entries.reduce((sum, item) => sum + item.product.precio * item.entry.quantity, 0);
  document.getElementById("cartCount").textContent = String(count);
  openCartButton.setAttribute("aria-label", "Abrir bolsa demo; " + count + (count === 1 ? " artículo" : " artículos"));
  document.getElementById("cartItemLabel").textContent = "(" + count + ")";
  document.getElementById("cartTotal").textContent = money(total);
  document.getElementById("cartEmpty").hidden = entries.length > 0;
  document.getElementById("cartFooter").hidden = entries.length === 0;

  entries.forEach(({ entry, product }) => {
    const row = document.createElement("div");
    row.className = "cart-row";
    const image = document.createElement("img");
    image.src = product.imagen;
    image.alt = "";
    image.width = 67;
    image.height = 67;
    const detail = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = product.nombre;
    const price = document.createElement("p");
    price.textContent = money(product.precio) + " · muestra";
    const controls = document.createElement("div");
    controls.className = "quantity-controls";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Quitar una unidad de " + product.nombre);
    minus.addEventListener("click", () => changeQuantity(product.id, -1));
    const quantity = document.createElement("output");
    quantity.textContent = String(entry.quantity);
    quantity.setAttribute("aria-label", "Cantidad de " + product.nombre);
    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.disabled = entry.quantity >= 9;
    plus.setAttribute("aria-label", "Añadir una unidad de " + product.nombre);
    plus.addEventListener("click", () => changeQuantity(product.id, 1));
    controls.append(minus, quantity, plus);
    detail.append(title, price, controls);
    const remove = document.createElement("button");
    remove.className = "remove-item";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Quitar " + product.nombre + " de la bolsa demo");
    remove.addEventListener("click", () => {
      cart = cart.filter((candidate) => candidate.id !== product.id);
      saveList(CART_KEY, cart);
      renderCart();
    });
    row.append(image, detail, remove);
    cartItems.append(row);
  });
  saveList(CART_KEY, cart);
}

function openDetail(product) {
  const img = document.createElement("img");
  img.src = product.imagen;
  img.alt = "Mockup conceptual de " + product.nombre;
  img.width = 640;
  img.height = 640;
  document.getElementById("detailArt").replaceChildren(img);
  document.getElementById("detailCategory").textContent = "PIEZA CONCEPTUAL / " + product.categoria.toUpperCase();
  document.getElementById("detailName").textContent = product.nombre;
  document.getElementById("detailDescription").textContent = product.descripcion;
  document.getElementById("detailPrice").textContent = money(product.precio);
  document.getElementById("detailAdd").onclick = () => {
    addToCart(product);
    detailDialog.close();
  };
  detailDialog.showModal();
}

function closeFromBackdrop(dialog, event) {
  if (event.target === dialog) dialog.close();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2300);
}

function bindEvents() {
  document.querySelectorAll(".category-link").forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });
  favoritesToggle.addEventListener("click", () => {
    showFavoritesOnly = !showFavoritesOnly;
    activeFilter = "all";
    document.querySelectorAll(".category-link").forEach((button) => {
      const selected = button.dataset.filter === "all" && !showFavoritesOnly;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    updateFavoritesButton();
    renderProducts();
    const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("coleccion").scrollIntoView({ behavior: motionReduced ? "auto" : "smooth", block: "start" });
  });
  document.getElementById("resetFavorites").addEventListener("click", () => {
    showFavoritesOnly = false;
    setFilter("all");
  });
  openCartButton.addEventListener("click", () => {
    openCartButton.setAttribute("aria-expanded", "true");
    cartDialog.showModal();
  });
  cartDialog.addEventListener("close", () => openCartButton.setAttribute("aria-expanded", "false"));
  cartDialog.addEventListener("cancel", () => openCartButton.setAttribute("aria-expanded", "false"));
  cartDialog.addEventListener("click", (event) => closeFromBackdrop(cartDialog, event));
  detailDialog.addEventListener("click", (event) => closeFromBackdrop(detailDialog, event));
  noticeDialog.addEventListener("click", (event) => closeFromBackdrop(noticeDialog, event));
  document.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", () => cartDialog.close()));
  document.querySelectorAll("[data-close-detail]").forEach((button) => button.addEventListener("click", () => detailDialog.close()));
  document.querySelectorAll("[data-close-notice]").forEach((button) => button.addEventListener("click", () => noticeDialog.close()));
  document.getElementById("checkoutDemo").addEventListener("click", () => {
    cartDialog.close();
    noticeDialog.showModal();
  });
}

async function start() {
  bindEvents();
  updateFavoritesButton();
  try {
    const response = await fetch("productos.json");
    if (!response.ok) throw new Error("No se pudo cargar la colección.");
    const data = await response.json();
    products = data.filter((product) => product && typeof product.id === "string" && typeof product.nombre === "string");
    if (!products.length) throw new Error("La colección no tiene piezas disponibles.");
    const productIds = new Set(products.map((product) => product.id));
    cart = cart.filter((item) => productIds.has(item.id));
    favorites = new Set([...favorites].filter((id) => productIds.has(id)));
    saveList(CART_KEY, cart);
    saveList(FAVORITES_KEY, [...favorites]);
    updateFavoritesButton();
    renderProducts();
    renderCart();
  } catch (error) {
    grid.setAttribute("aria-busy", "false");
    resultsCount.textContent = "COLECCIÓN NO DISPONIBLE";
    const message = document.createElement("p");
    message.className = "catalog-footnote";
    message.textContent = "No se pudo cargar la colección. Recargá la página para volver a intentarlo.";
    grid.replaceChildren(message);
  }
}

start();
