#!/bin/bash

# Zippy Ecosystem Runner
# This script starts the backend, admin panel, and three mobile app Metro bundlers.

# Set the root directory
ROOT_DIR=$(pwd)

# Ensure Homebrew and common paths are in PATH
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# Kill existing processes on target ports to allow a fresh start
echo "Cleaning up existing processes on ports 3000, 5173, 8081, 8082, 8083..."
lsof -ti :3000,5173,8081,8082,8083 | xargs kill -9 2>/dev/null

mkdir -p "$ROOT_DIR/logs"

echo "Starting Backend (Port 3000)..."
(cd "$ROOT_DIR/ZipppybackendNEw" && nohup npm run dev > "$ROOT_DIR/logs/backend.log" 2>&1 &)

echo "Starting Admin Panel (zippyStable)..."
(cd "$ROOT_DIR/zippyStable" && nohup npm run dev > "$ROOT_DIR/logs/admin.log" 2>&1 &)

echo "Starting Rider Metro (Port 8081)..."
(cd "$ROOT_DIR/zipplyRider" && nohup npm start -- --port 8081 > "$ROOT_DIR/logs/rider.log" 2>&1 &)

echo "Starting Trainer Metro (Port 8082)..."
(cd "$ROOT_DIR/zippyTrainer" && nohup npm start -- --port 8082 > "$ROOT_DIR/logs/trainer.log" 2>&1 &)

echo "Starting Vat Metro (Port 8083)..."
(cd "$ROOT_DIR/zippyVat" && nohup npm start -- --port 8083 > "$ROOT_DIR/logs/vat.log" 2>&1 &)

echo "------------------------------------------------"
echo "All services started in the background!"
echo "Logs are available in the 'logs/' directory:"
echo "  - Backend: logs/backend.log"
echo "  - Admin:   logs/admin.log"
echo "  - Rider:   logs/rider.log"
echo "  - Trainer: logs/trainer.log"
echo "  - Vat:     logs/vat.log"
echo "------------------------------------------------"
echo "Backend: http://localhost:3000"
echo "Admin:   http://localhost:5173"
echo "------------------------------------------------"
