

## DOCS: 

* Schema documentation - https://rally1.rallydev.com/slm/doc/webservice/index.jsp
* Schema for cashstar project - https://rally1.rallydev.com/slm/schema/v2.0/project/353652948212/b539c70b2e971ff9e203e094e0b21ee1
* https://github.com/RallyTools/rally-node/wiki/User-Guide


## TIPS:

1. For older versions of rally's API CORS is misconfigured for pre-flight requests. For instance a GET here works, but OPTIONS (used for preflight by the browser) doesn't return the Access-Control-Allow-Origin header and the browser won't even make the request from ajax
https://rally1.rallydev.com/slm/webservice/1.43/user.js?start=1&pagesize=2

2. May need to set this when sending username / password to rally:
  restApi.request._requestOptions['auth'].sendImmediately = true;


## OK resources:

1. https://github.com/jkamenik/Rally-CLI

