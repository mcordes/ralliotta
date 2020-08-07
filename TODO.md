
## TODO next:

- Finish sample data
   - build sample app script in site project
   - include link to sample site in site project
   - detail fields and comments look like they work, but aren't persisted
   - kanban needs work
- kanban
   - refesh iteration after adding / removing item from backlog
-site 
   - include email and more prose on site
- refreshing search page returns to default project (do any search request params work?)
- in mock rally server mode the avatar (and login) endpoints are still hitting the real rally. Fix me.
- search by text on the search page doesn't work very well. It's hitting the backend 
   multiple times and needs to be throttled / cancelled when you type more. Also 
   b/c there are multiple searches the same results get added more than once.
       * this shouldn't happen any more for the list pages, but be careful

- remove assignee from My work page? (or at least default it)
- clear button is broken on new item page (this seems to be an issue w/ the autocomplete drop downs again : (
- mock rally
- integration testing

- Finish Kanban (backlog, previous sprint and current sprint for now? with previous sprint collapsed, drag and dropping of items between backlog and iterations?)

- updating a comment works, but doesn't refresh the comment on the page

- Add / remove (?) attachment on the detail page 
- add attachments on new item page? (or just send them to the detail page?)






- ~~backlog isn't filtered by project still, fix me~~
- ~~make search pages populate URL parameters so you can bookmark / share searches with others~~
- ~~debounce calls to rally so we don't call them so often (particularly on search filters)~~
- ~~Fix backlog query - should just show items with a null iteration.~~
- ~~urls get messed up after going to detail page and back if you're using # history mode in the browser - just needs to check config~~
- ~~modal details~~
- ~~fix select fields~~
- ~~? can we do partial matches when searching by formatted id? do we want to?~~
- ~~better text editor - joda3 looks good~~
- ~~? link to rally item page from our detail page?~~
- ~~Cancelling a select box selection resets the r/o version, but not the editable version (it still shows the value I selcted before cancelling)~~
- ~~Detail page doesn't refresh when formatted id is changed in URL~~
- ~~adding a new comment didn't create a new empty box to add a future comment in~~
- ~~Need better searchable combo box for (all?) drop downs on detail page~~
    - ~~must be mobile friendly too~~
- ~~Add new user story / defect ~~
    - ~~adam says just the following fields:~~
       - ~~project drop down defaulted to user's current project?~~
       - ~~Name (aka Title)~~
       - ~~Attachments~~
       - ~~Description~~
       - ~~Release (optional) - could just show future released?~~
       - ~~Epic / Parent - popup  with epic search (epic is a type of userstory?)~~
       - ~~Maybe double click on item in backlog moves it to current iteration (with confirmation message) and reverse by clicking on item in current sprint?~~
       - ~~Success dialog modal with ~~
           - ~~link to created item in new window~~
           - ~~buttons - create another / take me to it~~
~~
- ~~TextAreaInput - fix me - I don't seem to understand PropSync and how to have components talk to eachother using it. It's not propagating the changes back to parent views. Should it? Am I using it incorrectly or does my understanding of what it does not match reality?~~
- ~comments - wysiwyg editor and display (like Description field on detail page)~
- ~~change assignee on detail page to a user or no one~~
- ~~verify select boxes save on details page~~
  ~~? why do they show the old value after?~~
- ~~Add 'My notifications' to the home page.~~
    - ~~It seems to just be the more recent comments for the entire project~~
    - ~~Maybe also provide a way to filter to artifacts owned by my user~~
- ~~make search by id case insensitive and use contains rather than exact equal~~
- ~~BUG : handle items with null iteration on details page (and null any other field there too)~~

- ~fix this warning - Avoid mutating a prop directly since the value will be overwritten whenever the parent component re-renders. Instead, use a data or computed property based on the prop's value. Prop being mutated: "isExpanded" ~
    - ~This is the same as: Fix @Prop vs @Propsync warnings. There's one one on the expandable thingey. Click it and see. Also EditableSelect has a few warnings. ~
   - ~Eureka! I found it. The rules seem to be:~
   - ~1. use Prop (not PropSync - until we figure out it's secrets) (e.g. showXX)~
   - ~2. Then in the view have a separate data property (e.g. isShowXX) set from the Prop value in created()~
   - ~3. Then just use the data attribute and never touch the Prop again~

- ~Add search filters to ItemList page ~
  - ~Project~
  - ~Owner (assignee)~
  - ~Name / Description~
  - ~Release~
  - ~Iteration~
  - ~ScheduleState / FlowState? ~

- ~Add project drop down to list page / my items~
    - ~default to my default project on the list page and no / all projects on my items?~

- ~Take user back to login page when session token expires (probably just need to set store.clearUser())~
    ? ~Amaybe go the lazy way and just watch for 401s. If we get one take them to the login page?~
- ~The previous iteration on the kanban page is wrong (it's showing the current iteration also)~
- ~Fix search by iteration on item list page~
- ~~List page - sort by a few fields? user, created, last updated. Anything else?~~



## Future:

- Attachments / non-image attachments
- kanban page improvements
   - show optional future sprint? 
   - What if an iteration has the start date of anothers end date?
   - Have easy way to add backlog items to the current iteration (button with confirmation and way to skip confirmation by holding shift key? and clicking button
   - start with backlog minimized (unless current sprint has few items?)
   - show the total story points / iteration (and having count increase as you're adding items from backlog)
   - show story points for each user story / defect / whatever with a simple running total that's easily visible when viewing the backlog

- catch js errors in the app and report them back to us?

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
- SSO - https://stackoverflow.com/questions/21055043/how-to-sso-using-rally-restapi-dll/22102310#22102310
- remove jodit-vue and use latest version of jodit (or another editor)

  
