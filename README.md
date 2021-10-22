# crudyboy

### build crudyboy docker image
    docker build --no-cache -t domoskanonos/crudyboy .

### run crudyboy
    docker run --restart=always -p 8080:8080 -e CONNECTION_STRING='mongodb://mongoadmin:mongo@188.68.32.191:27017' -e DATABASE_NAME='test' -e PORT='8080' -e CUSTOM_CSS='.swagger-ui .topbar { background-color: #000000; border-bottom: 20px solid #5dc6d1; }' -d domoskanonos/crudyboy

### docker push to public repo
    docker push domoskanonos/crudyboy