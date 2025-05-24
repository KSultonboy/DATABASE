document.getElementById("branch-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const data = {
    branch: form.branch.value,
    product: form.product.value,
    quantity: parseFloat(form.quantity.value),
    unit: form.unit.value,
    price: parseInt(form.price.value),
    date: form.date.value
  };

  try {
    const res = await fetch("http://localhost:3000/branch-sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const message = await res.text();
    alert(message);
    form.reset();
  } catch (err) {
    alert("❌ Saqlashda xatolik: " + err.message);
  }
});
