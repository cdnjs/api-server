#!/bin/sh

# Subshell to keep it contained
(
    # Create empty modified log file
    cd ./data/tutorials
    touch tutorialsModified.txt
    touch tutorialsCreated.txt

    # Add the modified & created data for every file in tutorials
    git ls-tree -r --name-only HEAD | while read filename; do
        echo "$filename: $(git log -1 --format="%ad" -- $filename)" >> tutorialsModified.txt
        echo "$filename: $(git log -1 --diff-filter=A --format="%ad" -- $filename)" >> tutorialsCreated.txt
    done

    # Move the log files to the parent data dir
    mv tutorialsModified.txt ../tutorialsModified.txt
    mv tutorialsCreated.txt ../tutorialsCreated.txt
)
