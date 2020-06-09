#!/bin/sh
set -e 

# Start proxy we'll use to lookup the session id and avatar images
/app/bin/run_proxy.sh &


exec nginx -g 'daemon off;'
