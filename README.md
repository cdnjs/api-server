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
requires to run. This can be done with the [`bin/initialData.sh`](bin/initialData.sh) script:

```shell script
. ./bin/initialData.sh
```

With the data fetched, the API server is ready to run in development mode. To start the server in
development mode, run:

```shell script
npm run dev
```

## Updating Data

In development, you initially fetch a set of data using the
[`bin/initialData.sh`](bin/initialData.sh) script (in production this script is run as part of the
[`bin/runServer.sh`](bin/runServer.sh) script). This downloads the latest package JSON data, as
well as making a local clone of the tutorials & SRI repos.

To update your data, you can run the [`bin/updateData.sh`](bin/updateData.sh) script, which will
fetch the latest package data as well as update the SRI & tutorial repo clones. In production, this
script is automatically run every ten minutes once deployed.

The data consists of three parts that can all be updated individually if needed:

### Packages

Use the [`bin/packages.sh`](bin/packages.sh) script to pull down the latest packages data:

```shell script
. ./bin/packages.sh
```

### SRI

The SRI data is contained within another cdnjs repository and is cloned locally by the
[`bin/initialData.sh`](bin/initialData.sh) script. You can update this at any time by updating that
cloned repository:

```shell script
cd data/sri
git fetch origin
git reset --hard origin/master
```

### Tutorials

Similarly, all the tutorials for the libraries that are available via the API are also contained in
another cdnjs repository and cloned by the [`bin/initialData.sh`](bin/initialData.sh) script.

You can update that cloned repository by running:

```shell script
cd data/tutorials
git fetch origin
git git reset --hard origin/master
```

Once this is done, the last modified data log should also be updated, which can be done by running:

```shell script
. ./bin/tutorialsModified.sh
```

## Production Deployment

To deploy this API server to production, it should be as simple as cloning this repository and
running the [`bin/runServer.sh`](bin/runServer.sh) file (from the root of the repository). For
deployments to Heroku, running this script is configured with the included [`Procfile`](Procfile).

The [`bin/runServer.sh`](bin/runServer.sh) script performs the following actions to deploy and
start the app:

- Update packages data
    - Remove development packages data
    - Download latest packages data
- Update SRI data
    - Remove the outdated SRI submodule data
    - Clone latest SRI data from [cdnjs/SRIs](https://github.com/cdnjs/SRIs)
    - Log the SRI commit that was cloned
- Update tutorials
    - Remove the outdated tutorials submodule data
    - Clone the latest tutorials from [cdnjs/tutorials](https://github.com/cdnjs/tutorials)
    - Log the tutorials commit that was cloned
    - Save the last modified info for the tutorials to
    [`data/tutorialsModified.txt`](data/tutorialsModified.txt)
- Start the API server with GC enabled and additional memory allocated

To change the port that the app binds to, set the `PORT` environment var when running the script.
For our Heroku deployment, this is set automatically by Heroku.

Removing submodules and then cloning the respective repositories is used to update data for
production deployments due to how Heroku sets up the app, with the final app directory not being an
initialized Git repo.

## Testing and Linting

Our full set of tests (linting & test suite) can be run at any time with:

```shell script
npm test
```

You can also run the tests with their own API server running in development mode using:

```shell script
npm run test:with-server
```

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
