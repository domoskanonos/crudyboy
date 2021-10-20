import * as dotenv from "dotenv";
import express from "express";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";

export class CrudyboyServer {
  private app;

  constructor(
    private host: string,
    private port: number,
    private databaseConnectionString: string,
    private databaseName: string
  ) {
    this.app = express();
    this.app.use(express.json());
  }

  public createEndpoints(): void {
    const client: MongoClient = new MongoClient(this.databaseConnectionString);

    client
      .connect()
      .then(async () => {
        console.log("client connected");

        const db: Db = client.db(this.databaseName);

        const collections = await db.collections();
        collections.forEach((collection: Collection) => {
          const collectionName: string = collection.collectionName;
          console.log("collection name: %s", collectionName);
          const path = "/".concat(collectionName);

          //get
          this.app.get(path, async (req, res) => {
            console.log(
              "get items, url: %s, collection: %s",
              req.url,
              collectionName
            );
            const list = await collection.find({}).toArray();
            res.status(200).send(list);
          });

          //post
          this.app.post(path, async (req, res) => {
            console.log(
              "insert item for collection %s, json: %s",
              path,
              req.body
            );
            const result: any = await collection.insertOne(req.body);
            result
              ? res
                  .status(201)
                  .send(
                    `successfully created a new ${collectionName} with id %s${result.insertedId}`
                  )
              : res.status(500).send(`failed to create a new ${path}.`);
          });

          //put
          this.app.put(path.concat("/:id"), async (req, res) => {
            const id = req?.params?.id;
            const item = req.body;
            console.log(
              "update item for collection %s, id=%s, json: %s",
              collectionName,
              id,
              item
            );
            const query = { _id: new ObjectId(id) };
            const result = await collection.updateOne(query, { $set: item });
            result
              ? res
                  .status(200)
                  .send(`successfully updated ${path} with id ${id}`)
              : res
                  .status(304)
                  .send(`${collectionName} with id: ${id} not updated`);
          });

          this.app.delete(path.concat("/:id"), async (req, res) => {
            const id = req?.params?.id;

            const query = { _id: new ObjectId(id) };
            const result = await collection.deleteOne(query);

            if (result && result.deletedCount) {
              res
                .status(202)
                .send(`successfully removed ${collectionName} with id ${id}`);
            } else if (!result) {
              res
                .status(400)
                .send(`failed to remove ${collectionName} with id ${id}`);
            } else if (!result.deletedCount) {
              res
                .status(404)
                .send(`${collectionName} with id ${id} does not exist`);
            }
          });
        });

        this.app.listen(this.port, this.host, () => {
          console.log(`server started at ${this.host}:${this.port}`);
        });
      })
      .catch((error: string) => {
        console.error(error);
        throw error;
      });
  }
}

dotenv.config();
const host: string = process.env.HOST ? process.env.HOST : "localhost";
const port: number = process.env.PORT ? Number(process.env.PORT) : 8080;
const databaseConnectionString: string = process.env.CONNECTION_STRING
  ? process.env.CONNECTION_STRING
  : "";
const databaseName: string = process.env.DATABASE_NAME
  ? process.env.DATABASE_NAME
  : "";

const server: CrudyboyServer = new CrudyboyServer(
  host,
  port,
  databaseConnectionString,
  databaseName
);
server.createEndpoints();
