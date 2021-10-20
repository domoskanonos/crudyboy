# crudyboy

### build crudyboy docker image
    docker build -t domoskanonos/crudyboy .

### run crudyboy
    docker run --restart=always -p 8080:8080 -e CONNECTION_STRING='mongodb://mongoadmin:mongo@188.68.32.191:27017' -e DATABASE_NAME='test' -e HOST='localhost' -e PORT='8080' -d domoskanonos/crudyboy

### docker push to public repo
    docker push domoskanonos/crudyboy