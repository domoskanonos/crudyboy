import { Client } from "pg";
import { DbClient, Property } from "./db-client";
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
    this.connect().then(() => {
      console.log("db connected.");
    });
  }

  async collections(): Promise<string[]> {
    const result = await this.getClient().query(`SELECT table_name
                                                     FROM information_schema.tables
                                                     WHERE table_schema = 'public'
                                                     ORDER BY table_name;`);
    const tableNames: string[] = [];
    result.rows.forEach((row) => {
      tableNames.push(row.table_name);
    });
    return tableNames;
  }

  async findById(collection: string, id: any): Promise<any> {
    const sql = `SELECT *
                     FROM ${collection}
                     WHERE id = ${id}`;
    console.log(`findById sql statement: ${sql}`);
    let queryResult = await this.getClient().query(sql);
    return queryResult.rows.length > 0 ? queryResult.rows[0] : null;
  }

  async search(collection: string, req: Request): Promise<any[]> {
    //query - start
    const searchParams = Object.keys(req.query);
    let whereQuery: string = "";
    if (searchParams.length > 0) {
      for (let key of searchParams) {
        let mealName = req.query[key];
        if (key != "limit" && key != "page" && key != "sort" && mealName) {
          if (whereQuery.length == 0) {
            whereQuery = " WHERE ";
          } else {
            whereQuery = whereQuery.concat("AND ");
          }
          whereQuery = whereQuery
            .concat(key)
            .concat(" LIKE '%")
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

        //TODO: sort

    let offsetQuery: string = "";
    if (limit != null && page != null) {
      offsetQuery = " OFFSET ".concat(String(Number(page) * Number(limit)));
    }

    const sql = `SELECT *
                     FROM ${collection} ${whereQuery}${limitQuery}${offsetQuery}`;
    console.log(sql);
    return (await this.getClient().query(sql)).rows;
  }

  async insertOne(collection: string, item: any): Promise<any> {
    let keys = Object.keys(item).filter((key: string) => {
      return key != "id";
    });
    let values: any[] = [];
    let fields: string = "";
    let valueParams: string = "";
    for (let i = 0; i < keys.length; i++) {
      const key: string = keys[i];

      if (fields.length > 0) {
        fields = fields.concat(",");
      }
      if (valueParams.length > 0) {
        valueParams = valueParams.concat(",");
      }
      fields = fields.concat(key);
      valueParams = valueParams.concat("$").concat(String(i + 1));
      values.push(item[key]);
    }
    let sql = `insert into ${collection} (${fields})
                   values (${valueParams})
                   RETURNING id;`;
    console.log(`insert statement: ${sql}`);

    const res: any = await this.getClient().query(sql, values);
    console.log(res);
    if (res.rowCount == 1) {
      item.id = res.rows[0].id;
      return item;
    } else {
      return null;
    }
  }

  async updateOne(collection: string, item: any): Promise<any> {
    let keys = Object.keys(item);
    let values: any[] = [];
    let updateFields: string = "";
    let updateWhereParam: string = "";
    for (let i = 0; i < keys.length; i++) {
      const key: string = keys[i];
      if (updateFields.length > 0) {
        updateFields = updateFields.concat(",");
      }
      if (key != "id")
        updateFields = updateFields
          .concat(key)
          .concat("=$")
          .concat(String(i + 1));
      else {
        updateWhereParam = "$".concat(String(i + 1));
      }
      values.push(item[key]);
    }
    let sql = `UPDATE ${collection}
                   SET ${updateFields}
                   WHERE id = ${updateWhereParam};`;

    console.log(`update statement: ${sql}`);

    const res: any = await this.getClient().query(sql, values);
    if (res.rowCount == 1) {
      return item;
    } else {
      return null;
    }
  }

  async insertMany(collection: string, items: any[]): Promise<any[]> {
    const insertedItems = [];
    for (let i = 0; i < items.length; i++) {
      const value = items[i];
      let insertedItem = await this.insertOne(collection, value);
      if (insertedItem) insertedItems.push(insertedItem);
    }
    return insertedItems;
  }

  async updateMany(collection: string, items: any[]): Promise<any[]> {
    const updatedItems = [];
    for (let i = 0; i < items.length; i++) {
      const value = items[i];
      let updatedItem = await this.updateOne(collection, value);
      if (updatedItem) updatedItems.push(updatedItem);
    }
    return updatedItems;
  }

  async delete(collectionName: string, id: string): Promise<boolean> {
    const result = await this.getClient().query(
      `DELETE
             FROM ${collectionName}
             WHERE id = $1;`,
      [id]
    );
    return result.rowCount == 1;
  }

  async getProperties(collection: string): Promise<Property[]> {
    const sql = `SELECT column_name as name, udt_name as type
                     FROM INFORMATION_SCHEMA.COLUMNS
                     WHERE TABLE_NAME = '${collection}'`;
    const result = await this.getClient().query(sql);
    const properties: any[] = [];
    result.rows.forEach((row) => {
      let property = <Property>{
        name: row.name,
        type:
          "varchar".indexOf(row.type) > -1
            ? "string"
            : "bool".indexOf(row.type) > -1
            ? "boolean"
            : "date".indexOf(row.type) > -1
            ? "date timestamp"
            : "int4 integer".indexOf(row.type) > -1
            ? "number"
            : null,
        defaultValue:
          "varchar".indexOf(row.type) > -1
            ? "Lorem Ipsum"
            : "bool".indexOf(row.type) > -1
            ? true
            : "date".indexOf(row.type) > -1
            ? new Date()
            : "int4 integer".indexOf(row.type) > -1
            ? 0
            : null,
      };
      properties.push(property);
    });
    return Promise.resolve(properties);
  }
}
