import { Router } from "express";
import { Todo } from "../models/todo";

const router = Router();

type RequestBody = { text: string };
type RequestParams = { todoId: string };

type Request = {
  body: RequestBody
  params: RequestParams,
}

let todos: Todo[] = [];

router.get('/', (req, res, next) => {

  res.status(200).json({ todos });
});


router.post('/todo', (req: Request, res, next) => {
  const { body } = req;
  const newTodo: Todo = {
    id: new Date().toISOString(),
    ...body,
  };

  todos.push(newTodo);

  res.status(200).json({ message: 'created', todos });
});

router.put('/todo/:todoId', (req: Request, res, next) => {
  const {
    params: { todoId },
    body
  } = req;

  const todoIndex = todos.findIndex(item => item.id === todoId);

  if (todoIndex >= 0) {
    const todoFound: Todo = todos[todoIndex];
    todos[todoIndex] = {
      ...todoFound,
      ...body
    };

    return res.status(200).json({ message: 'updated' })
  }

  res.status(404).json({ message: 'item not found' });
});

router.delete('/todo/:todoId', (req: Request, res, next) => {
  const {
    params: { todoId },
  } = req;

  todos.filter(i => i.id !== todoId);

  res.status(200).json({ message: 'element deleted', todos });

});

export default router;