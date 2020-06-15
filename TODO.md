
## TODO next:

1. verify select boxes save on details page
   ? why do they show the old value after?
2. make search by id case insensitive and use contains rather than exact equal
3. refreshing page (other than the root) doesn't work when deployed in google. Switch to # routing mode?



V0:

* Add search filters to ItemList page 
  * Project
  * Owner (assignee)
  * Name / Description
  * Release
  * Iteration
  * Milestone?
  * ScheduleState / FlowState? 
* login by api key in addition to username / password?




Future:

* detail page is a modal and exiting from it returns you to the list page? [MattC]

* caching
    - domain data
    - inital user lookup
* domain data 
    - users
    - projects 
    - iterations
    - etc
* show user related tasks on the story detail page
   ? can any other type have sub-types? 
   ? can defects have tasks?
* show tasks differenty in search results?   
* implement @username lookups and notifications in comments and description
   - maybe add users as watchers of the item (if possible)
* Monitor when session token will expire and warn user before hand
* Take user back to login page when session token expires (probably just need to set store.clearUser())
    ? maybe go the lazy way and just watch for 401s. If we get one take them to the login page?

6. SSO - https://stackoverflow.com/questions/21055043/how-to-sso-using-rally-restapi-dll/22102310#22102310

  
