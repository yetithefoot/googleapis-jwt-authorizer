GAPI Service account authorizer
===
Provides auto authorization for googleapis.

Usage:
---
```javascript
var googleapis = require('googleapis'); // enable gapi client
var drive = googleapis.drive('v3'); // enable drive api

// enable auto authorizer
var authorizer = require('googleapis-jwt-authorizer');
authorizer.init({
    googleapis:googleapis, // pass gapi instance to authorizer
    key: '/absolute/path/to/google/servcieaccount/pem/keyfile',
    email: 'abc-xyz@developer.gserviceaccount.com',
    scopes: ['https://www.googleapis.com/auth/drive']
});

// every success auth attempt 
authorizer.events.on('authorized', auth = {
    console.log('Authorized! =)')
});
```



