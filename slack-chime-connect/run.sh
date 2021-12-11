#!/bin/bash

set -xeo pipefail

MEETING_URL=${MEETING_URL}
BUCKET_ARN=${BUCKET_ARN}
BUCKET_NAME=${BUCKET_NAME}
SCREEN_WIDTH=${RECORDING_SCREEN_WIDTH:-'1280'}
SCREEN_HEIGHT=${RECORDING_SCREEN_HEIGHT:-'960'}
SCREEN_RESOLUTION=${SCREEN_WIDTH}x${SCREEN_HEIGHT}
COLOR_DEPTH=24
X_SERVER_NUM=1
# S3_BUCKET_NAME=${RECORDING_ARTIFACTS_BUCKET}



# Start PulseAudio server so Firefox will have somewhere to which to send audio
pulseaudio -D --exit-idle-time=-1
pacmd load-module module-virtual-sink sink_name=v1  # Load a virtual sink as `v1`
pacmd set-default-sink v1  # Set the `v1` as the default sink device
pacmd set-default-source v1.monitor  # Set the monitor of the v1 sink to be the default source

# Start X11 virtual framebuffer so Firefox will have somewhere to draw
# Xvfb :${X_SERVER_NUM} -ac -screen 0 ${SCREEN_RESOLUTION}x${COLOR_DEPTH} > /dev/null 2>&1 &
Xvfb :${X_SERVER_NUM} -ac -screen 0 ${SCREEN_RESOLUTION}x${COLOR_DEPTH} &
sleep 0.5  # Ensure this has started before moving on

export DISPLAY=:${X_SERVER_NUM}.0
export ELECTRON_ENABLE_LOGGING=1
export CODE=${CODE} 
export UUID=${UUID} 
export MEETING_NAME=${MEETING_NAME} 
export ATTENDEE_ID=${ATTENDEE_ID} 
export RESTAPI_ENDPOINT=${RESTAPI_ENDPOINT}
export BUCKET_NAME=${BUCKET_NAME}
export BUCKET_ARN=${BUCKET_ARN}

export CODE=93d0b3
export UUID=353a2a26-4feb-47a7-a1df-405831ec2016
export MEETING_NAME=among
export ATTENDEE_ID=40e9a4da-6dce-55a5-2805-34f8b3c6eaed 
export RESTAPI_ENDPOINT=https://mlcy0ifh4a.execute-api.us-east-1.amazonaws.com/prod/ 
export BUCKET_NAME=f-backendstack-bucket
export BUCKET_ARN=arn:aws:s3:::f-backendstack-bucket



echo "PPPPPOOOOORTRRRRTTT"
echo ${PORT}

electron app --no-sandbox

#exec node /recording/dist/index.js ${MEETING_URL} ${BUCKET_NAME} ${SCREEN_WIDTH} ${SCREEN_HEIGHT}

