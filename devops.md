# create new version

### step 1: create new npm version
    npm run new-patch
### step 2: publish to npm
    npm publish --access public
### step 3: build new docker image version
    docker build --no-cache -t domoskanonos/crudyboy:1.0.7 .
### step 4: publish to dockerhub
    docker push domoskanonos/crudyboy:1.0.7

# other docker commandsdock
    docker container prune
    docker image prune -a