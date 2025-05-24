document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("order-form")?.addEventListener("submit", submitOrder);

  const radios = document.querySelectorAll('input[name="reportType"]');
  radios.forEach(radio => {
    radio.addEventListener("change", updateDateInput);
  });

  updateDateInput();

  document.getElementById("expense-form").addEventListener("submit", submitExpense);
  loadExpenses();

    // Ishlab chiqarish formasini yuborish
  const productionForm = document.getElementById("production-form");
  if (productionForm) {
    productionForm.addEventListener("submit", submitProduction);
  }

  // Ishlab chiqarish ro‘yxatini yuklash
  loadProduction();
});



function updateDateInput() {
  const type = document.querySelector('input[name="reportType"]:checked').value;
  document.getElementById("report-date").style.display = type === "daily" ? "inline-block" : "none";
  document.getElementById("report-week").style.display = type === "weekly" ? "inline-block" : "none";
  document.getElementById("report-month").style.display = type === "monthly" ? "inline-block" : "none";
}

function getReportParam(type) {
  if (type === "daily") return document.getElementById("report-date").value;
  if (type === "weekly") return document.getElementById("report-week").value;
  if (type === "monthly") return document.getElementById("report-month").value;
}

function getParamKey(type) {
  return type === "daily" ? "date" : type === "weekly" ? "week" : "month";
}

window.viewReport = function () {
  const type = document.querySelector('input[name="reportType"]:checked').value;
  const param = getReportParam(type);
  if (!param) return alert("Sana tanlanmagan!");

fetch(`http://localhost:3000/report/${type}?${getParamKey(type)}=${param}`)
    .then(res => {
      if (!res.ok) throw new Error("Hisobotni olishda xatolik");
      return res.json();
    })
    .then(data => {
      console.log("✅ Hisobot ma'lumotlari:", data);

      document.getElementById("report-summary").style.display = "flex";
      document.getElementById("report-row").style.display = "flex";
      document.getElementById("chart-title").style.display = "block";
      document.getElementById("reportChart").style.display = "block";

      document.getElementById("produced-count").textContent = `${data.total_production_kg} kg, ${data.total_production_dona} dona`;
      document.getElementById("sold-store").textContent = `${data.store_sold_kg} kg – ${data.store_sold_kg_price} so'm, ${data.store_sold_dona} dona – ${data.store_sold_dona_price} so'm`;
      document.getElementById("order-count").textContent = `${data.total_orders} ta – ${data.total_order_income} so'm`;
      document.getElementById("total-income").textContent = `${data.total_income} so'm`;
      document.getElementById("total-expenses").textContent = `${data.total_expenses} so'm`;
      document.getElementById("net-profit").textContent = `${data.net_profit} so'm`;

      renderChart(
        ["Ishlab chiqarish", "Xarajatlar", "Buyurtmalar", "Tushum"],
        [data.total_production_sum, data.total_expenses, data.total_orders, data.total_income]
      );

      const sources = document.getElementById("order-sources");
      sources.innerHTML = "";
      for (const [source, count] of Object.entries(data.platforms)) {
        const li = document.createElement("li");
        li.textContent = `${source}: ${count} ta`;
        sources.appendChild(li);
      }

      const products = document.getElementById("top-products");
      products.innerHTML = "";
      data.top_products.forEach(prod => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${prod.name}</td><td>${prod.sold}</td>`;
        products.appendChild(row);
      });
    })
    .catch(err => {
      console.error(err);
      alert("Hisobotni olishda xatolik yuz berdi");
    });
};

function renderChart(labels, data) {
  const ctx = document.getElementById("reportChart").getContext("2d");
  if (window.chartInstance) window.chartInstance.destroy();

  window.chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "📊 Hisobot ma'lumotlari",
        data: data,
        backgroundColor: ["#007bff", "#dc3545", "#ffc107", "#28a745"],
        borderRadius: 6,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            font: { size: 14 },
            color: "#333"
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ": " + context.raw.toLocaleString() + " so'm";
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => value.toLocaleString() + " so'm"
          },
          title: {
            display: true,
            text: "Miqdor (so'm)",
            font: { size: 14 }
          }
        },
        x: {
          title: {
            display: true,
            text: "Kategoriya",
            font: { size: 14 }
          }
        }
      }
    }
  });
}

function downloadPdfReport() {
  const type = document.querySelector('input[name="reportType"]:checked').value;
  const param = getReportParam(type);
  if (!param) return alert("Sana tanlanmagan!");
  const url = `http://localhost:3000/report/pdf/${type}?${getParamKey(type)}=${encodeURIComponent(param)}`;
  window.open(url, "_blank");
}

function submitOrder(event) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;

  const order = {
    customer: form.customer.value.trim(),
    product: form.product.value.trim(),
    quantity: parseFloat(form.quantity.value),
    unit: form.unit.value.trim(),
    source: form.source.value.trim(),
    price: parseInt(form.price.value),
    date: form.date.value,
    note: form.note.value.trim()
  };

  if (!order.customer || !order.product || !order.quantity || !order.unit || !order.date || isNaN(order.price)) {
    alert("Barcha maydonlar to‘g‘ri to‘ldirilishi kerak!");
    button.disabled = false;
    return;
  }

  fetch("http://localhost:3000/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(order)
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      form.reset();
      button.disabled = false;
    })
    .catch(() => {
      alert("Buyurtma qo‘shishda xatolik yuz berdi");
      button.disabled = false;
    });
}

function submitExpense(event) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;

  const expense = {
    type: form.type.value.trim(),
    amount: parseInt(form.amount.value),
    date: form.date.value,
    note: form.note.value.trim()
  };

  if (!expense.type || isNaN(expense.amount) || !expense.date) {
    alert("Barcha majburiy maydonlar to‘ldirilishi kerak!");
    button.disabled = false;
    return;
  }

  fetch("http://localhost:3000/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(expense)
  })
    .then(res => {
      if (!res.ok) throw new Error("Xarajat qo‘shishda xatolik");
      return res.text();
    })
    .then(msg => {
      alert(msg);
      form.reset();
      fetchExpenses(); // 💥 muammo: bu funksiya tugmasi bir necha marta bosilganday bo‘layapti
    })
    .catch(err => alert(err.message))
    .finally(() => {
      button.disabled = false;
    });
}


