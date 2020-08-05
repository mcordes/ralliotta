#!/bin/sh
set -e 

# Start proxy we'll use to lookup the session id and avatar images
/app/bin/run_proxy.sh &

# Start up mock rally endpoint (only used if the UI is also in mock rally mode)
/app/bin/run_mockrally.sh &


echo "Hello from Ralliotta!"
echo "Visit http://localhost:8000"


exec nginx -g 'daemon off;'
