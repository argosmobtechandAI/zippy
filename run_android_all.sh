#!/bin/bash

# Android Multi-App Runner
# This script starts the Android emulator and installs/runs all three mobile apps.

# Configuration
ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="/opt/homebrew/bin:/usr/local/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
AVD_NAME="Pixel_6a_API_30"
ROOT_DIR=$(pwd)

mkdir -p "$ROOT_DIR/logs"

echo "Starting Android Emulator ($AVD_NAME)..."
nohup emulator -avd "$AVD_NAME" -no-snapshot-load > "$ROOT_DIR/logs/emulator.log" 2>&1 &

echo "Waiting for emulator to be ready..."
adb wait-for-device
while [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" != "1" ]; do
    echo "  Still waiting for boot..."
    sleep 5
done
echo "Emulator is ready!"

echo "Building and installing Rider app (zipplyRider)..."
(cd "$ROOT_DIR/zipplyRider" && npm run android > "$ROOT_DIR/logs/android_rider.log" 2>&1)
echo "Rider app installed."

echo "Building and installing Trainer app (zippyTrainer)..."
(cd "$ROOT_DIR/zippyTrainer" && npm run android > "$ROOT_DIR/logs/android_trainer.log" 2>&1)
echo "Trainer app installed."

echo "Building and installing Vat app (zippyVat)..."
(cd "$ROOT_DIR/zippyVat" && npm run android > "$ROOT_DIR/logs/android_vat.log" 2>&1)
echo "Vat app installed."

echo "------------------------------------------------"
echo "All three Android apps have been built and installed!"
echo "Check the device to see them in action."
echo "Logs are available in 'logs/android_*.log'"
echo "------------------------------------------------"
