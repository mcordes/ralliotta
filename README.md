Ralliotta
-----------

A FREE, streamlined and easy to use alternative UI to Broadcom's [Rally](https://www.broadcom.com/products/software/agile-development/rally-software). Enjoy viewing all your existing Rally data in a format that is pleasant to use, straightforward and heavily simplified for common use cases. 


I'm an end user, how do I use this? 
-----------

The easiest way is to use our hosted version at [https://ralliotta.com](https://ralliotta.com). It's *FREE*, secure and give you instant access to your existing Rally data. 

The other option is to run this application locally using docker like so:

* Install docker / docker-compose 
* git clone https://github.com/mcordes/ralliottta.git
* cd ralliotta
* docker-compose build 
* docker-compose up
* Visit http://localhost:8088

That's it. Now you have your own wonderful Rally UI running locally on your computer!


I'm a developer and I want to contribute.
-----------

Fantastic! The application is written in [Typescript](https://www.typescriptlang.org/) and the code is pragmatic and relatively well documented. We strive for simplicity and self documenting code as much as possible. 

Follow these steps to get the application running on your machine for development:

* Install docker / docker-compose 
* git clone https://github.com/mcordes/ralliottta.git
* cd ralliotta
* docker-compose build 
* docker-compose up
* Visit http://localhost:8088

And these additional steps (development only - these aren't needed if you just want to run / use the application):

* Disable safe-write for your editor - https://parceljs.org/hmr.html#safe-write  (We use parcel to build / bundle the files and this is a current requirement of Parcels watcher process)
* ./ralliotta/bin/run_watcher.sh
* Make changes to *.ts and *.vue files and the watcher will rebuild them in the background making development a snap!


Why did you make this? 
-----------

Rally's UI is pretty dated and not very cohesive or user friendly. In fact after my company switched to Rally we had a few people quit in protest. This is an attempt to reimagine Rally in a modern user-friendly format similar to other existing issue tracking / scrum / kanban tools and to filter out the cruft, silly options and strange UI choices.  

We use the very functional [rally-node](https://github.com/RallyTools/rally-node) library to talk to their API. It's 

I'll admit this is a strange passion project, but in the spirit of Open source software we're scratching our own itch. Maybe you'll find it useful too.


Troubleshooting
-----------

First try `docker-compose down` and then `docker-compose build && docker-compose up`.

The application runs on ports 8088 and 8089. Verify these are free. You can change them in docker-compose.yml
