const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const todosFile = path.join(__dirname, 'todos.json');

app.use(express.static('public'));
app.use(express.json());

// Helper functions to load and save todos
function loadTodos() {
    if (!fs.existsSync(todosFile)) {
        return [];
    }
    const data = fs.readFileSync(todosFile, 'utf8');
    return JSON.parse(data);
}

function saveTodos(todos) {
    fs.writeFileSync(todosFile, JSON.stringify(todos, null, 2));
}

// Handle commands
app.post('/cmd', (req, res) => {
    const { command, args } = req.body;
    let output = '';
    console.log(`Received command: ${command} with args: ${args}`);

    const todos = loadTodos();

    switch (command) {
        case 'add':
            const task = args.join(' ');
            todos.push({ task, done: false });
            saveTodos(todos);
            output = `Added new todo: "${task}"`;
            break;
        case 'delete':
            const deleteIndex = parseInt(args[0], 10) - 1;
            if (deleteIndex >= 0 && deleteIndex < todos.length) {
                const [removed] = todos.splice(deleteIndex, 1);
                saveTodos(todos);
                output = `Deleted todo: "${removed.task}"`;
            } else {
                output = 'Invalid index.';
            }
            break;
        case 'done':
            const doneIndex = parseInt(args[0], 10) - 1;
            if (doneIndex >= 0 && doneIndex < todos.length) {
                todos[doneIndex].done = true;
                saveTodos(todos);
                output = `Marked todo as done: "${todos[doneIndex].task}"`;
            } else {
                output = 'Invalid index.';
            }
            break;
        case 'list':
            if (todos.length === 0) {
                output = 'No todos found.';
            } else {
                todos.forEach((todo, index) => {
                    const status = todo.done ? '[✓]' : '[ ]';
                    output += `${index + 1}. ${status} ${todo.task}\n`;
                });
            }
            break;
        default:
            output = 'Unknown command.';
            break;
    }

    res.send({ output });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
