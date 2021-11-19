import { Router } from 'https://deno.land/x/oak/mod.ts';
import { getCollection } from '../helpers/db_client.ts';
import { Bson } from 'https://deno.land/x/mongo@v0.28.0/mod.ts';
const { ObjectId } = Bson;

const router = new Router();

interface Todo {
  id?: string;
  text: string;
}

type TodoDb = {
  _id: any,
  text: string
}

router.get('/todos', async (ctx) => {
  const todos = await getCollection('todos').find({}, { noCursorTimeout: false }).toArray();

  const transformTodos = todos.map((todo: TodoDb) => {
    return {
      id: todo._id.$oid,
      text: todo.text,
    }
  });

  ctx.response.body = { todos: transformTodos };
});

router.post('/todos', async (ctx) => {

  const data = await ctx.request.body();

  const { text } = await data.value;

  const newTodo: Todo = { text };

  const id = await getCollection('todos').insertOne(newTodo);

  newTodo.id = id.$oid;

  ctx.response.body = {
    message: 'created',
    todo: newTodo
  };
});

router.put('/todos/:todoId', async (ctx) => {
  const todoId = ctx.params.todoId!;
  const data = await ctx.request.body();
  const value = await data.value;

  await getCollection('todos')
    .updateOne({ _id: new ObjectId(todoId)}, {
      $set: { text: value.text }
  });


  ctx.response.body = {
    message: 'updated',
  };


});

router.delete('/todos/:todoId', async (ctx) => {
  const todoId = ctx.params.todoId!;

  await getCollection('todos')
    .deleteOne({ _id: new ObjectId(todoId), });

  ctx.response.body = {
    message: 'deleted',
  };

});

export default router;