const express = require("express");
const app = express();

app.use(express.json());

let todos = []; // our in-memory storage

// Get all todos
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

// Add a todo
app.post("/api/todos", (req, res) => {
  const { text, date, time } = req.body;
  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    date,
    time
  };
  todos.push(newTodo);
  res.json(newTodo);
});

// Toggle complete
app.put("/api/todos/:id", (req, res) => {
  const todo = todos.find(t => t.id == req.params.id);
  if (todo) {
    todo.completed = !todo.completed;
    res.json(todo);
  } else {
    res.status(404).json({ error: "Todo not found" });
  }
});

// Delete a todo
app.delete("/api/todos/:id", (req, res) => {
  todos = todos.filter(t => t.id != req.params.id);
  res.json({ message: "Deleted" });
});

// Vercel handles the listener, we just export the app
module.exports = app;