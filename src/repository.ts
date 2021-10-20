import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: { games?: mongoDB.Collection } = {};

export async function connectToDatabase() {
  console.log("connect to db.");
  dotenv.config();

  if (process.env.DB_CONN_STRING) {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(
      process.env.DB_CONN_STRING
    );

    await client.connect();


    console.log("client connected.");

    const db: mongoDB.Db = client.db(process.env.DB_NAME);
    const xxx = db.listCollections();


      
       
       const collections = await db.collections();
       collections.forEach (c=>console.log(c.collectionName));




   


    console.log(`Successfully connected to database: ${db.databaseName}`);

    //const gamesCollection: mongoDB.Collection = db.collection(process.env.GAMES_COLLECTION_NAME);

    //collections.games = gamesCollection;

    //console.log(`Successfully connected to database: ${db.databaseName} and collection: ${gamesCollection.collectionName}`);
  }
}

connectToDatabase();
