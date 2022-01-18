import {Client} from "pg";
import {DbClient, Property} from "./db-client";
import {Request} from "express";

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
        result.rows.forEach((row) => {
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

        const sql = `SELECT *
                     FROM ${collection} ${whereQuery}${limitQuery}${offsetQuery}`;
        console.log(sql);
        const result = await this.getClient().query(sql);
        const retval: any[] = [];
        result.rows.forEach((row) => {
            retval.push(row);
        });
        return retval;
    }

    async insertOne(collection: string, item: any): Promise<void> {
        let keys = Object.keys(item);
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
            fields = fields.concat(key)
            valueParams = valueParams.concat("$").concat(String(i + 1))
            values.push(item[key]);
        }
        let sql = `insert into ${collection} (${fields})
                   values (${valueParams});`;
        console.log(`insert statement: ${sql}`)
        const res: any = await this.getClient().query(sql, values);
    }

    async insertMany(collection: string, values: any[]) {
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            this.insertOne(collection, value);
        }
    }

    async delete(collectionName: string, id: string): Promise<boolean> {
        const result = await this.getClient().query(
            `DELETE
             FROM ${collectionName}
             WHERE id = $1;`,
            [id]
        );
        console.log(result);
        return true;
    }

    async update(
        collectionName: string,
        item: any
    ): Promise<boolean> {
        this.client?.query;
        const result = await this.getClient().query(
            `UPDATE ${collectionName}
             SET data = $1::json
             WHERE id = $2;`,
            [item, item.id]
        );
        return true;
    }

    async getProperties(collection: string): Promise<Property[]> {
        const sql = `SELECT column_name as name, column_default as defaultValue, udt_name as type
                     FROM INFORMATION_SCHEMA.COLUMNS
                     WHERE TABLE_NAME = '${collection}'`;
        const result = await this.getClient().query(sql);
        const retval: any[] = [];
        result.rows.forEach((row) => {
            retval.push(<Property>{
                name: row.name,
                type: row.type == "varchar" ? "string" : row.type == "bool" ? "boolean" : row.type == "Date" ? "Date" : "number",
                defaultValue: row.defaultValue
            })
            ;
        });
        return Promise.resolve(retval);
    }
}
