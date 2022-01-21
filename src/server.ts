import express, {Express, Request, Response} from "express";
import swaggerUi from "swagger-ui-express";
import {DbClient} from "./db/db-client";
import {OpenApiGenerator, OpenApiProperty} from "./openapi/open-api-gen";

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

        let propertiesByCollection: Map<string, any> = await this.client.getPropertiesByCollection();

        for (let collectionName of propertiesByCollection.keys()) {

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
        }

        await this.generateOpenApiDoc(propertiesByCollection);

        this.app.listen(this.port, () => {
            console.log(`server started on port ${this.port}`);
        });
    }

    private async generateOpenApiDoc(propertiesByCollection: Map<string, any>) {

        const openApiGenerator: OpenApiGenerator = new OpenApiGenerator();
        const openApiDocPath = openApiGenerator.generateOpenApiDocPath(propertiesByCollection);

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
}