function loadExpenses() {
  fetch("http://localhost:3000/expenses")
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("expenses-body");
      tbody.innerHTML = "";

      data.forEach(expense => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${expense.date}</td>
          <td>${expense.type}</td>
          <td>${expense.amount} so'm</td>
          <td>${expense.note || "-"}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(() => alert("Xarajatlar ro‘yxatini olishda xatolik yuz berdi"));
}

function submitProduction(event) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;

  const product = {
    name: form.name.value.trim(),
    quantity: parseFloat(form.quantity.value),
    unit: form.unit.value.trim(),
    date: form.date.value
  };

  if (!product.name || !product.quantity || !product.unit || !product.date) {
    alert("Iltimos, barcha maydonlarni to‘ldiring.");
    button.disabled = false;
    return;
  }

  fetch("http://localhost:3000/production", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      form.reset();
      loadProduction(); // Jadvalni yangilash
      button.disabled = false;
    })
    .catch(() => {
      alert("❌ Ma’lumotni yuborishda xatolik yuz berdi.");
      button.disabled = false;
    });
}

function loadProduction() {
  fetch("http://localhost:3000/production")
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("production-list");
      tbody.innerHTML = "";

      data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.date}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.unit}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(() => {
      console.error("❌ Ishlab chiqarish ma’lumotlarini olishda xatolik.");
    });
}

