#!/bin/sh

export WEB_CONCURRENCY=1

# Get the latest packages data
. ./bin/packages.sh || exit 1

# Get the latest SRI data
rm -rf ./data/sri
git clone --depth=1 https://github.com/cdnjs/SRIs.git ./data/sri

# Log SRI version
(
    cd ./data/sri
    echo "SRIs at:"
    git log -n 1 | cat
)

# Get the latest tutorials
rm -rf ./data/tutorials
git clone https://github.com/cdnjs/tutorials.git ./data/tutorials

# Log tutorials version
(
    cd ./data/tutorials
    echo "Tutorials at:"
    git log -n 1 | cat
)

# Get last modified data for tutorials
. ./bin/tutorialsModified.sh || exit 1

# Run the API server
npm run prod
