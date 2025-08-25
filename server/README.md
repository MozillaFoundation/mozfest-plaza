# mozfest-server

This is the server-side component of the Plaza, it is a satellite container to a
[Deconf](https://github.com/digitalinteraction/deconf) API Server.

It contains a couple of public endpoints and some "job" commands that interact with services and the Deconf API server.

## development

### setup

```bash
# cd to/this/folder

npm install

# Run the docker stack
# -> Stop with "docker-compose down"
# -> Runs a Repo API Service to serve the files within content/
#   - more info: https://github.com/robb-j/repo-api-service
docker-compose up -d
```

### regular use

```bash
# cd to/this/folder

# Run the development server
# -> Runs on localhost:3001
npm run start

# Run the CLI
npm run dev -- --help

# Run the CLI (then server) with debugging
# -> It will break on the first line of code to allow an inspector to connect
npm run debug -- serve
```

## Releasing

Following [release process](../README.md#releasing), a container for the server is built using the [Dockerfile](./Dockerfile).
