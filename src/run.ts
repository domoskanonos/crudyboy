import * as dotenv from "dotenv";
import {CrudyboyServer} from "./server";
import {PostgresqlClient} from "./db/postgresql";
import {DbClient, DBClientConfig} from "./db/db-client";

dotenv.config();

const dbClient: DbClient = new PostgresqlClient(<DBClientConfig>{
    host: process.env.DB_HOST ? process.env.DB_HOST : "",
    database: process.env.DB_NAME ? process.env.DB_NAME : "",
    user: process.env.DB_USER ? process.env.DB_USER : "",
    password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : "",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});


const CRUDBOY_SERVER: CrudyboyServer = new CrudyboyServer(
    process.env.PORT ? Number(process.env.PORT) : 8080,
    dbClient,
    process.env.CUSTOM_CSS ? process.env.CUSTOM_CSS : "",
    process.env.CUSTOM_CSS_URL ? process.env.CUSTOM_CSS_URL : "",
    process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN
        ? process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN
        : "*",
    process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_METHODS
        ? process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_METHODS
        : "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_HEADERS
        ? process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_HEADERS
        : "X-Requested-With,content-type",
    process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS
        ? process.env.REQUEST_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS
        : "true",
    process.env.npm_package_version
        ? process.env.npm_package_version
        : "not available"
);

CRUDBOY_SERVER.init().then(() => {
    console.log("server init successfully.")
});
