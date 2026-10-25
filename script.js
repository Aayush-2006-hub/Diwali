/* ============ SETTINGS – EDIT HERE ============ */
const WHATSAPP_NUMBER = "919158448613"; // country code 91 + number, no + or spaces
const SHOP_NAME = "Diwali Faral – Pornima Shinde";

// Prices are for 1 kg. Half kg is calculated automatically (price / 2).
const ITEMS = [
  { id: 1,  mr: "बेसन लाडू",          en: "Besan Ladoo",           price: 600 },
  { id: 2,  mr: "रवा लाडू",           en: "Rava Ladoo",            price: 560 },
  { id: 3,  mr: "करंजी",              en: "Karanji",               price: 650 },
  { id: 4,  mr: "भाजणीची चकली",       en: "Bhajanichi Chakli",     price: 550 },
  { id: 5,  mr: "गोड शंकरपाळी",       en: "God Shankarpali",       price: 460 },
  { id: 6,  mr: "खारी शंकरपाळी",      en: "Khari Shankarpali",     price: 460 },
  { id: 7,  mr: "तिखट शेव",           en: "Tikhat Sev",            price: 480 },
  { id: 8,  mr: "मिठातली शेव",        en: "Mithatli Sev",          price: 450 },
  { id: 9,  mr: "भाजके पोहे चिवडा",   en: "Bhajke Pohe Chivda",    price: 460 },
  { id: 10, mr: "पातळ पोहे चिवडा",    en: "Patal Pohe Chivda",     price: 460 },
  { id: 11, mr: "मका पोहे चिवडा",     en: "Maka Pohe Chivda",      price: 460 },
];
/* ============================================== */

const SIZES = [
  { key: "half", label: "½ kg", factor: 0.5 },
  { key: "full", label: "1 kg", factor: 1 },
];

// cart[itemId][sizeKey] = number of packs
const cart = {};
ITEMS.forEach(i => (cart[i.id] = { half: 0, full: 0 }));

const $ = s => document.querySelector(s);
const rupee = n => "₹" + n.toLocaleString("en-IN");
const priceFor = (item, size) => Math.round(item.price * size.factor);

/* ---------- Render menu ---------- */
function renderItems() {
  $("#items").innerHTML = ITEMS.map(item => `
    <article class="item">
      <h3>${item.mr} <small style="font-weight:500;color:#777;font-size:.75rem">${item.en}</small></h3>
      ${SIZES.map(size => `
        <div class="row">
          <div class="size">${size.label}<small>${rupee(priceFor(item, size))}</small></div>
          <div class="stepper">
            <button type="button" data-id="${item.id}" data-size="${size.key}" data-d="-1" aria-label="Decrease">−</button>
            <span id="q-${item.id}-${size.key}">0</span>
            <button type="button" data-id="${item.id}" data-size="${size.key}" data-d="1" aria-label="Increase">+</button>
          </div>
        </div>`).join("")}
    </article>`).join("");
}

$("#items").addEventListener("click", e => {
  const b = e.target.closest("button[data-id]");
  if (!b) return;
  const id = +b.dataset.id, size = b.dataset.size, d = +b.dataset.d;
  cart[id][size] = Math.max(0, Math.min(50, cart[id][size] + d));
  $(`#q-${id}-${size}`).textContent = cart[id][size];
  updateBar();
});

/* ---------- Cart helpers ---------- */
function getLines() {
  const lines = [];
  ITEMS.forEach(item => SIZES.forEach(size => {
    const qty = cart[item.id][size.key];
    if (qty > 0) lines.push({
      item, size, qty,
      amount: priceFor(item, size) * qty,
    });
  }));
  return lines;
}
const getTotal = () => getLines().reduce((s, l) => s + l.amount, 0);

function updateBar() {
  const lines = getLines();
  const count = lines.reduce((s, l) => s + l.qty, 0);
  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = rupee(getTotal());
  $("#cartBar").classList.toggle("hidden", count === 0);
}

/* ---------- Modal ---------- */
function openModal() {
  const lines = getLines();
  $("#summary").innerHTML =
    lines.map(l => `
      <div class="line">
        <span>${l.item.mr} (${l.size.label}) × ${l.qty}</span>
        <span>${rupee(l.amount)}</span>
      </div>`).join("") +
    `<div class="line total"><span>Total</span><span>${rupee(getTotal())}</span></div>`;
  $("#error").textContent = "";
  $("#modal").classList.remove("hidden");
}
const closeModal = () => $("#modal").classList.add("hidden");

$("#openCheckout").addEventListener("click", openModal);
$("#closeModal").addEventListener("click", closeModal);
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });

/* ---------- Place order -> WhatsApp ---------- */
$("#orderForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#name").value.trim();
  const phone = $("#phone").value.trim();
  const address = $("#address").value.trim();
  const note = $("#note").value.trim();
  const lines = getLines();

  if (!lines.length) { $("#error").textContent = "Please select at least one item."; return; }
  if (name.length < 2) { $("#error").textContent = "Please enter your name."; return; }
  if (!/^[6-9]\d{9}$/.test(phone)) { $("#error").textContent = "Please enter a valid 10-digit mobile number."; return; }

  const orderId = "DF" + Date.now().toString().slice(-6);
  const now = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  let msg = `*🪔 NEW DIWALI FARAL ORDER 🪔*\n`;
  msg += `Order ID: ${orderId}\nDate: ${now}\n\n`;
  msg += `*Customer:* ${name}\n*Mobile:* ${phone}\n`;
  if (address) msg += `*Address:* ${address}\n`;
  msg += `\n*Items:*\n`;
  lines.forEach((l, i) => {
    msg += `${i + 1}. ${l.item.mr} (${l.item.en}) – ${l.size.label} × ${l.qty} = ${rupee(l.amount)}\n`;
  });
  msg += `\n*TOTAL: ${rupee(getTotal())}*\n`;
  if (note) msg += `\n*Note:* ${note}\n`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});

renderItems();
updateBar();
