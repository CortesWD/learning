"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
let todos = [];
router.get('/', (req, res, next) => {
    res.status(200).json({ todos });
});
router.post('/todo', (req, res, next) => {
    const { body } = req;
    const newTodo = Object.assign({ id: new Date().toISOString() }, body);
    todos.push(newTodo);
    res.status(200).json({ message: 'created', todos });
});
router.put('/todo/:todoId', (req, res, next) => {
    const { params: { todoId }, body } = req;
    const todoIndex = todos.findIndex(item => item.id === todoId);
    console.log(todoId);
    console.log(todoIndex);
    if (todoIndex >= 0) {
        const todoFound = todos[todoIndex];
        todos[todoIndex] = Object.assign(Object.assign({}, todoFound), body);
        return res.status(200).json({ message: 'updated' });
    }
    res.status(404).json({ message: 'item not found' });
});
router.put('/todo/:todoId', (req, res, next) => {
    const { params: { todoId }, } = req;
    todos.filter(i => i.id !== todoId);
    res.status(200).json({ message: 'element deleted', todos });
});
exports.default = router;
