# mozfest-server

This is the server-side component of the Plaza.

## development

### setup

> First make sure you have the [root setup](../README.md#setup)

```bash
# cd to/this/folder

npm install

# Run the docker stack
# -> Stop with "docker-compose down"
# -> Runs redis on localhost:6379 with persistence
# -> Runs postgres on localhost:5432 with persistence
#    (username: user, password: secret, database: user)
docker-compose up -d
```

### regular use

```bash
# cd to/this/folder

# Run the development server
# -> Runs on localhost:3000
# -> Runs database migrations on start up
# -> Fetchs content from ../content on startup
npm run start

# Run the CLI
npm run dev -- --help

# Run the CLI (then server) with debugging
# -> It will break on the first line of code to allow an inspector to connect
npm run debug -- serve
```

## Releasing

Following [release process](../README.md#releasing), a container for the server is built using the [Dockerfile](./Dockerfile).
