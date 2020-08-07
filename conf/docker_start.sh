#!/bin/sh
set -e 

# Start proxy we'll use to lookup the session id and avatar images
/app/bin/run_proxy.sh &


echo "Hello from Ralliotta!"
echo "Visit http://localhost:8088"


exec nginx -g 'daemon off;'
