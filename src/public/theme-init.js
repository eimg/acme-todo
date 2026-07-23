var t = localStorage.getItem("acme-todo-theme");
if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
