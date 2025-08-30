// DOM elements
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const notification = document.getElementById('notification');

// State
let todos = [];
let currentFilter = 'all';

// Event listeners
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Functions
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;

    fetch('http://127.0.0.1:5000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, completed: false })
    })
        .then(res => res.json())
        .then(newTodo => {
            todos.unshift(newTodo); // add on top
            renderTodos();
            todoInput.value = '';
            showNotification('Task added successfully!');
        })
        .catch(err => {
            console.error(err);
            showNotification('Error adding task!', true);
        });
}

function toggleTodo(id, completed) {
    fetch(`http://127.0.0.1:5000/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
    })
        .then(res => res.json())
        .then(updatedTodo => {
            const todo = todos.find(t => t.id === id);
            if (todo) todo.completed = updatedTodo.completed;
            renderTodos();
            showNotification('Task updated successfully!');
        })
        .catch(err => {
            console.error(err);
            showNotification('Error updating task!', true);
        });
}

function deleteTodo(id) {
    fetch(`http://127.0.0.1:5000/api/todos/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
            showNotification('Task deleted successfully!');
        })
        .catch(err => {
            console.error(err);
            showNotification('Error deleting task!', true);
        });
}

function renderTodos() {
    let filtered = todos;
    if (currentFilter === 'active') filtered = todos.filter(t => !t.completed);
    if (currentFilter === 'completed') filtered = todos.filter(t => t.completed);

    todoList.innerHTML = '';

    if (filtered.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'No tasks found';
        empty.style.textAlign = 'center';
        empty.style.padding = '20px';
        empty.style.color = '#7f8c8d';
        todoList.appendChild(empty);
        return;
    }

    filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <button class="todo-delete">Delete</button>
            `;

        const checkbox = li.querySelector('.todo-checkbox');
        const deleteBtn = li.querySelector('.todo-delete');

        checkbox.addEventListener('change', () => toggleTodo(todo.id, !todo.completed));
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        todoList.appendChild(li);
    });
}

function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.style.backgroundColor = isError ? '#e74c3c' : '#2ecc71';
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// Initial load
fetch('http://127.0.0.1:5000/api/todos')
    .then(res => res.json())
    .then(data => {
        todos = data;
        renderTodos();
    })
    .catch(err => {
        console.error(err);
        showNotification('Error loading tasks!', true);
    });