import { Request } from "express";
import { CollectionInfo, Db, FindCursor, MongoClient, ObjectId } from "mongodb";
import { DbClient } from "./db-client";

export class MongoDBClient extends DbClient {
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

  async search(collectionName: string, req: Request): Promise<any[]> {
    //query - start
    var query: any = {};
    for (let key of Object.keys(req.query)) {
      let mealName = req.query[key];
      if (key != "limit" && key != "page") {
        query[key] = new RegExp(".*" + mealName + ".*");
      }
    }
    //query - end
    const cursor: FindCursor = this.getDb()
      .collection(collectionName)
      .find(query);

    // pagination - start
    let limit: number | null =
      req.query.limit && typeof req.query.limit == "string"
        ? parseInt(req.query.limit)
        : null;
    let page: number | null =
      req.query.page && typeof req.query.page == "string"
        ? parseInt(req.query.page)
        : null;

    if (limit != null && page != null) {
      const startIndex = Number(page) * Number(limit);
      cursor.skip(startIndex).limit(limit);
    } else if (limit) {
      cursor.limit(limit);
    }
    // pagination - end
    const retval = await cursor.toArray();
    return retval;
  }

  async insertOne(collectionName: string, value: any): Promise<any> {
    return this.getDb().collection(collectionName).insertOne(value);
  }

  async insertMany(collectionName: string, value: any[]): Promise<any> {
    return this.getDb().collection(collectionName).insertMany(value);
  }

  async delete(collectionName: string, id: string): Promise<boolean> {
    const query = { _id: new ObjectId(id) };
    const result = await this.getDb()
      .collection(collectionName)
      .deleteOne(query);
    return result != undefined;
  }

  async update(
    collectionName: string,
    id: string,
    item: any
  ): Promise<boolean> {
    const query = { _id: new ObjectId(id) };
    const result = await this.getDb()
      .collection(collectionName)
      .updateOne(query, { $set: item });
    return result != undefined;
  }
}
