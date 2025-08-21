📝 Cute To-Do List App
A beautiful, modern to-do list application with reminder notifications and adorable styling. Built with vanilla JavaScript, Express.js, and featuring a glassmorphism UI design with cute animations.

Demo Video: https://youtu.be/fc9rnAc8GGE

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fc22b801-ee76-409f-974e-896a8267588f" />


✨ Features

📋 Task Management: Add, edit, complete, and delete tasks
📅 Date & Time Scheduling: Set specific dates and times for tasks
🔔 Smart Reminders: Automatic popup notifications when tasks are due
💫 Beautiful UI: Modern glassmorphism design with smooth animations
📱 Responsive Design: Works perfectly on desktop and mobile devices
🎨 Cute Aesthetics: Bouncing GIF animations and pastel color scheme
⚡ Real-time Updates: Instant task updates without page refresh

🚀 Quick Start
Prerequisites

Node.js (v14 or higher)
npm or yarn

Installation

Clone the repository
bashgit clone https://github.com/yourusername/cute-todo-app.git
cd cute-todo-app

Install dependencies
bashnpm install

Start the server
bashnode server.js

Open your browser
Navigate to http://localhost:3000

📁 Project Structure
cute-todo-app/
├── public/
│   ├── images/
│   │   └── S9Ih.gif          # Cute header animation
│   ├── app.js                # Frontend JavaScript
│   ├── styles.css            # Beautiful CSS styling
│   └── index.html            # Main HTML file
├── server.js                 # Express.js backend
├── package.json              # Dependencies
└── README.md                 # This file


🛠️ Technologies Used:
Frontend: HTML5, CSS3, Vanilla JavaScript
Backend: Node.js, Express.js
Storage: In-memory storage (perfect for demos)
UI/UX: Glassmorphism design, CSS animations, responsive layout

💡 How It Works
Frontend (app.js)

Handles user interactions and form submissions
Manages the custom alert dialog system
Checks for reminders every minute
Updates the UI dynamically

Backend (server.js)

RESTful API endpoints for CRUD operations
In-memory storage for tasks
Serves static files from the public directory

Styling (styles.css)

Modern glassmorphism design with backdrop filters
Responsive grid layout
Smooth hover animations and transitions
Custom alert modal styling
