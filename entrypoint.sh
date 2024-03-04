#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  echo "Running Production Build"
  node dist/main
else
  echo "Running Development Server"
  npx nest start --watch
fi

