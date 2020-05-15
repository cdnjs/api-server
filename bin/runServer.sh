#!/bin/sh

export WEB_CONCURRENCY=1

# Get the data for the first time
. ./bin/initialData.sh || exit 1

# Run the API server
npm run prod
