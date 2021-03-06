# crudyboy

with crudyboy you can quickly and easily generate a crud rest service from a postgresql database . crudyboy is a ready to run rest crud service, you only need a connection to a postgresql . crudyboy automaticalliy read out all tables and fields from a given database and provides corresponding crud operations via rest.

### project info

|||
|:-------------|:-------------|
|npm|<nobr>[![Published on npm](https://img.shields.io/npm/l/@domoskanonos/crudyboy)](https://www.npmjs.com/package/@domoskanonos/crudyboy) [![Published on npm](https://img.shields.io/npm/v/@domoskanonos/crudyboy)](https://www.npmjs.com/package/@domoskanonos/crudyboy) [![Published on npm](https://img.shields.io/bundlephobia/min/@domoskanonos/crudyboy)](https://www.npmjs.com/package/@domoskanonos/crudyboy) [![Published on npm](https://img.shields.io/bundlephobia/minzip/@domoskanonos/crudyboy)](https://www.npmjs.com/package/@domoskanonos/crudyboy) [![Published on npm](https://img.shields.io/npm/dw/@domoskanonos/crudyboy)](https://www.npmjs.com/package/@domoskanonos/crudyboy)</nobr>|
|git|<nobr>![GitHub](https://img.shields.io/github/license/domoskanonos/crudyboy)</nobr> <nobr>[![Published on git](https://img.shields.io/github/languages/code-size/domoskanonos/crudyboy)](https://github.com/domoskanonos/crudyboy)</nobr>|
|docker|![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/domoskanonos/crudyboy)|
|donation|<nobr>[![donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_buttonid=SWGKEVSK2PDEE)</nobr>|

## npm

### install server with npm

    npm i @domoskanonos/crudyboy

### constructor

    new CrudyboyServer(port: Number,
        dbClient: DBClient,
        customCSS: string,
        customCSSUrl: string,
        accessControlAllowOrigin: string,
        accessControlAllowMethods: string,
        accessControlAllowHeaders: string,
        accessControlAllowCredentials: string,
        version: string)

### init server example (typescript)

    //new db client instance
    const dbClient: DbClient = new PostgresqlClient(<DBClientConfig>{ host: "localhost", database: "mydatabase", user: "user", password: "pwd", port: 5432 });

    //new instance
    const server: CrudyboyServer = new CrudyboyServer(8080,dbClient,".customCss {}","https://myserver/my-custom.css","*","GET, POST, OPTIONS, PUT, PATCH, DELETE","X-Requested-With,content-type","X-Requested-With,content-type","true","1.0.0");

    //init server
    server.init();

## docker

### run with docker (example)

    docker run --restart=always -p 8080:8080 -e DB_HOST='localhost' -e DB_Port='5432' -e DB_USER='user' -e DB_PASSWORD='pwd' -e DB_NAME='mydatabase' -e PORT='8080' -e CUSTOM_CSS_URL='<css url>' -d domoskanonos/crudyboy

### run with docker-compose (example)

    version: '3.2'
        services:
            crudyboy:
                image: domoskanonos/crudyboy
                ports:
                    - "8080:8080"
                environment:
                    DB_HOST: localhost
                    DB_PORT: 5432
                    DB_USER: user
                    DB_PASSWORD: pwd
                    DB_NAME: mydatabase
                    PORT: 8080
                    CUSTOM_CSS: .customCss {}
                    CUSTOM_CSS_URL: https://myserver/my-custom.css
                    REQUEST_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN: *
                    REQUEST_HEADER_ACCESS_CONTROL_ALLOW_METHODS: GET, POST, OPTIONS, PUT, PATCH, DELETE
                    REQUEST_HEADER_ACCESS_CONTROL_ALLOW_HEADERS: X-Requested-With,content-type
                    REQUEST_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS: true


### environmental vars

|key|example|
|:-------------|:-------------|
|DB_HOST|localhost|
|DB_PORT|5432|
|DB_USER|user|
|DB_PASSWORD|pwd|
|DB_NAME|mydatabase|
|PORT|8080|
|CUSTOM_CSS|.customCss {}|
|CUSTOM_CSS_URL|https://myserver/my-custom.css|
|REQUEST_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN|*|
|REQUEST_HEADER_ACCESS_CONTROL_ALLOW_METHODS|GET, POST, OPTIONS, PUT, PATCH, DELETE|
|REQUEST_HEADER_ACCESS_CONTROL_ALLOW_HEADERS|X-Requested-With,content-type|
|REQUEST_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS|true|


### environmental vars example .env

    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=user
    DB_PASSWORD=pwd
    DB_NAME=mydatabase
    PORT=8080
    CUSTOM_CSS=.customCss {}
    #CUSTOM_CSS_URL=https://myserver/my-custom.css
    REQUEST_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN=*
    REQUEST_HEADER_ACCESS_CONTROL_ALLOW_METHODS=GET, POST, OPTIONS, PUT, PATCH, DELETE
    REQUEST_HEADER_ACCESS_CONTROL_ALLOW_HEADERS=X-Requested-With,content-type
    REQUEST_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS=true


### docker images location

https://hub.docker.com/r/domoskanonos/crudyboy