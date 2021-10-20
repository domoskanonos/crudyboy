# crudyboy
nodejs typescript crud rest builder

docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=mongo mongo:4.2.0






### build crudyboy docker image
    docker build -t domoskanonos/crudyboy .

### run crudyboy
    docker run -t -d domoskanonos/crudyboy

### run crudyboy continuesly
    docker run -t -d domoskanonos/crudyboy tail -f /dev/null

### docker push to public repo
    docker push domoskanonos/crudyboy