function fetchExpenses() {
  fetch("http://localhost:3000/expenses")
    .then(res => res.json())
    .then(data => {
      const table = document.querySelector("#expenses-table tbody");
      table.innerHTML = "";

      data.forEach(exp => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${exp.date}</td>
          <td>${exp.type}</td>
          <td>${exp.amount}</td>
          <td>${exp.note || ""}</td>
        `;
        table.appendChild(row);
      });
    })
    .catch(err => {
      console.error(err);
      alert("Xarajatlar ro‘yxatini olishda xatolik yuz berdi");
    });
}


// script/products.js

const productForm = document.getElementById("product-form");
const productList = document.getElementById("products-body");
const productTable = document.getElementById("product-table");
const addButton = document.getElementById("add-button");
const updateButton = document.getElementById("update-button");


if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(productForm);
    const editId = productForm.getAttribute("data-edit-id");

    try {
      let res, message;

      if (editId) {
        res = await fetch(`http://localhost:3000/products/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.get("name"),
            category: formData.get("category"),
            price: formData.get("price"),
            description: formData.get("description"),
            image: "" // eski rasm
          })
        });
        message = await res.text();
      } else {
        res = await fetch("http://localhost:3000/products", {
          method: "POST",
          body: formData
        });
        message = await res.text();
      }

      alert(message);
      productForm.reset();
      productForm.removeAttribute("data-edit-id");
      loadProducts();

      // Tugmalar holatini tiklash
      addButton.style.display = "inline-block";
      updateButton.style.display = "none";
    } catch (err) {
      alert("❌ Mahsulotni yuborishda xatolik: " + err.message);
    }
  });
}



async function loadProducts() {
  try {
    const res = await fetch("http://localhost:3000/products");
    const data = await res.json();

    if (!data.length) {
      if (productTable) productTable.style.display = "none";
      return;
    }

    if (productTable) productTable.style.display = "table";
    productList.innerHTML = "";

    data.forEach((product) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          ${product.image ? `<img src="/uploads/${product.image}" width="40">` : "-"}
        </td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.price} so'm</td>
        <td>${product.description || "-"}</td>
        <td>
        <button onclick="editProduct(${product.id})">✏️</button>
        <button onclick="deleteProduct(${product.id})">🗑️</button>
        </td>
      `;
      productList.appendChild(tr);
    });
  } catch (err) {
    alert("❌ Mahsulotlarni yuklashda xatolik: " + err.message);
  }
}

async function deleteProduct(id) {
  if (!confirm("Rostdan ham o‘chirmoqchimisiz?")) return;

  try {
    const res = await fetch(`http://localhost:3000/products/${id}`, {
      method: "DELETE"
    });
    const message = await res.text();
    alert(message);
    loadProducts();
  } catch (err) {
    alert("❌ O‘chirishda xatolik: " + err.message);
  }
}

async function editProduct(id) {
  try {
    const res = await fetch("http://localhost:3000/products");
    const products = await res.json();
    const product = products.find(p => p.id === id);
    if (!product) return alert("Mahsulot topilmadi");

    productForm.name.value = product.name;
    productForm.category.value = product.category;
    productForm.price.value = product.price;
    productForm.description.value = product.description;

    productForm.setAttribute("data-edit-id", id);

    // ➕ tugmasini yashirish, 🔁 tugmasini ko‘rsatish
    addButton.style.display = "none";
    updateButton.style.display = "inline-block";
  } catch (err) {
    alert("❌ Tahrirlashda xatolik: " + err.message);
  }
}

updateButton.addEventListener("click", async () => {
  const editId = productForm.getAttribute("data-edit-id");
  if (!editId) return;

  const updatedData = {
    name: productForm.name.value,
    category: productForm.category.value,
    price: productForm.price.value,
    description: productForm.description.value,
    image: "" // Eski rasmni o‘zgartirmaymiz
  };

  try {
    const res = await fetch(`http://localhost:3000/products/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    const message = await res.text();
    alert(message);

    productForm.reset();
    productForm.removeAttribute("data-edit-id");
    loadProducts();

    // 🔁 tugmani yashirish, ➕ tugmasini qaytarish
    addButton.style.display = "inline-block";
    updateButton.style.display = "none";
  } catch (err) {
    alert("❌ Yangilashda xatolik: " + err.message);
  }
});



// Sahifa yuklanganda avtomatik yuklash
if (productList) loadProducts();
