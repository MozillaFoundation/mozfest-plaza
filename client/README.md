# mozfest-client

This is the client-side component of the Plaza.

## development

### setup

> First make sure you have the [root setup](../README.md#setup)

You'll want the server to be running, see [server setup](../server/README.md#setup),
by default the client will talk to the local server automatically.

```bash
# cd to/this/folder

npm install
```

### regular use

```bash
# cd to/this/folder

# Run vue-cli-service to build and serve the site for local development
# -> Runs on localhost:8080
npm run start
```

## Releasing

Following [release process](../README.md#releasing), a container for the server is built using the [Dockerfile](./Dockerfile).
