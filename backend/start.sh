#!/bin/bash
cd /home/jalal/Desktop/BridgeFlow/backend
export SENSOR_API_KEY="$(cat /home/jalal/Desktop/BridgeFlow/backend/.sensor_key)"
export GOOGLE_APPLICATION_CREDENTIALS="/home/jalal/Desktop/BridgeFlow/backend/service-account.json"
exec node server.js
