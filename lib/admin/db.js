import { MongoClient } from "mongodb";
let connection;
export async function database() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB)
    throw new Error("Database configuration is missing");
  if (!connection) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    connection = client.connect().catch((error) => {
      connection = undefined;
      throw error;
    });
  }
  return (await connection).db(process.env.MONGODB_DB);
}
