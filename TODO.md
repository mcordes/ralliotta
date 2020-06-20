
## TODO next:

- change assignee on detail page (and assign to no one)

- Finish Kanban (backlog, previous sprint and current sprint for now? with previous spring collapsed)

- Add project drop down to list page / my items
    - default to my default project on the list page and no / all projects on my items?

- List page - sort by a few fields? user, created, last updated. Anything else?

- BUG : handle items will null iteration on details page (and null any other field there too)

- Need better searchable combo box for (all?) drop downs on detail page
    - must be mobile friendly too

- verify select boxes save on details page
   ? why do they show the old value after?
- make search by id case insensitive and use contains rather than exact equal

- Add search filters to ItemList page 
  - Project
  - Owner (assignee)
  - Name / Description
  - Release
  - Iteration
  - Milestone?
  - ScheduleState / FlowState? 

- Add 'My notifications' to the home page.
    - collapsible (and start collapsed?)
    - It seems to just be the more recent comments for the entire project
    - Maybe also provide a way to filter to artifacts owned by my user




## Future:

- login by api key in addition to username / password?
- detail page is a modal and exiting from it returns you to the list page? [MattC]
- caching
    - domain data
    - inital user lookup
- domain data 
    - users
    - projects 
    - iterations
    - etc
- show user related tasks on the story detail page
   ? can any other type have sub-types? 
   ? can defects have tasks?
- show tasks differenty in search results?   
- implement @username lookups and notifications in comments and description
   - maybe add users as watchers of the item (if possible)
- Monitor when session token will expire and warn user before hand
- Take user back to login page when session token expires (probably just need to set store.clearUser())
    ? maybe go the lazy way and just watch for 401s. If we get one take them to the login page?

- SSO - https://stackoverflow.com/questions/21055043/how-to-sso-using-rally-restapi-dll/22102310#22102310

  
