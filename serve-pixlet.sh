#!/bin/bash
# Script to serve Pixlet files for preview
# Usage: ./serve-pixlet.sh [folder] [filename]
# Example: ./serve-pixlet.sh todoist todoist.star

# Set default values
ASSETS_DIR="functions/axilla/assets"
DEFAULT_FOLDER="default"
DEFAULT_FILE="default.star"

# Parse command line arguments
FOLDER=${1:-$DEFAULT_FOLDER}
FILE=${2:-$DEFAULT_FILE}

# If only one argument is provided, treat it as the folder name
if [ $# -eq 1 ]; then
  FOLDER=$1
  # Try to find a file with the same name as the folder
  if [ -f "$ASSETS_DIR/$FOLDER/$FOLDER.star" ]; then
    FILE="$FOLDER.star"
  else
    # Find the first .star file in the folder
    FIRST_FILE=$(find "$ASSETS_DIR/$FOLDER" -name "*.star" -type f | head -n 1 2>/dev/null)
    if [ -n "$FIRST_FILE" ]; then
      FILE=$(basename "$FIRST_FILE")
    fi
  fi
fi

# Full path to the star file
STAR_PATH="$ASSETS_DIR/$FOLDER/$FILE"

# Check if file exists
if [ ! -f "$STAR_PATH" ]; then
  echo "Error: File not found: $STAR_PATH"
  echo "Available folders:"
  ls -1 "$ASSETS_DIR"
  exit 1
fi

# Determine which pixlet binary to use
if command -v pixlet &> /dev/null; then
  echo "Using system-installed pixlet binary"
  PIXLET_CMD="pixlet"
elif [ -x "./functions/axilla/pixlet/pixlet-aws" ]; then
  echo "Using pixlet-aws binary"
  PIXLET_CMD="./functions/axilla/pixlet/pixlet-aws"
  export LD_LIBRARY_PATH="./functions/axilla/lib"
elif [ -x "./functions/axilla/pixlet/pixlet-github" ]; then
  echo "Using pixlet-github binary"
  PIXLET_CMD="./functions/axilla/pixlet/pixlet-github"
  export LD_LIBRARY_PATH="./functions/axilla/lib"
else
  echo "Error: No pixlet binary found. Please install pixlet or ensure binaries are executable."
  exit 1
fi

echo "Serving $FOLDER/$FILE at http://localhost:8080"
$PIXLET_CMD serve "$STAR_PATH"