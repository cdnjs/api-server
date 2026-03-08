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

Once the dependencies are installed, which includes the Wrangler CLI for Cloudflare Workers, the API
server is now ready to run in development mode. To start the server in development mode, run:

```sh
npm run dev
```

This command will run the worker entirely locally, and you can access the API at
[`http://localhost:8787`](http://localhost:8787) (note that the root path redirects to the docs).

## Testing and Linting

### Linting

Our full set of linting can be run at any time with:

```sh
npm run lint
```

Included in this repository are an [eslint config file](eslint.config.js) as well as an
[editorconfig file](.editorconfig) to help with ensuring a consistent style in the codebase for the
API server.

To help enforce this, we use both eslint and echint in our testing. To run eslint at any time, which
checks the code style of any TypeScript, you can use:

```sh
npm run lint:eslint
```

eslint also provides automatic fixing capabilities, these can be run against the codebase with:

```sh
npm run lint:eslint:fix
```

The more generic rules defined in the [editorconfig file](.editorconfig) apply to all files in the
repository and this is enforced by echint, which can be run at any time with:

```sh
npm run lint:echint
```

### Testing

This project uses Vitest to test the API server, with Cloudflare Workers' Vitest integration to run
the worker locally for testing. The tests attempt to validate every route on the API to ensure that
no breaking changes have been made, though there is no promise that this is perfect, a human should
always review changes!

The Vitest test suite can be run at any time with the following command:

```sh
npm test
```

By default the test suite will run against a local version of the worker, and this is also done for
any commit pushed to GitHub, for any pull requests, and prior to any staging/production deployment.

`VITEST_EXTERNAL_API_URL` can be set to target a deployed version of the API instead, which is used
as the last step in our staging/production deployment workflows to verify the updated API worker.

## Error Logging

We use Sentry to handle our error logging. To enable Sentry in the API server, set the `SENTRY_DSN`
environment variable in the [Wrangler config file](wrangler.toml) for the appropriate environment to
a valid DSN URL from Sentry. The `SENTRY_RELEASE` environment variable can also be set to identify a
specific release of the worker (our GitHub Actions workflows for deployments set this to the current
commit hash).

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
