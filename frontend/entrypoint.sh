#!/bin/bash
set -e

# Check NODE_ENV and run appropriate command
if [ "$NODE_ENV" = "production" ]; then
    echo "Starting in PRODUCTION mode..."
    echo "Building Angular application..."
    npm run build --configuration production

    echo "Installing serve package..."
    npm install -g serve

    echo "Serving production build on port 80..."
    serve -s dist/frontend/browser -l 80
else
    echo "Starting in DEVELOPMENT mode..."
    echo "Running Angular dev server on port 80..."
    npm start -- --host 0.0.0.0 --port 80
fi
