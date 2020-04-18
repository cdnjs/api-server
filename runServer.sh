#!/bin/sh

export WEB_CONCURRENCY=1

# Get the latest packages data
rm -f ./data/packages.min.json
wget -O ./data/packages.min.json https://storage.googleapis.com/cdnjs-assets/package.min.js

# Get the latest SRI data
rm -rf ./data/sri
git clone https://github.com/cdnjs/SRIs.git ./data/sri

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

# Run the API server
node --expose-gc --max-old-space-size=2048 index.js
