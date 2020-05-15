#!/bin/sh

# Subshell to keep it contained
(
    # Create empty modified log file
    cd ./data/tutorials
    touch tutorialsModified.txt

    # Add the modified data for every file in tutorials
    git ls-tree -r --name-only HEAD | while read filename; do
        echo "$filename: $(git log -1 --format="%ad" -- $filename)" >> tutorialsModified.txt
    done

    # Move the log file to the parent data dir
    mv tutorialsModified.txt ../tutorialsModified.txt
)
