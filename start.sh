#!/bin/bash
# Startup script for Axilla on Raspberry Pi

# Ensure we have the dependencies installed
npm install

# Add increased logging for debugging
echo "Starting Axilla on $(uname -a)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Check if running on Raspberry Pi
if grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null || grep -q "BCM" /proc/cpuinfo 2>/dev/null; then
  echo "Running on Raspberry Pi"
  export IS_RASPBERRY_PI=true
fi

# Use the local pixlet binary if available
if command -v pixlet &> /dev/null; then
  echo "Using system-installed pixlet binary"
  export PIXLET_BINARY="pixlet"
  export PIXLET_BINARY_PATH=""
  if [ $NODE_ENV == "development"]; then
    echo "Running in development mode"
    export IS_DEV=true
    node server.js
  elif [ $NODE_ENV == "production"]; then
    echo "Running in production mode"
    export IS_DEV=false
    pm2 start server.js
  fi
  node server.js
else
  echo "No pixlet binary found in PATH, attempting to use included binaries"
  
  # Make executable and test each included binary
  chmod +x ./functions/axilla/pixlet/pixlet-*
  
  # Try pixlet-aws first
  if ./functions/axilla/pixlet/pixlet-aws version &> /dev/null; then
    echo "Successfully using pixlet-aws binary"
    export PIXLET_BINARY="pixlet-aws"
    export PIXLET_BINARY_PATH="./functions/axilla/pixlet/"
    export LD_LIBRARY_PATH="./functions/axilla/lib"
    
    # Add debugging for temp directory
    echo "Using temporary directory: $(node -e "console.log(require('os').tmpdir())")"
    
    # Start server with more verbose error reporting
    NODE_ENV=development node server.js
  # Try pixlet-github if pixlet-aws fails
  elif ./functions/axilla/pixlet/pixlet-github version &> /dev/null; then
    echo "Successfully using pixlet-github binary"
    export PIXLET_BINARY="pixlet-github"
    export PIXLET_BINARY_PATH="./functions/axilla/pixlet/"
    export LD_LIBRARY_PATH="./functions/axilla/lib"
    
    # Add debugging for temp directory
    echo "Using temporary directory: $(node -e "console.log(require('os').tmpdir())")"
    
    # Start server with more verbose error reporting
    NODE_ENV=development node server.js
  else
    echo "ERROR: Neither included pixlet binary works on this system"
    echo "Please install pixlet manually or check file permissions"
    exit 1
  fi
fi