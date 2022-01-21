export interface OpenApiProperty {
  title: string;
  format: string;
  comments: string;
  type: string;
  default: any;
  readOnly: boolean;
  writeOnly: boolean;
  nullable: boolean;
  minimum: number;
  maximum: number;
  minLength: number;
  maxLength: number;
}

export class OpenApiGenerator {
  public generateOpenApiDocPath(collections: Map<string, any>): any {
    const openApiDocPath: any = {};
    for (let collectionName of collections.keys()) {
      const openApiProperties: any | undefined =
        collections.get(collectionName);

      const path = "/".concat(collectionName);
      console.log("create endpoint: %s", path);

      openApiDocPath[path] = {};

      //get
      openApiDocPath[path]["get"] = {
        description: `get ${collectionName} objects by query`,
        tags: [`${collectionName}`],
        responses: {
          200: {
            description: `a list of ${collectionName}`,
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: openApiProperties,
                  },
                },
              },
            },
          },
        },
        parameters: [
          {
            name: "page",
            in: "query",
            description: `search page index`,
            schema: {
              default: 0,
              type: "string",
            },
          },
          {
            name: "limit",
            in: "query",
            description: `limit search result`,
            schema: {
              default: 10,
              type: "string",
            },
          },
          {
            name: "sort",
            in: "query",
            description: `sort search result`,
            schema: {
              default: "id:asc",
              type: "string",
            },
          },
        ],
        operationId: "find${collectionName}",
      };

      //post
      openApiDocPath[path]["post"] = {
        description: `create one or more elements of type ${collectionName} can be saved with this endpoint. f.e. insert one object: {}, insert multiple: [{},{},{},...] .`,
        tags: [`${collectionName}`],
        operationId: "add",
        responses: {
          201: {
            description: `a list of ${collectionName}`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
          500: {
            description: `Error: Internal Server Error`,
          },
        },
        requestBody: {
          description: `object of ${collectionName} as json`,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: openApiProperties,
              },
            },
          },
        },
      };

      //put
      openApiDocPath[path]["put"] = {
        description: `update one or more elements of type ${collectionName} can be saved with this endpoint. f.e. insert one object: {}, insert multiple: [{},{},{},...] .`,
        tags: [`${collectionName}`],
        operationId: "updateById",
        responses: {
          200: {
            description: `returned updated ${collectionName} item`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
          500: {
            description: `Error: Internal Server Error`,
          },
        },
        requestBody: {
          description: `object of ${collectionName} item as json`,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: openApiProperties,
              },
            },
          },
        },
      };

      const pathWithId = path.concat("/{id}");
      openApiDocPath[pathWithId] = {};

      //findById
      openApiDocPath[pathWithId]["get"] = {
        description: `get ${collectionName} item by id`,
        tags: [`${collectionName}`],
        responses: {
          200: {
            description: `${collectionName} item`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: openApiProperties,
                },
              },
            },
          },
          204: {
            description: `${collectionName} item not found`,
          },
          500: {
            description: `Error: Internal Server Error`,
          },
        },
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: `${collectionName} item id`,
            schema: {
              default: 0,
              type: "string",
            },
          },
        ],
        operationId: `find${collectionName}`,
      };

      //delete
      openApiDocPath[pathWithId]["delete"] = {
        description: `remove ${collectionName} by id`,
        tags: [`${collectionName}`],
        responses: {
          200: {
            description: `return true if ${collectionName} item successfully deleted, otherwise false.`,
            content: {
              "application/text": {
                schema: {
                  type: "boolean",
                },
              },
            },
          },
          500: {
            description: `Error: Internal Server Error`,
          },
        },
        operationId: "removeById",
        parameters: [
          {
            name: "id",
            in: "path",
            description: `id of ${collectionName} to delete`,
            required: true,
            schema: {
              type: "string",
            },
            style: "simple",
          },
        ],
      };
    }
    return openApiDocPath;
  }
}
