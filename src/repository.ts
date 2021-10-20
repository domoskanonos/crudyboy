import * as dotenv from "dotenv";
import { MongoClient, Db } from "mongodb";

dotenv.config();

export class CrudyboyRepository {
  private client: MongoClient | null | undefined;
  private db: Db | null | undefined;

  constructor() {
    if (process.env.DB_CONN_STRING) {
      this.client = new MongoClient(process.env.DB_CONN_STRING);
      this.connectToDatabase().then(async () => {
        this.db = this.client ? await this.client.db(process.env.DB_NAME) : null;
        if (this.db) {
          console.log(
            `successfully connected to database: ${this.db.databaseName}`
          );
        }
      });
    } else {
      console.error("env: db connection string not set.");
    }
  }

  async getCollections() {
    return this.db ? await this.db.collections() : null;
  }

  private async connectToDatabase() {
    console.log("connect to db...");
    return this.client != null ? await this.client.connect() : null;
  }
}
