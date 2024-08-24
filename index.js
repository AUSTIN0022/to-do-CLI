const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));


const loadTodos = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'todos.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const saveTodos = (todos) => {
    fs.writeFileSync(path.join(__dirname, 'todos.json'), JSON.stringify(todos, null, 2));
};

app.post('/cmd', (req, res) => {
    const { command, args } = req.body;
    console.log(`Received command: ${command} with args: ${args}`);

    let todos = loadTodos();
    let output = '';

    switch (command) {
        case 'add':
            const newTodo = { task: args.join(' '), done: false };
            todos.push(newTodo);
            saveTodos(todos);
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
                saveTodos(todos);
                output = `Marked todo as done: "${todos[indexToMark].task}"`;
            } else {
                output = 'Invalid todo number';
            }
            break;

        case 'delete':
            const indexToDelete = parseInt(args[0], 10) - 1;
            if (todos[indexToDelete]) {
                const deletedTodo = todos.splice(indexToDelete, 1);
                saveTodos(todos);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
