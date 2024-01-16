#!/bin/bash

if [ "$CF_PAGES_BRANCH" == "develop" ]; then
    echo "Running develop build"
    npm run staging
else
    echo "Running production build"
    npm run production
fi