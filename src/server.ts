import express, { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { DbClient, Property } from "./db/db-client";

export class CrudyboyServer {
  private app: Express;

  constructor(
    private port: Number,
    private client: DbClient,
    private customCSS: string,
    private customCSSUrl: string,
    private accessControlAllowOrigin: string,
    private accessControlAllowMethods: string,
    private accessControlAllowHeaders: string,
    private accessControlAllowCredentials: string,
    private version: string
  ) {
    this.app = express();
  }

  async init(): Promise<void> {
    this.app.use(express.json());

    // add headers before the routes are defined
    this.app.use(express.json(), (_req, res, next) => {
      // website you wish to allow to connect
      res.setHeader(
        "Access-Control-Allow-Origin",
        this.accessControlAllowOrigin
      );

      // request methods you wish to allow
      res.setHeader(
        "Access-Control-Allow-Methods",
        this.accessControlAllowMethods
      );

      // request headers you wish to allow
      res.setHeader(
        "Access-Control-Allow-Headers",
        this.accessControlAllowHeaders
      );

      // force include cookies in the requests, e.g. in case you use sessions
      res.setHeader(
        "Access-Control-Allow-Credentials",
        this.accessControlAllowCredentials
      );

      // pass to next layer of middleware
      next();
    });

    console.log("client connected");

    const collections: string[] = await this.client.collections();
    collections.forEach((collectionName: string) => {
      console.log("collection name: %s", collectionName);

      const path = "/".concat(collectionName);
      console.log("create endpoint: %s", path);

      this.app.get(path, async (req: Request, res: Response) => {
        console.log(
          "get items, url: %s, collection: %s",
          req.url,
          collectionName
        );

        try {
          const items: any[] | null = await this.client.search(
            collectionName,
            req
          );
          res.status(200).send(items);
        } catch (error) {
          console.error(error);
          res.status(500).send(error);
        }
      });

      this.app.get(path.concat("/:id"), async (req: Request, res: Response) => {
        const id = req?.params?.id;
        console.log(
          "get item by id: %s, url: %s, collection: %s",
          id,
          req.url,
          collectionName
        );

        try {
          const item: any = await this.client.findById(collectionName, id);
          if (item == null) res.status(204).send();
          else res.status(200).send(item);
        } catch (error) {
          console.error(error);
          res.status(500).send(error);
        }
      });

      this.app.post(path, async (req: Request, res: Response) => {
        console.log(
          "insert item(s) for collection %s, json: %s",
          path,
          req.body
        );

        try {
          const value = req.body;
          let result: any =
            value instanceof Array
              ? await this.client.insertMany(collectionName, value)
              : await this.client.insertOne(collectionName, value);
          res.status(201).send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send(error);
        }
      });

      this.app.put(path, async (req: Request, res: Response) => {
        const value = req.body;
        console.log("update item(s) for collection %s, json: %s", path, value);
        try {
          let result: any =
            value instanceof Array
              ? await this.client.updateMany(collectionName, value)
              : await this.client.updateOne(collectionName, value);
          res.status(201).send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send(error);
        }
      });

      this.app.delete(
        path.concat("/:id"),
        async (req: Request, res: Response) => {
          const id = req?.params?.id;
          try {
            const result = await this.client.delete(collectionName, id);
            res.status(200).send(result);
          } catch (error) {
            console.error(error);
            res.status(500).send(error);
          }
        }
      );
    });

    await this.generateOpenApiDoc(collections);

    this.app.listen(this.port, () => {
      console.log(`server started on port ${this.port}`);
    });
  }

  private async generateOpenApiDoc(collections: string[]) {
    const openApiDocPath: any = {};

    await this.generateOpenApiDocEndpoint(openApiDocPath, collections);

    let databaseName = this.client.config.database;
    this.app.get(
      "/api-docs/v3/openapi.json",
      async (req: Request, res: Response) => {
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
            version: this.version,
            title: `project ${databaseName}`,
            description: `api information for project ${databaseName}`,
            contact: {
              name: "Dominik Bruhn",
            },
          },
          paths: openApiDocPath,
        };

        res.status(200).send(openApiDoc);
      }
    );

    this.app.use(
      "/swagger-ui",
      swaggerUi.serve,
      swaggerUi.setup(undefined, {
        explorer: false,
        customCss: `${this.customCSS}`,
        customCssUrl: `${this.customCSSUrl}`,
        customSiteTitle: `${databaseName} api`,
        swaggerOptions: {
          docExpansion: "none",
          url: "/api-docs/v3/openapi.json",
          version: `${this.version}`,
          title: `project ${databaseName}`,
          description: `api information for project ${databaseName}`,
          contact: {
            name: "Dominik Bruhn",
          },
        },
      })
    );
  }

  private async generateOpenApiDocEndpoint(
    openApiDocPath: any,
    collections: string[]
  ): Promise<void> {
    for (let i = 0; i < collections.length; i++) {
      const collectionName: string = collections[i];
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
                    properties: this.toOpenApiProperties(
                      await this.client.getProperties(collectionName)
                    ),
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
          {
            name: "sort",
            in: "query",
            description: `sort search result`,
            schema: {
              default: "id:asc",
              type: "string",
            },
          },
        ],
        operationId: "find${collectionName}",
      };

      //post
      openApiDocPath[path]["post"] = {
        description: `create one or more elements of type ${collectionName} can be saved with this endpoint. f.e. insert one object: {}, insert multiple: [{},{},{},...] .`,
        tags: [`${collectionName}`],
        operationId: "add",
        responses: {
          201: {
            description: `a list of ${collectionName}`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
          500: {
            description: `Error: Internal Server Error`,
          },
        },
        requestBody: {
          description: `object of ${collectionName} as json`,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: this.toOpenApiProperties(
                  await this.client.getProperties(collectionName)
                ),
              },
            },
          },
        },
      };

      //put
      openApiDocPath[path]["put"] = {
        description: `update one or more elements of type ${collectionName} can be saved with this endpoint. f.e. insert one object: {}, insert multiple: [{},{},{},...] .`,
        tags: [`${collectionName}`],
        operationId: "updateById",
        responses: {
          200: {
            description: `returned updated ${collectionName} item`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
          500: {
            description: `Error: Internal Server Error`,
          },
        },
        requestBody: {
          description: `object of ${collectionName} item as json`,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: this.toOpenApiProperties(
                  await this.client.getProperties(collectionName)
                ),
              },
            },
          },
        },
      };

      const pathWithId = path.concat("/{id}");
      openApiDocPath[pathWithId] = {};

      //findById
      openApiDocPath[pathWithId]["get"] = {
        description: `get ${collectionName} item by id`,
        tags: [`${collectionName}`],
        responses: {
          200: {
            description: `${collectionName} item`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: this.toOpenApiProperties(
                    await this.client.getProperties(collectionName)
                  ),
                },
              },
            },
          },
          204: {
            description: `${collectionName} item not found`,
          },
          500: {
            description: `Error: Internal Server Error`,
          },
        },
        parameters: [
          {
            name: "id",
            in: "path",
            description: `${collectionName} item id`,
            schema: {
              default: 0,
              type: "string",
            },
          },
        ],
        operationId: "find${collectionName}",
      };

      //delete
      openApiDocPath[pathWithId]["delete"] = {
        description: `remove ${collectionName} by id`,
        tags: [`${collectionName}`],
        responses: {
          200: {
            description: `return true if ${collectionName} item successfully deleted, otherwise false.`,
            content: {
              "application/text": {
                schema: {
                  type: "boolean",
                },
              },
            },
          },
          500: {
            description: `Error: Internal Server Error`,
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
    }
  }

  private toOpenApiProperties(properties: Property[]): any[] {
    const openApiProperties: any = {};
    properties.forEach((property: Property) => {
      openApiProperties[property.name] = {
        type: property.type,
        example: property.defaultValue,
      };
    });
    return openApiProperties;
  }
}
