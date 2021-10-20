import express, { Router } from 'express';
import { CrudyboyRepository } from './repository';

//const app = express();
//const port = 8080; // default port to listen

export class CrudyboyRouter {
  private router : Router;
  private repository: CrudyboyRepository;

  constructor(){
    this.router = express.Router();
    this.repository = new CrudyboyRepository();
  }

  public async createEndpoints(): Promise<void>{
    const collections = this.repository.getCollections();
    return Promise.resolve();
  }


}


const crudyRouter : CrudyboyRouter = new CrudyboyRouter();
crudyRouter.createEndpoints();