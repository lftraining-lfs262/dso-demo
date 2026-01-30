#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Compiling TypeScript..."
npx tsc

echo "Bundling with ncc..."
npx ncc build src/index.ts -o dist --minify

echo "Build complete: dist/index.js"
