import * as dotenv from "dotenv";
import express from "express";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

dotenv.config();
const host: string = process.env.HOST ? process.env.HOST : "localhost";
const port: number = process.env.PORT ? Number(process.env.PORT) : 8080;
const databaseConnectionString: string = process.env.CONNECTION_STRING
  ? process.env.CONNECTION_STRING
  : "";
const databaseName: string = process.env.DATABASE_NAME
  ? process.env.DATABASE_NAME
  : "";

const client: MongoClient = new MongoClient(databaseConnectionString);

const app = express();
app.use(express.json());

function createEndpoints() {
  console.log("create endpoints");

  //https://swagger.io/specification/#infoObject
  const swaggerOptions = {
    swaggerDefinition: {
      info: {
        version: "1.0.0",
        title: `Project ${databaseName}`,
        description: `API Information for project ${databaseName}`,
        contact: {
          name: "Dominik Bruhn",
        },
        servers: [`http://${host}:${port}`],
      },
      paths: <any>{},
    },
    apis: [],
  };

  client
    .connect()
    .then(async () => {
      console.log("client connected");

      const db: Db = client.db(databaseName);

      const collections = await db.collections();
      collections.forEach((collection: Collection) => {
        const collectionName: string = collection.collectionName;
        console.log("collection name: %s", collectionName);
        const path = "/".concat(collectionName);

        console.log("create endpoint: %s", path);

        swaggerOptions.swaggerDefinition.paths[path] = {};

        //get
        swaggerOptions.swaggerDefinition.paths[path]["get"] = {
          description: `return all ${collectionName}'s`,
          operationId: "findAll${collectionName}",
          produces: ["application/json"],
        };
        app.get(path, async (req, res) => {
          console.log(
            "get items, url: %s, collection: %s",
            req.url,
            collectionName
          );
          const list = await collection.find({}).toArray();
          res.status(200).send(list);
        });

        //post
        swaggerOptions.swaggerDefinition.paths[path]["post"] = {
          description: `add ${collectionName}`,
          operationId: "add",
          produces: ["application/json"],
        };
        app.post(path, async (req, res) => {
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

        const pathWithId = path.concat("/{id}");
        swaggerOptions.swaggerDefinition.paths[pathWithId] = {};

        //put
        swaggerOptions.swaggerDefinition.paths[pathWithId]["put"] = {
          description: `update ${collectionName} by id`,
          operationId: "updateById",
          produces: ["application/json"],
        };
        app.put(path.concat("/:id"), async (req, res) => {
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
            ? res.status(200).send(`successfully updated ${path} with id ${id}`)
            : res
                .status(304)
                .send(`${collectionName} with id: ${id} not updated`);
        });

        //delete
        swaggerOptions.swaggerDefinition.paths[pathWithId]["delete"] = {
          description: `remove ${collectionName} by id`,
          operationId: "removeById",
          produces: ["application/json"],
          parameters: [
            {
              name: "id",
              in: "path",
              description: `id of ${collectionName} to delete`,
              required: true,
              schema: {
                type: "string",
              },
              style: "simple",
            },
          ],
        };
        app.delete(path.concat("/:id"), async (req, res) => {
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

      const swaggerDocs = swaggerJsDoc(swaggerOptions);
      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

      app.listen(port, () => {
        console.log(`server started at ${host}:${port}`);
      });
    })
    .catch((error: string) => {
      console.error(error);
      throw error;
    });
}

createEndpoints();
