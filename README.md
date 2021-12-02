<h1 align="center">
    <a href="https://cdnjs.com"><img src="https://raw.githubusercontent.com/cdnjs/brand/master/logo/standard/dark-512.png" width="175px" alt="< cdnjs >"></a>
</h1>

<h3 align="center">The #1 free and open source CDN built to make life easier for developers.</h3>

---

## cdnjs API Server

Looking for the documentation on our API?

> [cdnjs API docs](https://cdnjs.com/api)

## Getting Started

This project runs on [Node.js](https://nodejs.org). Please make sure you have a version installed
that matches our defined requirement in the [.nvmrc](.nvmrc) file for this project.

Included with this project is a dependency lock file. This is used to ensure that all installations
of the project are using the same version of dependencies for consistency.

You can install the Node dependencies following this lock file by running:

```shell script
npm ci
```

Once the dependencies are installed, you need to get a copy of all the data that the API server
requires to run. This can be done by running:

```shell script
npm run build
```

With the data fetched, the API server is ready to run in development mode. To start the server in
development mode, run:

```shell script
npm run dev
```

## Updating Data

To update your data, you can simply run `npm run build` again, which will update the tutorial repo
clone originally created by this script.

Once you have updated your data locally, you will need to restart the development server for it to
pick up the new data. In production, the app includes its own update job that runs every ten
minutes, calling the same logic as `npm run build` and then loading that data into memory.

The `npm run build` script performs the following task, via
[`update/worker.js`](update/worker.js):

- Cloning or updating the git-based data for tutorials, via
[`bin/cloneUpdateData.sh`](bin/cloneUpdateData.sh)
    - Clone or update tutorials
        - If tutorials git repo already exists locally, update it from origin
        - Else, clone the latest tutorials from [cdnjs/tutorials](https://github.com/cdnjs/tutorials)
        - Then, always, log the tutorials commit that was cloned
        - Then, always, save the last modified and created at info for the tutorials to
        [`data/tutorialsModified.txt`](data/tutorialsModified.txt) and
        [`data/tutorialsCreated.txt`](data/tutorialsCreated.txt) respectively

## Error Logging

We make use of Sentry to handle our error logging. To enable Sentry in the API server, set the
`SENTRY_DSN` environment variable to a valid DSN URL from Sentry.

Alongside the normal error catching that Sentry provides in Node.js & Express, we also fire out
custom error events for certain issues:

- `Missing SRI entry` is fired if there is no SRI hash for a file
- `Bad entry in Algolia data` is fired if an entry in Algolia is falsey, or if its name is falsey
- `Bad entry in packages data` is fired if a package is falsey, or if its `name`/`version` is falsey

## Production Deployment

To deploy this API server to production, it should be as simple as cloning this repository, running
`npm run build` to fetch the initial data for the server and then running `npm run start`.

To change the port that the app binds to, set the `PORT` environment var when running the script.

Removing submodules and then cloning the respective repositories is used to update data for
production deployments due to how some PaaS hosts deploy, with the final app directory not being an
initialised Git repo.

## Testing and Linting

Our full set of tests (linting & test suite) can be run at any time with:

```shell script
npm test
```

You can also run the tests with their own API server running in development mode using:

```shell script
npm run test:with-server
```

Note, as this starts an instance of the API server, data for it must be available. This can be done
by running `npm run build`, before starting the server/tests.

(This is what the CI in this repository uses for every commit).

### Linting

Included in this repository are an [eslint config file](.eslintrc.js) as well as an
[editorconfig file](.editorconfig) to help with ensuring a consistent style in the codebase for the
API server.

To help enforce this, we use both eslint and echint in our testing. To run eslint at any time, which
checks the code style of any JavaScript, you can use:

```shell script
npm run test:eslint
```

eslint also provides automatic fixing capabilities, these can be run against the codebase with:

```shell script
npm run test:eslint:fix
```

The more generic rules defined in the [editorconfig file](.editorconfig) apply to all files in the
repository and this is enforced by echint, which can be run at any time with:

```shell script
npm run test:echint
```

### Testing

This project uses Mocha and Chai (http) to test the API server. The tests attempt to validate every
route on the API to ensure that no breaking changes have been made, though there is no promise that
this is perfect, a human should always review changes!

The mocha test suite can be run at any time with the following command, assuming that the API server
is running locally on port 5050 (or on the port defined with the environment variable `PORT`):

```shell script
npm run test:mocha
```

You can also start the mocha test suite with a dedicated API server running in development mode on
port 5050 (or on the port defined with the environment variable `PORT`) by running:

```shell script
npm run test:mocha:with-server
```
