import * as dotenv from "dotenv";
import express from "express";
import { Collection, Db, FindCursor, MongoClient, ObjectId } from "mongodb";
import swaggerUi from "swagger-ui-express";

dotenv.config();
const version: string | undefined = process.env.npm_package_version;
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

// add headers before the routes are defined
app.use(express.json(), function (_req, res, next) {
  // website you wish to allow to connect
  const accessControlAllowOrigin: string = process.env
    .REQUEST_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN
    ? process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN
    : "*";
  res.setHeader("Access-Control-Allow-Origin", accessControlAllowOrigin);

  // request methods you wish to allow
  const accessControlAllowMethods: string = process.env
    .REQUEST_HEADER_ACCESS_CONTROL_ALLOW_METHODS
    ? process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_METHODS
    : "GET, POST, OPTIONS, PUT, PATCH, DELETE";
  res.setHeader("Access-Control-Allow-Methods", accessControlAllowMethods);

  // request headers you wish to allow
  const accessControlAllowHeaders: string = process.env
    .REQUEST_HEADER_ACCESS_CONTROL_ALLOW_HEADERS
    ? process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_HEADERS
    : "X-Requested-With,content-type";
  res.setHeader("Access-Control-Allow-Headers", accessControlAllowHeaders);

  // force include cookies in the requests, e.g. in case you use sessions
  const accessControlAllowCredentials: string = process.env
    .REQUEST_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS
    ? process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS
    : "true";
  res.setHeader(
    "Access-Control-Allow-Credentials",
    accessControlAllowCredentials
  );

  // pass to next layer of middleware
  next();
});

const openApiDocPath: any = {};

function createEndpoints() {
  console.log("create endpoints");

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

        openApiDocPath[path] = {};

        //get
        openApiDocPath[path]["get"] = {
          description: `get ${collectionName} objects by query`,
          tags: [`${collectionName}`],
          responses: {
            200: {
              description: `a list of ${collectionName}`,
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                    },
                  },
                },
              },
            },
          },
          parameters: [
            {
              name: "page",
              in: "query",
              description: `search page index`,
              schema: {
                default: 0,
                type: "string",
              },
            },
            {
              name: "limit",
              in: "query",
              description: `limit search result`,
              schema: {
                default: 10,
                type: "string",
              },
            },
          ],
          operationId: "find${collectionName}",
        };
        app.get(path, async (req, res) => {
          console.log(
            "get items, url: %s, collection: %s",
            req.url,
            collectionName
          );

          //query - start
          var query: any = {};
          for (let key of Object.keys(req.query)) {
            let mealName = req.query[key];
            if (key != "limit" && key != "page") {
              console.log(mealName);
              query[key] = new RegExp(".*" + mealName + ".*");
            }
          }
          //query - end

          const cursor: FindCursor = collection.find(query);

          // pagination - start
          let limit: number | null =
            req.query.limit && typeof req.query.limit == "string"
              ? parseInt(req.query.limit)
              : null;
          let page: number | null =
            req.query.page && typeof req.query.page == "string"
              ? parseInt(req.query.page)
              : null;

          if (limit != null && page != null) {
            const startIndex = Number(page) * Number(limit);
            cursor.skip(startIndex).limit(limit);
          } else if (limit) {
            cursor.limit(limit);
          }
          // pagination - end

          const retval = await cursor.toArray();
          res.status(200).send(retval);
        });

        //post
        openApiDocPath[path]["post"] = {
          description: `one or more elements of type ${collectionName} can be saved with this endpoint. f.e. insert one object: {}, insert multiple: [{},{},{},...] .`,
          tags: [`${collectionName}`],
          operationId: "add",
          responses: {
            201: {
              description: `a list of ${collectionName}`,
              content: {
                "application/text": {
                  schema: {
                    type: "string",
                  },
                },
              },
            },
          },
          requestBody: {
            description: `object of ${collectionName} as json`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: { type: "string", format: "uuid", default: null },
                  },
                },
              },
            },
          },
        };
        app.post(path, async (req, res) => {
          console.log(
            "insert item(s) for collection %s, json: %s",
            path,
            req.body
          );

          const value = req.body;
          let result: any =
            value instanceof Array
              ? await collection.insertMany(value)
              : await collection.insertOne(value);
          result
            ? res.status(201).send(`successfully.`)
            : res.status(500).send(`failed to create object(s): ${path}.`);
        });

        const pathWithId = path.concat("/{id}");
        openApiDocPath[pathWithId] = {};

        //put
        openApiDocPath[pathWithId]["put"] = {
          description: `update ${collectionName} by id`,
          tags: [`${collectionName}`],
          operationId: "updateById",
          responses: {
            200: {
              description: `a list of ${collectionName}`,
              content: {
                "application/text": {
                  schema: {
                    type: "string",
                  },
                },
              },
            },
          },
          requestBody: {
            description: `object of ${collectionName} as json`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {},
                },
              },
            },
          },
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
        openApiDocPath[pathWithId]["delete"] = {
          description: `remove ${collectionName} by id`,
          tags: [`${collectionName}`],
          responses: {
            202: {
              description: `a list of ${collectionName}`,
              content: {
                "application/text": {
                  schema: {
                    type: "string",
                  },
                },
              },
            },
          },
          operationId: "removeById",
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

      const CUSTOM_CSS: string = process.env.CUSTOM_CSS
        ? process.env.CUSTOM_CSS
        : "";

      const CUSTOM_CSS_URL: string = process.env.CUSTOM_CSS_URL
        ? process.env.CUSTOM_CSS_URL
        : "";

      app.use(
        "/swagger-ui",
        swaggerUi.serve,
        swaggerUi.setup(undefined, {
          explorer: false,

          customCss: `${CUSTOM_CSS}`,
          customCssUrl: `${CUSTOM_CSS_URL}`,
          customSiteTitle: `${databaseName} api`,
          swaggerOptions: {
            docExpansion: "none",
            url: "/api-docs/v3/openapi.json",
            version: `${version}`,
            title: `project ${databaseName}`,
            description: `api information for project ${databaseName}`,
            contact: {
              name: "Dominik Bruhn",
            },
          },
        })
      );

      app.get("/api-docs/v3/openapi.json", async (req, res) => {
        console.log("get items, url: %s, collection: %s", req.url);

        const requestURL = new URL(req.url, `http://${req.headers.host}`);

        //https://swagger.io/specification/#infoObject
        const openApiDoc = {
          openapi: "3.0.3",
          servers: [
            {
              url: requestURL.protocol.concat("//").concat(requestURL.host),
              description: "Server",
            },
          ],
          info: {
            version: `${version}`,
            title: `project ${databaseName}`,
            description: `api information for project ${databaseName}`,
            contact: {
              name: "Dominik Bruhn",
            },
          },
          paths: openApiDocPath,
        };

        res.status(200).send(openApiDoc);
      });

      app.listen(port, () => {
        console.log(`server started on port ${port}`);
      });
    })
    .catch((error: string) => {
      console.error(error);
      throw error;
    });
}

createEndpoints();
