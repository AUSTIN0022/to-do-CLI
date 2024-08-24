const express = require('express');
const path = require('path');
const { kv } = require('@vercel/kv');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const loadTodos = async () => {
    try {
        const todos = await kv.get('todos');
        return todos || [];
    } catch (err) {
        console.error('Error loading todos:', err);
        return [];
    }
};

const saveTodos = async (todos) => {
    try {
        await kv.set('todos', todos);
    } catch (err) {
        console.error('Error saving todos:', err);
    }
};

app.post('/cmd', async (req, res) => {
    const { command, args } = req.body;
    console.log(`Received command: ${command} with args: ${args}`);

    let todos = await loadTodos();
    let output = '';

    switch (command) {
        case 'add':
            const newTodo = { task: args.join(' '), done: false };
            todos.push(newTodo);
            await saveTodos(todos);
            output = `Added new todo: "${newTodo.task}"`;
            break;

        case 'list':
            output = todos.map((todo, index) => 
                `${index + 1}. [${todo.done ? '✓' : ' '}] ${todo.task}`
            ).join('\n');
            break;

        case 'done':
            const indexToMark = parseInt(args[0], 10) - 1;
            if (todos[indexToMark]) {
                todos[indexToMark].done = true;
                await saveTodos(todos);
                output = `Marked todo as done: "${todos[indexToMark].task}"`;
            } else {
                output = 'Invalid todo number';
            }
            break;

        case 'delete':
            const indexToDelete = parseInt(args[0], 10) - 1;
            if (todos[indexToDelete]) {
                const deletedTodo = todos.splice(indexToDelete, 1);
                await saveTodos(todos);
                output = `Deleted todo: "${deletedTodo[0].task}"`;
            } else {
                output = 'Invalid todo number';
            }
            break;

        default:
            output = `Unknown command: ${command}`;
            break;
    }
    
    res.json({ output });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;