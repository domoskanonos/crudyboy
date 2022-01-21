import {Client} from "pg";
import {DbClient} from "./db-client";
import {Request} from "express";
import {PostgresqlOpenApiMapping} from "../mapping/postgresql-open-api-mapping";
import {OpenApiProperty} from "../openapi/open-api-gen";


export interface PostgresqlProperty {
    table_catalog: string;
    table_schema: string;
    table_name: string;
    column_name: string;
    ordinal_position: number;
    column_default?: any;
    is_nullable: string;
    data_type: string;
    character_maximum_length?: any;
    character_octet_length?: any;
    numeric_precision: number;
    numeric_precision_radix: number;
    numeric_scale: number;
    datetime_precision?: any;
    interval_type?: any;
    interval_precision?: any;
    character_set_catalog?: any;
    character_set_schema?: any;
    character_set_name?: any;
    collation_catalog?: any;
    collation_schema?: any;
    collation_name?: any;
    domain_catalog?: any;
    domain_schema?: any;
    domain_name?: any;
    udt_catalog: string;
    udt_schema: string;
    udt_name: string;
    scope_catalog?: any;
    scope_schema?: any;
    scope_name?: any;
    maximum_cardinality?: any;
    dtd_identifier: string;
    is_self_referencing: string;
    is_identity: string;
    identity_generation?: any;
    identity_start?: any;
    identity_increment?: any;
    identity_maximum?: any;
    identity_minimum?: any;
    identity_cycle: string;
    is_generated: string;
    generation_expression?: any;
    is_updatable: string;
}

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

        let offsetQuery: string = "";
        if (limit != null && page != null) {
            offsetQuery = " OFFSET ".concat(String(Number(page) * Number(limit)));
        }

        let sort: string[] | null =
            req.query.sort && typeof req.query.sort == "string"
                ? req.query.sort.split(";")
                : null;
        let sortByQuery: string = "";
        if (sort != null) {
            sort.forEach((sortBy: string) => {
                if (sortByQuery.length > 0) {
                    sortByQuery = sortByQuery.concat(", ");
                } else {
                    sortByQuery = " ORDER BY ";
                }
                const sortBySplitted = sortBy.split(":");
                sortByQuery = sortByQuery
                    .concat(sortBySplitted[0])
                    .concat(" ")
                    .concat(sortBySplitted[1]);
            });
        }
        const sql = `SELECT *
                     FROM ${collection} ${whereQuery}${sortByQuery}${limitQuery}${offsetQuery}`;
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

    async getPropertiesByCollection(): Promise<Map<string, any>> {
        const propertiesMap: Map<string, any> = new Map<string, any>();
        let collections: string[] = await this.collections();

        const postgresqlOpenApiMapping: PostgresqlOpenApiMapping = new PostgresqlOpenApiMapping();

        for (let i = 0; i < collections.length; i++) {
            const collectionName: string = collections[i];
            const sql = `SELECT *
                         FROM INFORMATION_SCHEMA.COLUMNS
                         WHERE TABLE_NAME = '${collectionName}'`;
            const result = await this.getClient().query(sql);
            const properties: PostgresqlProperty[] = [];
            for (let j = 0; j < result.rows.length; j++) {
                const row = result.rows[j];
                properties.push(<PostgresqlProperty>row);
            }
            propertiesMap.set(collectionName, postgresqlOpenApiMapping.toOpenApiProperties(properties));
        }
        return Promise.resolve(propertiesMap);
    }
}
