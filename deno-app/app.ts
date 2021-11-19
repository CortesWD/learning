const text = 'hey';

const encoder = new TextEncoder();

const data = encoder.encode(text);

//Deno needs correct permissions to execute tasks
// to write should be --allow-write
// built-in features: https://doc.deno.land/builtin/stable
// permissions https://deno.land/manual@v1.16.2/getting_started/permissions

Deno.writeFile('./message.txt', data)
  .then(() => {
    console.warn('file created')
  });