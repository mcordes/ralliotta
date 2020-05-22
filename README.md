Alternative UI for Rally 


# Setup
1. Install docker / docker-compose 
2. Disable safe-write for your editor - https://parceljs.org/hmr.html#safe-write  (otherwise
   parcel's watcher gets confused)


# Running the application using docker and watcher

docker-compose build && docker-compose up
./bin/run_watcher.sh


# Making changes 

Changes made to the application should be immediately reflected in the docker container. In 
most cases restarting the application or running `docker-compose down` are unnecessary. 


# Troubleshooting

First try `docker-compose down` and then `docker-compose build && docker-compose up`.


# Connecting to the docker created mysql db

mysql -u root -p -h 127.0.0.1 -P 33306



# Delete all docker containers / images

* docker container ls  --all 2>&1 | tr -s ' ' | cut -d ' ' -f 1 | xargs docker container rm
* docker image ls  --all 2>&1 | tr -s ' ' | cut -d ' ' -f 3 | xargs docker image rm




