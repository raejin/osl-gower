var $ = require('jquery');
var React = require('react');
var clientId = '779073712236-2opgcmivjjmp7uj1aml9a14735vc1pmf.apps.googleusercontent.com';
var apiKey = 'AIzaSyDvNV9HrNNKUpFfhKSrj5NaqjPYQ_-Qozw';
var scopes = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/plus.me'];
var currentUser;

handleClientLoad = function () {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth,1);
}

checkAuth = function () {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true, authuser: -1}, handleAuthResult);
}

handleAuthResult = function (authResult) {
  if (authResult && !authResult.error) {
    makeApiCall();
  } else {
    // todo fail
    authorizeButton.onclick = handleAuthClick;
  }
}

handleAuthClick = function (event) {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false, authuser: -1}, handleAuthResult);
  return false;
}

// Load the API and make an API call.  Display the results on the screen.
makeApiCall = function () {
  gapi.client.load('plus', 'v1', function() {
    var request = gapi.client.plus.people.get({
      'userId': 'me'
    });
    request.execute(function(resp) {
      currentUser = resp;
      var heading = document.createElement('h4');
      var image = document.createElement('img');
      image.src = resp.image.url;
      heading.appendChild(image);
      heading.appendChild(document.createTextNode(resp.displayName));

      document.getElementById('content').appendChild(heading);
    });
  });
  gapi.client.load('calendar', 'v3', function () {
    console.log('calendar interface is loaded');
    var request = gapi.client.calendar.calendars.insert({
      'summary': 'Outside Lands Schedule'
    });
    request.execute(function(resp) {
      console.log(resp);
    });
  });
}

// onSignIn = function (googleUser) {
//   currentUser = googleUser;
//   currentUser.grant({
//     scope: 'https://www.googleapis.com/auth/calendar'
//   }).then(function () {
//     console.log('granted!', arguments);
//     console.log(googleUser.hasGrantedScopes('https://www.googleapis.com/auth/calendar'));
//   });
// }

// function createCalendar() {
//   $.ajax({
//     method: 'POST',
//     url: 'https://www.googleapis.com/calendar/v3/calendars',
//     data: 'Outside Lands Calendar',
//     withCredentials: true
//   }).then(function (calendar) {
//     console.log(calendar);
//   });
// }

var App = React.createClass({
  render: function () {
    return <div>
    <button id="authorize-butoon" onClick={handleAuthClick}>hey you</button>
    <div id="content"></div>
    </div>;
  }
});

React.render(<App/>, document.body);
