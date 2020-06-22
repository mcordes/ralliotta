
## TODO next:

- fix this warning - Avoid mutating a prop directly since the value will be overwritten whenever the parent component re-renders. Instead, use a data or computed property based on the prop's value. Prop being mutated: "isExpanded" 

- Finish Kanban (backlog, previous sprint and current sprint for now? with previous sprint collapsed, drag and dropping of items between backlog and iterations?)

- Add project drop down to list page / my items
    - default to my default project on the list page and no / all projects on my items?

- List page - sort by a few fields? user, created, last updated. Anything else?

- Add / remove (?) attachment on the detail page 

- Add new user story / defect 
    - adam says just the following fields:
       - Name (aka Title)
       - Attachments
       - Description
       - Release (optional) - could just show future released?
       - Epic / Parent (these two fields have some weird magic together. Adam says you set parent, but somehow that also sets Epic?)

- Need better searchable combo box for (all?) drop downs on detail page
    - must be mobile friendly too

- comments - wysiwyg editor and display (like Description field on detail page) 

- Add search filters to ItemList page 
  - Project
  - Owner (assignee)
  - Name / Description
  - Release
  - Iteration
  - Milestone?
  - ScheduleState / FlowState? 

- Fix @Prop vs @Propsync warnings. There's one one on the expandable thingey. Click it and see. Also EditableSelect has a few warnings. 


- ~~change assignee on detail page to a user or no one~~
- ~~verify select boxes save on details page~~
  ~~? why do they show the old value after?~~
- ~~Add 'My notifications' to the home page.~~
    - ~~It seems to just be the more recent comments for the entire project~~
    - ~~Maybe also provide a way to filter to artifacts owned by my user~~
- ~~make search by id case insensitive and use contains rather than exact equal~~
- ~~BUG : handle items with null iteration on details page (and null any other field there too)~~


## Future:


- Have current iteration / release preselected when on detail page when selecting a value from the drop down and there is no existing value. Also maybe hide old iterations / releases or sort them differently or in a different color? 

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

  
