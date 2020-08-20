#!/bin/sh

# Handle cloning or updating the tutorial data
(
    exists=$(if [ -d "./data/tutorials" ]; then echo 0; else echo 1; fi)
    isGit=$(if [ -d "./data/tutorials" ]; then (cd ./data/tutorials && git rev-parse --is-inside-work-tree >/dev/null 2>&1 && echo 0) || echo 1; else echo 1; fi)

    if [ $exists -eq 0 ] && [ $isGit -eq 0 ]; then
        # If the git repo is already there, just update it
        cd ./data/tutorials
        git fetch origin
        git reset --hard origin/master
    else
        if [ $exists -eq 0 ]; then
            # If not a git repo, but does exist, clean it
            rm -rf ./data/tutorials
        fi

        # Then, clone the new repo
        git clone https://github.com/cdnjs/tutorials.git ./data/tutorials
        cd ./data/tutorials
    fi

    # Log the commit
    echo "Tutorials at:"
    git log -n 1 | cat

    # Create empty modified/created log files
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
) &

# These run in parallel, so we need to wait for everything to complete
wait
