const API = 'https://your-backend-url.onrender.com/api';

// Show login or register tab
function showTab(tab) {
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
}

// Register
async function register() {
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  document.getElementById('reg-msg').textContent = data.message;
}

// Login
async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('login-msg').textContent = data.message;
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Load tasks
async function loadTasks() {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'index.html';
  document.getElementById('welcome-msg').textContent = 'Hi, ' + localStorage.getItem('username') + '! ';
  const res = await fetch(`${API}/tasks`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const tasks = await res.json();
  document.getElementById('todo-list').innerHTML = '';
  document.getElementById('progress-list').innerHTML = '';
  document.getElementById('done-list').innerHTML = '';
  tasks.forEach(task => renderTask(task));
}

// Render task card
function renderTask(task) {
  const div = document.createElement('div');
  div.className = 'task-card';
  div.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <div class="task-actions">
      <button class="btn-todo" onclick="updateStage('${task._id}', 'Todo')">Todo</button>
      <button class="btn-progress" onclick="updateStage('${task._id}', 'In Progress')">In Progress</button>
      <button class="btn-done" onclick="updateStage('${task._id}', 'Done')">Done</button>
      <button class="btn-delete" onclick="deleteTask('${task._id}')">Delete</button>
    </div>
  `;
  if (task.stage === 'Todo') document.getElementById('todo-list').appendChild(div);
  else if (task.stage === 'In Progress') document.getElementById('progress-list').appendChild(div);
  else document.getElementById('done-list').appendChild(div);
}

// Add task
async function addTask() {
  const token = localStorage.getItem('token');
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-desc').value;
  const stage = document.getElementById('task-stage').value;
  if (!title) return alert('Please enter a title!');
  await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ title, description, stage })
  });
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value = '';
  loadTasks();
}

// Update stage
async function updateStage(id, stage) {
  const token = localStorage.getItem('token');
  await fetch(`${API}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ stage })
  });
  loadTasks();
}

// Delete task
async function deleteTask(id) {
  const token = localStorage.getItem('token');
  await fetch(`${API}/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  loadTasks();
}

// Auto load tasks on dashboard
if (window.location.href.includes('dashboard')) loadTasks();