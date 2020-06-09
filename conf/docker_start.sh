#!/bin/sh
set -e 

# wait for the database
while ! nc -z "$DB_HOST" 3306; do
    echo "Waiting a few moments for db: $DB_HOST"
    sleep 3
done


# Start proxy we'll use to lookup the session id and avatar images
/app/bin/run_proxy.sh &


exec nginx -g 'daemon off;'
