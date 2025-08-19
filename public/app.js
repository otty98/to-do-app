const todoInput = document.getElementById("todoInput");
const todoDate = document.getElementById("todoDate");  
const todoTime = document.getElementById("todoTime");  
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");

// ✅ Detect environment and set API base
const API_BASE = window.location.hostname.includes("localhost")
  ? "http://localhost:5000"   // Local dev
  : "https://to-do-app-production.up.railway.app"; // Railway URL

// Debug function to log errors
function debugLog(message, error = null) {
  console.log('🔍 DEBUG:', message);
  if (error) console.error('❌ ERROR:', error);
}

// Custom alert function
function showCustomAlert(title, message) {
  debugLog(`Showing alert: ${title} - ${message}`);
  
  const existingAlert = document.querySelector('.alert-overlay');
  if (existingAlert) existingAlert.remove();

  const overlay = document.createElement('div');
  overlay.className = 'alert-overlay';
  
  const dialog = document.createElement('div');
  dialog.className = 'alert-dialog';
  
  dialog.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
    <button onclick="this.closest('.alert-overlay').remove()">OK</button>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

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
  debugLog('Loading todos...');
  try {
    const res = await fetch(`${API_BASE}/api/todos`);
    debugLog(`API response status: ${res.status}`);
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const todos = await res.json();
    debugLog(`Loaded ${todos.length} todos`);
    
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
    debugLog('Failed to load todos', error);
    showCustomAlert('⚠️ Connection Error', 'Failed to load tasks. Please check your internet connection.');
  }
}

// Reminder checker (every 1 min)
setInterval(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/todos`);
    if (!res.ok) return;
    
    const todos = await res.json();
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; 
    const currentTime = now.toTimeString().slice(0, 5); 

    todos.forEach(todo => {
      if (todo.completed) return;
      
      const todoDate = new Date(`${todo.date}T${todo.time}`);
      
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
    debugLog('Failed to check reminders', error);
  }
}, 60000);

function renderTodo(todo) {
  debugLog(`Rendering todo: ${todo.text} (ID: ${todo._id})`);
  
  const li = document.createElement("li");
  
  const span = document.createElement("span");
  span.className = todo.completed ? "completed" : "";
  
  let todoText = todo.text;
  if (todo.date) todoText += ` 📅 ${todo.date}`;
  if (todo.time) todoText += ` ⏰ ${todo.time}`;
  
  span.textContent = todoText;

  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = todo.completed ? "Undo" : "Done";
  toggleBtn.onclick = async (e) => {
    debugLog(`Toggle button clicked for todo: ${todo._id}`);
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`${API_BASE}/api/todos/${todo._id}`, { 
        method: "PUT",
        headers: { 'Content-Type': 'application/json' }
      });
      
      debugLog(`Toggle response status: ${response.status}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      debugLog('Toggle successful', result);
      
      await loadTodos();
    } catch (error) {
      debugLog('Failed to toggle todo', error);
      showCustomAlert('⚠️ Error', 'Failed to update task. Please try again.');
    }
  };

  const delBtn = document.createElement("button");
  delBtn.textContent = "✖";
  delBtn.onclick = async (e) => {
    debugLog(`Delete button clicked for todo: ${todo._id}`);
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`${API_BASE}/api/todos/${todo._id}`, { 
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' }
      });
      
      debugLog(`Delete response status: ${response.status}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      debugLog('Delete successful', result);
      
      await loadTodos();
    } catch (error) {
      debugLog('Failed to delete todo', error);
      showCustomAlert('⚠️ Error', 'Failed to delete task. Please try again.');
    }
  };

  li.appendChild(span);
  li.appendChild(toggleBtn);
  li.appendChild(delBtn);
  todoList.appendChild(li);
}

addBtn.onclick = async (e) => {
  debugLog('Add button clicked');
  e.preventDefault();
  
  const text = todoInput.value.trim();
  const date = todoDate.value;
  const time = todoTime.value;

  if (!text) {
    showCustomAlert('⚠️ Error', 'Please enter a task description.');
    todoInput.focus();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, date, time })
    });

    debugLog(`Add response status: ${response.status}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    debugLog('Add successful', result);

    todoInput.value = "";
    todoDate.value = "";
    todoTime.value = "";

    await loadTodos();
    todoInput.focus();
  } catch (error) {
    debugLog('Failed to add todo', error);
    showCustomAlert('⚠️ Error', 'Failed to add task. Please try again.');
  }
};

todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    debugLog('Enter key pressed');
    addBtn.click();
  }
});

async function testConnection() {
  debugLog('Testing API connection...');
  try {
    const response = await fetch(`${API_BASE}/api/todos`);
    if (response.ok) {
      debugLog('✅ API connection successful');
    } else {
      debugLog(`❌ API connection failed: ${response.status}`);
      showCustomAlert('⚠️ Connection Issue', 'Cannot connect to the server. Please refresh the page.');
    }
  } catch (error) {
    debugLog('❌ API connection error', error);
    showCustomAlert('⚠️ Connection Issue', 'Cannot connect to the server. Please check your internet connection.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOM loaded, initializing app...');
  testConnection();
  loadTodos();
});
