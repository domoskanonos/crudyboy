import { Client } from "pg";
import { DbClient } from "./db-client";

export class PostgresqlClient extends DbClient {
  private client: Client | undefined;

  private connect(): Promise<void> {
    return this.getClient().connect();
  }

  private close(): Promise<void> {
    return this.getClient().end();
  }

  protected initClient(): void {
    this.client = new Client(this.config);
    this.connect();
  }

  async collections(): Promise<string[]> {
    const result = await this.getClient().query(`SELECT table_name
                                                     FROM information_schema.tables
                                                     WHERE table_schema = 'public'
                                                     ORDER BY table_name;`);
    const retval: string[] = [];
    console.log(result.rows);
    result.rows.forEach((row) => {
      console.log(row);
      retval.push(row.table_name);
    });
    return retval;
  }

  private getClient(): Client {
    if (this.client == undefined) throw new Error("init client");
    return this.client;
  }

  async search(collection: string): Promise<any[]> {
    const result = await this.getClient().query(`SELECT * FROM ${collection}`);
    const retval: any[] = [];
    console.log(result.rows);
    result.rows.forEach((row) => {
      console.log(row);
      retval.push(row);
    });
    return retval;
  }
}
