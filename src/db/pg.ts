import { Client } from "pg";
import { DbClient } from "./db-client";
import { Request } from "express";

export class PostgresqlClient extends DbClient {
  private client: Client | undefined;

  private getClient(): Client {
    if (this.client == undefined) throw new Error("init client");
    return this.client;
  }

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

  async search(collection: string, req: Request): Promise<any[]> {
    //query - start
    const searchParams = Object.keys(req.query);
    let whereQuery: string = "";
    if (searchParams.length > 0) {
      for (let key of searchParams) {
        let mealName = req.query[key];
        if (key != "limit" && key != "page" && mealName) {
          if (whereQuery.length == 0) {
            whereQuery = " WHERE ";
          } else {
            whereQuery = whereQuery.concat("AND ");
          }
          whereQuery = whereQuery
            .concat("data::json->>'")
            .concat(key)
            .concat("' LIKE '%")
            .concat(String(mealName))
            .concat("%'");
        }
      }
    }
    //query - end

    // pagination - start
    let limit: number | null =
      req.query.limit && typeof req.query.limit == "string"
        ? parseInt(req.query.limit)
        : null;
    let limitQuery = limit ? " LIMIT ".concat(String(limit)) : "";

    let page: number | null =
      req.query.page && typeof req.query.page == "string"
        ? parseInt(req.query.page)
        : null;

    let offsetQuery: string = "";
    if (limit != null && page != null) {
      offsetQuery = " OFFSET ".concat(String(Number(page) * Number(limit)));
    }

    const sql = `SELECT data FROM ${collection}${whereQuery}${limitQuery}${offsetQuery}`;
    console.log(sql);
    const result = await this.getClient().query(sql);
    const retval: any[] = [];
    result.rows.forEach((row) => {
      retval.push(row);
    });
    return retval;
  }

  async insertOne(collection: string, value: any): Promise<void> {
    const res: any = await this.getClient().query(
      `insert into ${collection} (data) values ($1::json);`,
      [value]
    );
  }

  async insertMany(collection: string, values: any[]) {
    console.log(values);
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      this.insertOne(collection, value);
    }
  }

  async delete(collectionName: string, _id: string): Promise<boolean> {
    this.client?.query;
    const result = await this.getClient().query(
      `DELETE FROM ${collectionName} WHERE _id=$1;`,
      [_id]
    );
    console.log(result);
    return true;
  }

  async update(
    collectionName: string,
    _id: string,
    item: any
  ): Promise<boolean> {
    this.client?.query;
    const result = await this.getClient().query(
      `UPDATE ${collectionName} SET data = $1::json WHERE _id = $2;`,
      [item, _id]
    );
    console.log(result);
    return true;
  }
}
