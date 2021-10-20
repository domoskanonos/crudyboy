import { MongoClient, Db } from "mongodb";
import * as dotenv from "dotenv";

//dotenv.config();

export class CrudyboyRepository {
  private client: MongoClient | null | undefined;
  private db: Db | null | undefined;

  constructor() {
    if (process.env.DB_CONN_STRING) {
      this.client = new MongoClient(process.env.DB_CONN_STRING);
      this.connectToDatabase().then(() => {
        console.log(`successfully connected to database: ${db.databaseName}`);
        this.db = this.client ? this.client.db(process.env.DB_NAME) : null;
      });
    } else {
      console.error("env: db connection string not set.");
    }
  }

  async getCollections() {
    return this.db ? await this.db.collections() : null;
  }

  async connectToDatabase() {
    console.log("connect to db...");
    return this.client != null ? await this.client.connect() : null;
  }
}
