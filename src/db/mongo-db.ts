import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { CollectionInfo, Db, MongoClient } from "mongodb";
import { ParsedQs } from "qs";
import { DbClient } from "./db-client";

export class XXX extends DbClient {
  private client: MongoClient | undefined;
  private db: Db | undefined;

  protected initClient(): void {
    const url = "mongodb://localhost:27017";
    const dbName = "xxx";
    this.client = new MongoClient(url);
    this.client.connect();
    this.db = this.client.db(dbName);
  }

  private getDb(): Db {
    if (this.db == undefined) throw new Error("db is undefined, init client");
    return this.db;
  }

  private getClient(): MongoClient {
    if (this.client == undefined)
      throw new Error("client is undefined, init client");
    return this.client;
  }

  async collections(): Promise<string[]> {
    const collections = this.getDb().listCollections();
    const collectionNames: string[] = [];
    collections.forEach((collection: CollectionInfo) => {
      collectionNames.push(collection.collectionName);
    });
    return collectionNames;
  }

  search(
    _collection: string,
    _request: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
  ): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  insertOne(_collection: string, _value: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  insertMany(_collection: string, _value: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
  delete(_collectionName: string, _id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  update(_collectionName: string, _id: string, _item: any): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
