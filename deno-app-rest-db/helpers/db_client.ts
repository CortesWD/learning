import { MongoClient, Database, Collection } from "https://deno.land/x/mongo@v0.28.0/mod.ts";


let db: Database;

export async function connect() {
  const client = new MongoClient();
  // Connecting to a Local Database
  await client.connect('mongodb+srv://criscor:<pass>@cluster0.g1of1.mongodb.net?authMechanism=SCRAM-SHA-1');
  db = await client.database('todos-app');
}

export function getCollection(collection: string): Collection<any> { 
  return db.collection(collection);
};