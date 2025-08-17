const todoInput = document.getElementById("todoInput");
const todoDate = document.getElementById("todoDate");  
const todoTime = document.getElementById("todoTime");  
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");

// Custom alert function
function showCustomAlert(title, message) {
  // Remove existing alert if any
  const existingAlert = document.querySelector('.alert-overlay');
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create alert overlay
  const overlay = document.createElement('div');
  overlay.className = 'alert-overlay';
  
  // Create alert dialog
  const dialog = document.createElement('div');
  dialog.className = 'alert-dialog';
  
  dialog.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
    <button onclick="this.closest('.alert-overlay').remove()">OK</button>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// Fetch and display todos
async function loadTodos() {
  try {
    const res = await fetch("/api/todos");
    const todos = await res.json();
    todoList.innerHTML = "";
    
    if (todos.length === 0) {
      emptyState.style.display = 'block';
      todoList.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      todoList.style.display = 'flex';
      todos.forEach(todo => renderTodo(todo));
    }
  } catch (error) {
    console.error('Failed to load todos:', error);
  }
}

// Reminder checker (every 1 min)
setInterval(async () => {
  try {
    const res = await fetch("/api/todos");
    const todos = await res.json();

    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; 
    const currentTime = now.toTimeString().slice(0, 5); 

    todos.forEach(todo => {
      if (todo.completed) return; // Don't remind for completed tasks
      
      const todoDate = new Date(`${todo.date}T${todo.time}`);
      
      // Format nicely for alert
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = todoDate.toLocaleDateString(undefined, options);
      const formattedTime = todoDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (todo.date === currentDate && todo.time === currentTime) {
        showCustomAlert(
          '🔔 Reminder!',
          `${todo.text}\n\nScheduled for ${formattedDate} at ${formattedTime}`
        );
      }
    });
  } catch (error) {
    console.error('Failed to check reminders:', error);
  }
}, 60000);

function renderTodo(todo) {
  const li = document.createElement("li");
  
  const span = document.createElement("span");
  span.className = todo.completed ? "completed" : "";
  
  let todoText = todo.text;
  if (todo.date) todoText += ` 📅 ${todo.date}`;
  if (todo.time) todoText += ` ⏰ ${todo.time}`;
  
  span.textContent = todoText;

  // Toggle button
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = todo.completed ? "Undo" : "Done";
  toggleBtn.onclick = async () => {
    try {
      await fetch(`/api/todos/${todo.id}`, { method: "PUT" });
      loadTodos();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.textContent = "✖";
  delBtn.onclick = async () => {
    try {
      await fetch(`/api/todos/${todo.id}`, { method: "DELETE" });
      loadTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  li.appendChild(span);
  li.appendChild(toggleBtn);
  li.appendChild(delBtn);
  todoList.appendChild(li);
}

addBtn.onclick = async () => {
  const text = todoInput.value.trim();
  const date = todoDate.value;
  const time = todoTime.value;

  if (!text) {
    showCustomAlert('❌ Error', 'Please enter a task description.');
    todoInput.focus();
    return;
  }

  try {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, date, time })
    });

    // Clear inputs
    todoInput.value = "";
    todoDate.value = "";
    todoTime.value = "";

    loadTodos();
    todoInput.focus();
  } catch (error) {
    console.error('Failed to add todo:', error);
    showCustomAlert('❌ Error', 'Failed to add task. Please try again.');
  }
};

// Allow Enter key to add todo
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addBtn.click();
  }
});

// Initialize
loadTodos();