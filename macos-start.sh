#!/bin/bash
# Startup script for Axilla on macOS

# Ensure we have the dependencies installed
npm install

# Check if pixlet is installed via Homebrew
if command -v pixlet &> /dev/null; then
  echo "Found pixlet in PATH, using system pixlet"
  export PIXLET_BINARY="pixlet"
  export PIXLET_BINARY_PATH=""
  export IS_DEV=true
  NODE_ENV=development node server.js
else
  # If pixlet is not installed, prompt the user to install it
  echo "Pixlet not found in PATH. For macOS, you need to install pixlet."
  echo "You can install it using Homebrew:"
  echo "  brew tap tidbyt/tidbyt"
  echo "  brew install pixlet"
  echo ""
  echo "After installing pixlet, run this script again."
  exit 1
fi