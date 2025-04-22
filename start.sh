#!/bin/bash
# Startup script for Axilla on Raspberry Pi

# Ensure we have the dependencies installed
npm install

# Use the local pixlet binary if available
if [ -f "$(which pixlet)" ]; then
  echo "Using system-installed pixlet binary"
  export PIXLET_BINARY="pixlet"
  export PIXLET_BINARY_PATH=""
  export IS_DEV=true
  node server.js
else
  echo "No pixlet binary found in PATH, attempting to use included binaries"
  # Check if we have permission to execute the included pixlet binaries
  chmod +x ./functions/axilla/pixlet/pixlet-*
  export PIXLET_BINARY="pixlet-aws"  
  export PIXLET_BINARY_PATH="./functions/axilla/pixlet/"
  export LD_LIBRARY_PATH="./functions/axilla/lib"
  node server.js
fi