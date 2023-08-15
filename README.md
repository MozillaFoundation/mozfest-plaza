# MozFest Plaza

This repo contains the source code and content to run the MozFest Plaza!

**Contents**

- [client](./client/) — The Vue.js front-end app
- [content](./content/) — Markdown copy and content for the website
- [server](./server/) — The Node.js server
- [Architecture](./ARCHITECTURE.md) — Get an overview of the Plaza's deployment
- [Changelog](./CHANGELOG.md) — See what's been changing in the project

## Releasing

The `client` and `server` are released together under the same semantic version, defined in [package.json](./package.json).
The `content` is loaded dynamically by the `server` at runtime so it can easily be edited.

The next version is determined by the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) that have happened since the last version.
e.g. a patch is relased if only `FIX:` commits have occured, or a minor version if any new `FEAT`-ures have been added.

When developing, commit messages are linted by [commitlint](https://commitlint.js.org/#/) to ensure they are valid.

To generate a new release [standard-version](https://github.com/conventional-changelog/standard-version) is used.
It does the commit message magic, generates the [CHANGELOG.md](./CHANGELOG.md), updates the package files with the new version and commits the version with a `vX.Y.Z` tag.

When that tag is pushed to GitHub, the [containers.yml](./.github/workflows/container.yml) workflow runs to build and push the server and client containers to the registry.

To deploy a newly released container, head over to [mozfest-config](https://github.com/digitalinteraction/mozfest-config) to reference the new container and deploy it.
