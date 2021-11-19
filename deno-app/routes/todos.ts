import { Router } from 'https://deno.land/x/oak/mod.ts';

const router = new Router();

interface Todo {
  id: string;
  text: string;
}

let todos: Todo[] = [];

router.get('/todos', (ctx) => {
  ctx.response.body = { todos: todos };
});

router.post('/todos', async (ctx) => {

  const data = await ctx.request.body();

  const { text } = await data.value;

  const newTodo: Todo = {
    id: new Date().toISOString(),
    text,
  };

  todos.push(newTodo);

  ctx.response.body = {
    message: 'created',
    todo: newTodo
  };
});

router.put('/todos/:todoId', async (ctx) => { 
  const todoId = ctx.params.todoId;
  const data = await ctx.request.body();
  const value = await data.value;
  
  const todoIndex = todos.findIndex(item => item.id === todoId);

  if (todoIndex >= 0) {
    const todoFound: Todo = todos[todoIndex];
    todos[todoIndex] = {
      ...todoFound,
      ...value
    };

    ctx.response.body = {
      message: 'updated',
    };
  }

});

router.delete('/todos/:todoId', async (ctx) => {
  const todoId = ctx.params.todoId;

  todos.filter(i => i.id !== todoId);

  ctx.response.body = {
    message: 'deleted',
  };

});

export default router;