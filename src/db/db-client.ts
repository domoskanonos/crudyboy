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
}
