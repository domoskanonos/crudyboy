FROM ubuntu:latest
RUN apt -y update && \
    apt -y upgrade && \
    apt-get install -y nodejs && \
    apt-get install -y nodejs-npm && \
    mkdir /app
COPY lib/ /app/lib/
WORKDIR /app/
CMD nodejs lib/server.js