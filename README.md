Ralliotta
-----------

A FREE, streamlined and easy to use alternative UI for Broadcom's [Rally](https://www.broadcom.com/products/software/agile-development/rally-software). Enjoy viewing all your existing Rally data in a format that is pleasant to use, straightforward and heavily simplified for common use cases. 

What's the status of this?
-----------

Definitely BETA. Some things are incomplete and there will be bugs. What is there now is quite useable, but YMMV depending upon your organization's Rally configuration. If something doesn't work for you or our assumptions aren't true for your organization either let us know at ralliotta.app@gmail.com, via a github issue or (if you're a hero) create a pull request. 


I'm an end user, how do I use this? 
-----------

Run this application locally using docker like so:

* Install docker / docker-compose 
* git clone https://github.com/mcordes/ralliottta.git
* cd ralliotta
* docker-compose build 
* docker-compose up
* Visit http://localhost:8088

That's it. Now you have your own wonderful Rally UI running locally on your computer!


I'm a developer and I want to contribute.
-----------

Fantastic! The application is written in [Typescript](https://www.typescriptlang.org/) and [Vue.js](https://vuejs.org/). The code is pragmatic and relatively well documented. We strive for simplicity and self documenting code as much as possible. 

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

I'll admit this is a strange passion project, but in the spirit of Open source software we're scratching our own itch. Maybe you'll find it useful too.



Troubleshooting
-----------

First try `docker-compose down` and then `docker-compose build && docker-compose up`.

The application runs on ports 8088 and 8089. Verify these are free. You can change them in docker-compose.yml.



Like what we're doing? 
------------

<a href="https://www.buymeacoffee.com/ralliotta" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
