# crudyboy

crudyboy is a ready to run crud application, you only need a connection to a mongodb database. crudyboy automaticalliy read out the collections of database and create crud rest endpoints for each collection.

### what is crud ?
The Data Access Layer communicates with the Data Storage Layer to perform CRUD operations. CRUD represents an acronym for the database operations Create, Read, Update, and Delete. The communication between two layers could be in the form of ad hoc SQL statements such as INSERT, SELECT, UPDATE, and DELETE.

|project info||
|:-------------|:-------------|
|github|<nobr>[![Published on git](https://img.shields.io/github/languages/code-size/domoskanonos/crudyboy)](https://github.com/domoskanonos/crudyboy)</nobr>|
|donation|<nobr>[![donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=SWGKEVSK2PDEE)</nobr>|

## docker

### example run crudyboy with docker
    docker run --restart=always -p 8080:8080 -e CONNECTION_STRING='mongodb://mongoadmin:mongo@188.68.32.191:27017' -e DATABASE_NAME='mydatabase' -e PORT='8080' -e CUSTOM_CSS_URL='<css url>' -d domoskanonos/crudyboy

### run crudyboy with docker-compose  
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