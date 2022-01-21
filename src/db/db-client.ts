import {Request} from "express";
import {OpenApiProperty} from "../openapi/open-api-gen";

export interface DBClientConfig {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

export abstract class DbClient {
    constructor(public config: DBClientConfig) {
        this.config = config;
        console.log(
            `db config, host: ${config.host}, port: ${config.port}, database: ${config.database}, user: ${config.user}`
        );
        this.initClient();
    }

    protected abstract initClient(): void;

    abstract collections(): Promise<string[]>;

    abstract findById(collection: string, id: any): Promise<any>;

    abstract search(collection: string, request: Request): Promise<any[]>;

    abstract insertOne(collection: string, value: any): Promise<any>;

    abstract updateOne(collection: string, value: any): Promise<any>;

    abstract insertMany(collection: string, value: any[]): Promise<any>;

    abstract updateMany(collection: string, value: any[]): Promise<any>;

    abstract delete(collectionName: string, id: string): Promise<boolean>;

    abstract getPropertiesByCollection(): Promise<Map<string, any>>;
}
