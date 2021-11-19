import { Application } from "https://deno.land/x/oak/mod.ts";
import { connect } from './helpers/db_client.ts';

import todosRouter from "./routes/todos.ts";

connect();


const app = new Application();

app.use(async (ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  ctx.response.headers.set('Access-Control-Allow-Methods', '*');
  ctx.response.headers.set('Access-Control-Allow-Headers', '*');
  await next();
});



//Use async/await if we create middlewares with OAK that are async
// so it will execute in the expected order
app.use(async (ctx, next) => {
  console.log('MW');
  await next();
});


app.use(todosRouter.routes());
app.use(todosRouter.allowedMethods());

await app.listen({ port: 3000 });