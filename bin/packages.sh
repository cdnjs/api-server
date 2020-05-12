#!/bin/sh

# Get the latest packages data
rm -f ./data/packages.min.json ||:
wget -nv -O ./data/packages.min.json https://storage.googleapis.com/cdnjs-assets/package.min.js
