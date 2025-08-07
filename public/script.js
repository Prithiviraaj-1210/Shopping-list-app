const BASE_URL = "https://shopping-list-app-1-08m3.onrender.com";

let shoppingList = [];
const listContainer = document.getElementById("items-list");

async function loadItems() {
  try {
    const res = await fetch(`${BASE_URL}/api/items`);
    shoppingList = await res.json();
    renderItems();
  } catch (err) {
    console.error("❌ Failed to load items:", err);
  }
}

function renderItems() {
  listContainer.innerHTML = "";
  if (shoppingList.length === 0) {
    listContainer.innerHTML = `<p class="text-center text-gray-500">No items in the list.</p>`;
    return;
  }

  shoppingList.forEach(item => {
    const div = document.createElement("div");
    div.className = "flex justify-between items-center bg-gray-100 px-3 py-2 rounded";
    const textClass = item.completed ? "line-through text-gray-500" : "text-gray-800";
    div.innerHTML = `
      <div class="flex justify-between w-full">
        <div class="${textClass} w-2/3 truncate">${item.name}</div>
        <div class="bg-indigo-100 text-indigo-700 text-sm px-2 py-1 rounded w-fit">${item.quantity}</div>
      </div>
      <div class="flex space-x-2 text-xs ml-2">
        <button onclick="toggleComplete('${item._id}', ${!item.completed})" class="text-green-600 hover:underline">Complete</button>
        <button onclick="editItem('${item._id}')" class="text-indigo-500 hover:underline">Edit</button>
        <button onclick="deleteItem('${item._id}')" class="text-red-500 hover:underline">Delete</button>
      </div>`;
    listContainer.appendChild(div);
  });
}

async function addItem() {
  const name = document.getElementById("item-name").value.trim();
  const quantity = document.getElementById("manual-quantity").value.trim() || document.getElementById("quantity-select").value;

  if (!name) return alert("Enter an item name!");

  const res = await fetch(`${BASE_URL}/api/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, completed: false })
  });

  const newItem = await res.json();
  shoppingList.push(newItem);
  renderItems();

  document.getElementById("item-name").value = "";
  document.getElementById("manual-quantity").value = "";
}

async function toggleComplete(id, completed) {
  await fetch(`${BASE_URL}/api/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed })
  });
  loadItems();
}

async function editItem(id) {
  const item = shoppingList.find(i => i._id === id);
  const newName = prompt("Edit name:", item.name);
  const newQty = prompt("Edit quantity:", item.quantity);
  if (!newName || !newQty) return;
  await fetch(`${BASE_URL}/api/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName, quantity: newQty })
  });
  loadItems();
}

async function deleteItem(id) {
  await fetch(`${BASE_URL}/api/items/${id}`, { method: "DELETE" });
  loadItems();
}

async function newList() {
  if (shoppingList.length === 0) return alert("No items to save!");
  const name = prompt("Enter name for this list:");
  if (!name) return;
  await fetch(`${BASE_URL}/api/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, items: shoppingList })
  });
  shoppingList = [];
  renderItems();
}

async function showPreviousLists() {
  const res = await fetch(`${BASE_URL}/api/lists`);
  const lists = await res.json();
  const container = document.getElementById("previous-lists");
  const ul = document.getElementById("previous-list-names");
  ul.innerHTML = "";
  container.classList.remove("hidden");

  lists.forEach(list => {
    const li = document.createElement("li");
    li.textContent = list.name;
    li.className = "cursor-pointer hover:text-indigo-500";
    li.onclick = async () => {
      await fetch(`${BASE_URL}/api/lists/load/${list._id}`, { method: "POST" });
      loadItems();
    };
    ul.appendChild(li);
  });
}

function downloadCSV() {
  if (shoppingList.length === 0) return alert("No items to download!");
  const csv = "Item,Quantity,Completed\n" +
    shoppingList.map(item => `${item.name},${item.quantity},${item.completed ? "Yes" : "No"}`).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shopping_list.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function sendToWhatsApp() {
  if (shoppingList.length === 0) return alert("No items to share!");
  const message = shoppingList
    .map(item => `${item.completed ? "✅" : "🛒"} ${item.name} : ${item.quantity}`)
    .join("\n");
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

window.onload = loadItems;
