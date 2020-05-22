#!/bin/sh


# TODO-mrc: OSX doesn't have the -r flag for xargs
#docker exec -it rally2_server_1 /bin/sh -c "ps aux | grep parcel | grep -v grep | awk '{print $1}' | xargs -r kill"

docker exec -it rally-alt_server_1 /bin/sh -c "cd /app && npm run watch"

