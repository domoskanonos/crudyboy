import {Pool, Client} from "pg"
import {DbClient, DBClientConfig} from "./db-client";

export class PostgresqlClient extends DbClient {

    private client: Client | undefined;

    connect(): Promise<void> {
        return this.getClient().connect();
    }

    protected initClient(): void {
        this.client = new Client(this.config)
    }

    async collections(): Promise<string[]> {
        this.getClient().query('SELECT NOW()', (err, res) => {
            console.log(err, res)
            this.getClient().end()
        });
        return [];
    }

    private getClient(): Client {
        if (this.client == undefined)
            throw new Error("init client");
        return this.client;
    }
}