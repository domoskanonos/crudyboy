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
    this.initClient();
  }

  protected abstract initClient(): void;

  abstract collections(): Promise<string[]>;

  abstract search(collection: string): Promise<any[]>;

  abstract insertOne(collection: string, value: any): Promise<any>;

  abstract insertMany(collection: string, value: any[]): Promise<any>;

  abstract delete(collectionName: string, id: string): Promise<boolean>;

  abstract update(collectionName: string, id: string, item: any): Promise<boolean>;
}
