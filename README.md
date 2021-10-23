# crudyboy

With Crudyboy you can quickly and easily generate a crud rest service from a MongoDB.
Crudyboy is a ready to run rest crud service, you only need a connection to a MongoDB.
Crudyboy automaticalliy read out all collections from a given database and provides corresponding crud operations via rest.

|project info||
|:-------------|:-------------|
|license|<nobr>![GitHub](https://img.shields.io/github/license/domoskanonos/crudyboy)</nobr>|
|github|<nobr>[![Published on git](https://img.shields.io/github/languages/code-size/domoskanonos/crudyboy)](https://github.com/domoskanonos/crudyboy)</nobr>|
|donation|<nobr>[![donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=SWGKEVSK2PDEE)</nobr>|


## docker

### run with docker (example)
    docker run --restart=always -p 8080:8080 -e CONNECTION_STRING='mongodb://mongoadmin:mongo@188.68.32.191:27017' -e DATABASE_NAME='mydatabase' -e PORT='8080' -e CUSTOM_CSS_URL='<css url>' -d domoskanonos/crudyboy

### run with docker-compose (example)
    version: '3.2'
        services:
            crudyboy:
                image: domoskanonos/crudyboy
                ports:
                    - "8080:8080"
                environment:
                    - CONNECTION_STRING: https
                    - DATABASE_NAME: mydatabase

### environmental vars

|key|example|
|:-------------|:-------------|
|CONNECTION_STRING|mongodb://mongoadmin:mongo@localhost:27017
|DATABASE_NAME|mydatabase|
|PORT|8080|
|CUSTOM_CSS|.someClass {}|
|CUSTOM_CSS_URL|https://myserver/my-custom.css|
|REQUEST_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN|*|
|REQUEST_HEADER_ACCESS_CONTROL_ALLOW_METHODS|GET, POST, OPTIONS, PUT, PATCH, DELETE|
|REQUEST_HEADER_ACCESS_CONTROL_ALLOW_HEADERS|X-Requested-With,content-type|
|REQUEST_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS|true|


### dockerhub
check different versions on docker hub: https://hub.docker.com/r/domoskanonos/crudyboy