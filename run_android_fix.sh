#!/bin/bash

# Android Fix & Rebuild Script
# This script performs a deep clean and rebuild of all three mobile apps
# to resolve native module linking issues like RNCDatePicker errors.

# Configuration
ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="/opt/homebrew/bin:/usr/local/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
AVD_NAME="Pixel_6a_API_30"
ROOT_DIR=$(pwd)

mkdir -p "$ROOT_DIR/logs"

# 1. Start Emulator if not running
echo "Checking Android Emulator status..."
if ! adb devices | grep -q "device$"; then
    echo "Starting Emulator ($AVD_NAME)..."
    nohup emulator -avd "$AVD_NAME" -no-snapshot-load > "$ROOT_DIR/logs/emulator_fix.log" 2>&1 &
    echo "Waiting for emulator to be ready..."
    adb wait-for-device
    while [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" != "1" ]; do
        echo "  Still waiting for boot..."
        sleep 5
    done
    echo "Emulator is ready!"
else
    echo "Emulator is already running."
fi

# Function to clean and build an app
clean_and_build() {
    local APP_DIR=$1
    local APP_NAME=$2
    local PORT=$3
    local LOG_FILE="$ROOT_DIR/logs/fix_${APP_NAME}.log"

    echo "------------------------------------------------"
    echo "Processing $APP_NAME..."
    echo "1. Cleaning Gradle..."
    (cd "$ROOT_DIR/$APP_DIR/android" && ./gradlew clean > "$LOG_FILE" 2>&1)
    
    echo "2. Building and Installing on Android..."
    # Launching Metro in background with reset-cache
    (cd "$ROOT_DIR/$APP_DIR" && nohup npm start -- --reset-cache --port $PORT > "$ROOT_DIR/logs/metro_${APP_NAME}.log" 2>&1 &)
    
    echo "3. Building APK and Installing..."
    (cd "$ROOT_DIR/$APP_DIR" && npm run android -- --port $PORT >> "$LOG_FILE" 2>&1)
    
    echo "$APP_NAME installation complete."
}

# Execute sequential builds
clean_and_build "zipplyRider" "rider" 8081
clean_and_build "zippyTrainer" "trainer" 8082
clean_and_build "zippyVat" "vat" 8083

echo "------------------------------------------------"
echo "Deep Clean and Rebuild finished for all three apps!"
echo "Please check the emulator for the launched applications."
echo "Logs: logs/fix_*.log and logs/metro_*.log"
echo "------------------------------------------------"
