
### build crudyboy docker image
    docker build --no-cache -t domoskanonos/crudyboy domoskanonos/crudyboy:v1.0.0 .

### docker push to public repo
#### first login to docker hub, then push new image versions
    docker push domoskanonos/crudyboy
    docker push domoskanonos/crudyboy:v1.0.0