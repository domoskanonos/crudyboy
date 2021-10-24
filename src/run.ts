import * as dotenv from "dotenv";
import { CrudyboyServer } from "./server";
dotenv.config();

const CRUDBOY_SERVER: CrudyboyServer = new CrudyboyServer(
  process.env.PORT ? Number(process.env.PORT) : 8080,
  process.env.CONNECTION_STRING ? process.env.CONNECTION_STRING : "",
  process.env.DATABASE_NAME ? process.env.DATABASE_NAME : "",
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
    : "true"
);

CRUDBOY_SERVER.init();
