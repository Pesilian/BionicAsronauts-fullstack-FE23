#!/bin/bash

# Directory to search for CSS files
DIRECTORY="/Users/tor_skola/Desktop/BionicAsronauts-fullstack-FE23/potatogo/src"

# Find all .css files that are not already module files
find "$DIRECTORY" -type f -name "*.css" ! -name "*.module.css" | while read -r FILE; do
  # Get the directory and filename without extension
  DIR=$(dirname "$FILE")
  BASENAME=$(basename "$FILE" .css)

  # New filename with .module.css extension
  NEW_FILE="$DIR/$BASENAME.module.css"

  # Rename the file
  mv "$FILE" "$NEW_FILE"

  # Update imports in .tsx and .ts files
  grep -rl --include=\*.{tsx,ts} "$BASENAME.css" "$DIRECTORY" | while read -r TS_FILE; do
    sed -i '' "s|$BASENAME.css|$BASENAME.module.css|g" "$TS_FILE"
    sed -i '' "s|import './$BASENAME.module.css'|import styles from './$BASENAME.module.css'|g" "$TS_FILE"
  done
done