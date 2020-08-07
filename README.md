A FREE, streamlined and easy to use alternative UI to Broadcom's [Rally](https://www.broadcom.com/products/software/agile-development/rally-software). Enjoy viewing all your existing Rally data in a format that is pleasant to use, straightforward and heavily simplified for common use cases. 


# I'm an end user, how do I use this? 

The easiest way is to use our hosted version at [https://ralliotta.com](https://ralliotta.com). It's *FREE*, secure and give you instant access to your existing Rally data. 

The other option is to run this application locally using docker like so:

* Install docker / docker-compose 
* git clone https://github.com/mcordes/ralliottta.git
* cd ralliotta
* docker-compose build 
* docker-compose up
* Visit http://localhost:8000

That's it. Now you have your own wonderful Rally UI running locally on your computer!


# I'm a developer and I want to contribute.

Fantastic! The application is written in [Typescript](https://www.typescriptlang.org/) and the code is pragmatic and relatively well documented. We strive for simplicity and self documenting code as much as possible. 

Follow these steps to get the application running on your machine for development:

* Install docker / docker-compose 
* git clone https://github.com/mcordes/ralliottta.git
* cd ralliotta
* docker-compose build 
* docker-compose up
* Visit http://localhost:8000

And these additional steps (development only - these aren't needed if you just want to run / use the application):

* Disable safe-write for your editor - https://parceljs.org/hmr.html#safe-write  (We use parcel to build / bundle the files and this is a current requirement of Parcels watcher process)
* ./ralliotta/bin/run_watcher.sh
* Make changes to *.ts and *.vue files and the watcher will rebuild them in the background making development a snap!


# Troubleshooting

First try `docker-compose down` and then `docker-compose build && docker-compose up`.

