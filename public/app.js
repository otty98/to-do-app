const todoInput = document.getElementById("todoInput");
const todoDate = document.getElementById("todoDate");  
const todoTime = document.getElementById("todoTime");  
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");

// Set to track already shown reminders to prevent duplicates
const shownReminders = new Set();

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

// Improved reminder checker
function checkReminders() {
  fetch("/api/todos")
    .then(res => res.json())
    .then(todos => {
      const now = new Date();
      
      todos.forEach(todo => {
        // Skip completed tasks
        if (todo.completed) return;
        
        // Skip if no date/time set
        if (!todo.date || !todo.time) return;
        
        // Create reminder key to prevent duplicates
        const reminderKey = `${todo._id}-${todo.date}-${todo.time}`;
        if (shownReminders.has(reminderKey)) return;
        
        // Parse todo date/time
        const todoDateTime = new Date(`${todo.date}T${todo.time}`);
        
        // Check if reminder time has arrived (within 1 minute window)
        const timeDiff = todoDateTime.getTime() - now.getTime();
        const isReminderTime = timeDiff <= 60000 && timeDiff >= 0; // 1 minute window
        
        if (isReminderTime) {
          // Mark as shown to prevent duplicates
          shownReminders.add(reminderKey);
          
          // Format nicely for alert
          const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          };
          const formattedDate = todoDateTime.toLocaleDateString(undefined, options);
          const formattedTime = todoDateTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          });

          showCustomAlert(
            '🔔 Reminder!',
            `${todo.text}\n\nScheduled for ${formattedDate} at ${formattedTime}`
          );
          
          // Optional: Play notification sound
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Todo Reminder', {
              body: `${todo.text}`,
              icon: '/images/7LDs.gif'
            });
          }
        }
      });
    })
    .catch(error => {
      console.error('Failed to check reminders:', error);
    });
}

// Check reminders every 30 seconds for better accuracy
setInterval(checkReminders, 30000);

// Request notification permission on page load
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

function renderTodo(todo) {
  const li = document.createElement("li");
  
  const span = document.createElement("span");
  span.className = todo.completed ? "completed" : "";
  
  let todoText = todo.text;
  if (todo.date) {
    const dateObj = new Date(todo.date);
    const formattedDate = dateObj.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    todoText += ` 📅 ${formattedDate}`;
  }
  if (todo.time) {
    const [hours, minutes] = todo.time.split(':');
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours), parseInt(minutes));
    const formattedTime = timeObj.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
    todoText += ` ⏰ ${formattedTime}`;
  }
  
  span.textContent = todoText;

  // Toggle button
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = todo.completed ? "Undo" : "Done";
  toggleBtn.onclick = async () => {
    try {
      await fetch(`/api/todos/${todo._id}`, { method: "PUT" });
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
      await fetch(`/api/todos/${todo._id}`, { method: "DELETE" });
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
    showCustomAlert('⚠ Error', 'Please enter a task description.');
    todoInput.focus();
    return;
  }

  // Validate date/time combination
  if (date && time) {
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (selectedDateTime < now) {
      showCustomAlert('⚠ Warning', 'The selected date and time is in the past. The reminder may not work as expected.');
    }
  }

  try {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, date, time })
    });

    if (!response.ok) {
      throw new Error('Failed to add todo');
    }

    // Clear inputs
    todoInput.value = "";
    todoDate.value = "";
    todoTime.value = "";

    loadTodos();
    todoInput.focus();
    
    // Show success message
    if (date && time) {
      const selectedDateTime = new Date(`${date}T${time}`);
      const formattedDateTime = selectedDateTime.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      showCustomAlert('✅ Success', `Task added with reminder set for ${formattedDateTime}`);
    }
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

// Set default date to today
function setDefaultDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  todoDate.value = `${year}-${month}-${day}`;
}

// Initialize
loadTodos();
setDefaultDate();

// Clean up old reminder keys periodically (every hour)
setInterval(() => {
  const now = new Date();
  const oneDayAgo = now.getTime() - (24 * 60 * 60 * 1000);
  
  // This is a simple cleanup - in a real app you'd want more sophisticated logic
  if (shownReminders.size > 100) {
    shownReminders.clear();
  }
}, 3600000);