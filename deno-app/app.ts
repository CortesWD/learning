import { Application } from "https://deno.land/x/oak/mod.ts";

import todosRouter from "./routes/todos.ts";

const app = new Application();

//Use async/await if we create middlewares with OAK that are async
// so it will execute in the expected order
app.use(async (ctx, next) => {
  console.log('MW');
  await next();
})

app.use(todosRouter.routes());
app.use(todosRouter.allowedMethods());

await app.listen({ port: 3000 });