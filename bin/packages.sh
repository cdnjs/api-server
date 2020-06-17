#!/bin/sh

# Get the latest packages data to a temp file
wget -nv -O ./data/packages.temp.min.json https://storage.googleapis.com/cdnjs-assets/package.min.js

# Validate that it is a valid libraries JSON file
node ./bin/valid_json.js ./data/packages.temp.min.json >/dev/null 2>&1 || {
    rm -f ./data/packages.temp.min.json
    echo "Invalid JSON received, aborting packages data update"
    exit 1
}

# Assuming no error, replace existing packages data
mv ./data/packages.temp.min.json ./data/packages.min.json
