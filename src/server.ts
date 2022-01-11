import express, {Express, Request, Response} from "express";
import {Collection, Db, FindCursor, MongoClient, ObjectId} from "mongodb";
import swaggerUi from "swagger-ui-express";

export class CrudyboyServer {
    private client: MongoClient;
    private app: Express;

    constructor(
        private port: Number,
        private connectionString: string,
        private databaseName: string,
        private customCSS: string,
        private customCSSUrl: string,
        private accessControlAllowOrigin: string,
        private accessControlAllowMethods: string,
        private accessControlAllowHeaders: string,
        private accessControlAllowCredentials: string,
        private version: string
    ) {
        this.client = new MongoClient(connectionString);
        this.app = express();
    }

    public init(): void {
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

        this.client
            .connect()
            .then(async () => {
                console.log("client connected");


                const db: Db = this.client.db(this.databaseName);

                const collections = await db.collections();
                collections.forEach((collection: Collection) => {
                    const collectionName: string = collection.collectionName;
                    console.log("collection name: %s", collectionName);

                    this.generateOpenApiDocEndpoint(collectionName);

                    const path = "/".concat(collectionName);
                    console.log("create endpoint: %s", path);


                    this.app.get(path, async (req: Request, res: Response) => {
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


                    this.app.post(path, async (req: Request, res: Response) => {
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


                    this.app.put(path.concat("/:id"), async (req: Request, res: Response) => {
                        const id = req?.params?.id;
                        const item = req.body;
                        console.log(
                            "update item for collection %s, id=%s, json: %s",
                            collectionName,
                            id,
                            item
                        );
                        const query = {_id: new ObjectId(id)};
                        const result = await collection.updateOne(query, {$set: item});
                        result
                            ? res
                                .status(200)
                                .send(`successfully updated ${path} with id ${id}`)
                            : res
                                .status(304)
                                .send(`${collectionName} with id: ${id} not updated`);
                    });

                    this.app.delete(path.concat("/:id"), async (req: Request, res: Response) => {
                        const id = req?.params?.id;

                        const query = {_id: new ObjectId(id)};
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

                this.app.use(
                    "/swagger-ui",
                    swaggerUi.serve,
                    swaggerUi.setup(undefined, {
                        explorer: false,

                        customCss: `${this.customCSS}`,
                        customCssUrl: `${this.customCSSUrl}`,
                        customSiteTitle: `${this.databaseName} api`,
                        swaggerOptions: {
                            docExpansion: "none",
                            url: "/api-docs/v3/openapi.json",
                            version: `${this.version}`,
                            title: `project ${this.databaseName}`,
                            description: `api information for project ${this.databaseName}`,
                            contact: {
                                name: "Dominik Bruhn",
                            },
                        },
                    })
                );

                this.app.listen(this.port, () => {
                    console.log(`server started on port ${this.port}`);
                });
            })
            .catch((error: string) => {
                console.error(error);
                throw error;
            });
    }

    private generateOpenApiDocEndpoint(collectionName: string) {

        const path = "/".concat(collectionName);
        console.log("create endpoint: %s", path);

        const openApiDocPath: any = {};
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
                                _id: {type: "string", format: "uuid", default: null},
                            },
                        },
                    },
                },
            },
        };
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

        this.app.get("/api-docs/v3/openapi.json", async (req: Request, res: Response) => {
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
                    title: `project ${this.databaseName}`,
                    description: `api information for project ${this.databaseName}`,
                    contact: {
                        name: "Dominik Bruhn",
                    },
                },
                paths: openApiDocPath,
            };

            res.status(200).send(openApiDoc);
        });

    }
}