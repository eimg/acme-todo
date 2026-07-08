const listEl = document.getElementById("todo-list");
const emptyEl = document.getElementById("empty");
const form = document.getElementById("add-form");
const input = document.getElementById("new-todo");

let todos = [];

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function loadTodos() {
  todos = await api("/api/todos");
  render();
}

function render() {
  if (todos.length === 0) {
    listEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");
  listEl.innerHTML = todos
    .map(
      (todo) => `
      <li class="todo-item ${todo.done ? "done" : ""}" data-id="${todo.id}">
        <input class="todo-check" type="checkbox" ${todo.done ? "checked" : ""} aria-label="Toggle done" />
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="todo-delete" type="button">Delete</button>
      </li>`
    )
    .join("");

  for (const item of listEl.querySelectorAll(".todo-item")) {
    const id = Number(item.dataset.id);
    item.querySelector(".todo-check").addEventListener("change", async (e) => {
      const done = e.target.checked;
      await api(`/api/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ done }),
      });
      await loadTodos();
    });
    item.querySelector(".todo-delete").addEventListener("click", async () => {
      await api(`/api/todos/${id}`, { method: "DELETE" });
      await loadTodos();
    });
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  await api("/api/todos", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  input.value = "";
  await loadTodos();
});

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

loadTodos().catch((err) => {
  emptyEl.textContent = err.message;
  emptyEl.classList.remove("hidden");
});
