#!/bin/sh

# Get the latest packages data
rm -f ./data/packages.min.json
wget -nv -O ./data/packages.min.json https://storage.googleapis.com/cdnjs-assets/package.min.js

# Update SRI (assumes a valid git repo, not using rm as the app reads from this continually)
(
    # Forcibly update to latest
    cd ./data/sri
    git fetch origin
    git reset --hard origin/master

    # Log the commit
    echo "SRIs at:"
    git log -n 1 | cat
)

# Update tutorials (assumes a valid git repo, not using rm as the app reads from this continually)
(
    # Forcibly update to latest
    cd ./data/tutorials
    git fetch origin
    git reset --hard origin/master

    # Log the commit
    echo "Tutorials at:"
    git log -n 1 | cat
)
