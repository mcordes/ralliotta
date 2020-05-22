
## TODO next:


* detail page is a modal and exiting from it returns you to the list page?   
* organize fields better 
    ? do we want fully defined models or just bags of fields? 
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



## Future

1. show all fields (mostly hidden by default)
2. get project schema information ??  [might not need this]
5. move to the top of the page when navigating
6. SSO - https://stackoverflow.com/questions/21055043/how-to-sso-using-rally-restapi-dll/22102310#22102310

  