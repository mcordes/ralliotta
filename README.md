Alternative UI for Rally 


# Setup
1. Install docker / docker-compose 
2. Disable safe-write for your editor - https://parceljs.org/hmr.html#safe-write  (otherwise
   parcel's watcher gets confused)


# Running the application using docker and watcher

* docker-compose build 
* docker-compose up
* ./bin/run_watcher.sh
* Visit http://localhost:8000


# Making changes 

Changes made to the application should be immediately reflected in the docker container. In 
most cases restarting the application or running `docker-compose down` are unnecessary. 


# Troubleshooting

First try `docker-compose down` and then `docker-compose build && docker-compose up`.

