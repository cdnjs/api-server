<h1 align="center">
    <a href="https://cdnjs.com"><img src="https://raw.githubusercontent.com/cdnjs/brand/master/logo/standard/dark-512.png" width="175px" alt="< cdnjs >"></a>
</h1>

<h3 align="center">The #1 free and open source CDN built to make life easier for developers.</h3>

---

## cdnjs API Server

Looking for the documentation on our API?

> [cdnjs API docs](https://cdnjs.com/api)

## Getting Started

This project uses [Node.js](https://nodejs.org) for development, and is deployed as a
[Cloudflare Worker](https://workers.cloudflare.com/). Please make sure you have a Node.js version
installed that matches our defined requirement in the [`.nvmrc`](.nvmrc) file for this project.

Included with this project is a dependency lock file. This is used to ensure that all installations
of the project are using the same version of dependencies for consistency. You can install the
dependencies following this lock file by running:

```sh
npm ci
```

Once the dependencies are installed, which includes the Wrangler CLI for Cloudflare Workers, you
need to create the KV namespace for data caching before the API can be run. This command will ask
you to authenticate with a Cloudflare account, so that the Workers KV namespace can be created:

```sh
wrangler kv:namespace create CACHE --preview
```

Copy the new `preview_id` returned by the command and replace the existing `preview_id` in
[`wrangler.toml`](wrangler.toml).

With the KV namespace setup, the API server is now ready to run in development mode. To start the
server in development mode, run:

```sh
npm run dev
```

This command will ask you to authenticate with a Cloudflare account, so that the worker can be
deployed in a development context to Cloudflare's Workers runtime.

## Testing and Linting

Our full set of tests (linting & a mocha+chai test suite using Miniflare to run the worker locally)
can be run at any time with:

```sh
npm test
```

### Linting

Included in this repository are an [eslint config file](.eslintrc.cjs) as well as an
[editorconfig file](.editorconfig) to help with ensuring a consistent style in the codebase for the
API server.

To help enforce this, we use both eslint and echint in our testing. To run eslint at any time, which
checks the code style of any JavaScript, you can use:

```sh
npm run test:eslint
```

eslint also provides automatic fixing capabilities, these can be run against the codebase with:

```sh
npm run test:eslint:fix
```

The more generic rules defined in the [editorconfig file](.editorconfig) apply to all files in the
repository and this is enforced by echint, which can be run at any time with:

```sh
npm run test:echint
```

### Testing

This project uses Mocha and Chai (http) to test the API server, along with Miniflare to run the
Worker itself in a simulated Cloudflare Workers runtime. The tests attempt to validate every
route on the API to ensure that no breaking changes have been made, though there is no promise that
this is perfect, a human should always review changes!

The mocha test suite can be run at any time with the following command (it will build the worker
using Wrangler, and then run it with Miniflare during the Mocha+Chai test suite):

```sh
npm run test:mocha
```

## Error Logging

We use Sentry to handle our error logging. To enable Sentry in the API server, set the `SENTRY_DSN`
environment variable in the [Wrangler config file](wrangler.toml) for the appropriate environment to
a valid DSN URL from Sentry. The `SENTRY_RELEASE` environment variable can also be set to identify a
specific release of the worker (our GitHub Actions workflows for deployments set this to the current
commit hash).

Alongside the normal error reporting that Sentry provides in the worker, we also fire out custom
error events for certain issues to help with improving data consistency across cdnjs:

- `Missing SRI entry` is fired if there is no SRI hash for a file
- `Bad entry in Algolia data` is fired if an entry in Algolia is falsey, or if its name is falsey
- `Bad entry in packages data` is fired if a package is falsey, or if its `name`/`version` is falsey

## Deployment

As this API server is written as a Cloudflare Worker, you can deploy it using the Wrangler CLI. This
can be done manually, but this repository uses [GitHub Actions](.github/workflows) to handle
deploying to staging (api.cdnjs.dev) and production (api.cdnjs.com) based on commits to the
staging/production branches, automatically handling not only deploying the worker but also creating
a Sentry release with full source maps.

Before deploying, ensure that you generate the required KV namespace for the environment you are
deploying to and update [`wrangler.toml`](wrangler.toml) to use the correct ID:

```sh
wrangler kv:namespace create CACHE --env=staging
# or
wrangler kv:namespace create CACHE --env=production
```

To deploy to staging (assuming you have write access to this repository), run `make deploy-staging`.
This will force-push your latest local commit to the staging branch, which will trigger GitHub
Actions to run and deploy your worker to Cloudflare Workers.

Similarly, for a production deployment, run `make deploy-production`. This will force-push to the
production branch instead, and trigger the production GitHub Actions workflow.
