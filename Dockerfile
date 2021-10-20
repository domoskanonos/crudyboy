FROM alpine:3.13.3
RUN apk update && \
    apk upgrade && \
    apk add git && \
    apk add nodejs && \
    apk add nodejs-npm && \
    mkdir /app && \
    cd /app && \
    git clone https://github.com/domoskanonos/crudyboy.git && \
    cd crudyboy && \
    npm i
WORKDIR /app/crudyboy
CMD npm run start