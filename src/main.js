var $ = require('jquery');
var _ = require('lodash');
var Moment = require('moment');
var React = require('react');
var clientId = '779073712236-2opgcmivjjmp7uj1aml9a14735vc1pmf.apps.googleusercontent.com';
var apiKey = 'AIzaSyDvNV9HrNNKUpFfhKSrj5NaqjPYQ_-Qozw';
var scopes = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/plus.me'];
var fullCalendar = require('fullcalendar');
var oslSchedule = require('lineup.json');
var saveAs = require('filesaver.js');
var icalendar = require('icalendar');
var currentUser;
var selectedBand = [];

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

  var newCalendarId;

  gapi.client.load('calendar', 'v3', function () {
    console.log('calendar interface is loaded');
    var request = gapi.client.calendar.calendars.insert({
      'summary': 'Outside Lands Schedule - ' + Moment().format('YYYY-MM-DD')
    });
    request.execute(function(resp) {
      newCalendarId = resp.id;

      var events = _.flatten(oslSchedule.map(function (daySchedule) {
        return _.flatten(daySchedule.stages.map(function (stageSchedule) {
          return stageSchedule.schedule.map(function (act) {
            return {
              start: {
                dateTime: Moment(daySchedule.date + ' ' + act.start + 'pm',
                  'YYYY-MM-DD hA').format()
              },
              end: {
                dateTime: Moment(daySchedule.date + ' ' + act.end + 'pm',
                  'YYYY-MM-DD hA').format()
              },
              location: stageSchedule.name,
              summary: act.name
            }
          });
        }));
      }));

      var requests = events.map(function (e) {
        return gapi.client.calendar.events.insert({
          calendarId: newCalendarId,
          resource: e,
        });
      });

      _.chunk(requests, 3).forEach(function (x, i) {
        _.delay(function (x) {
          x.forEach(function (req) {
            req.execute();
          });
        }, 1500 * i, x);
      });

    })
  });
}

function createiCal() {
  var ical = new icalendar.iCalendar();

  oslSchedule.forEach(function (daySchedule) {
    daySchedule.stages.forEach(function (stageSchedule) {
      _.filter(stageSchedule.schedule, function (act) {
        return _.includes(selectedBand, act.name);
      }).forEach(function (act) {
        var icalEvent = ical.addComponent('VEVENT');
        icalEvent.setSummary(act.name);
        icalEvent.setLocation(stageSchedule.name);
        icalEvent.setDate(Moment(daySchedule.date + ' ' + act.start + 'pm',
              'YYYY-MM-DD hA').toDate(), Moment(daySchedule.date + ' ' + act.end + 'pm',
              'YYYY-MM-DD hA').toDate());
      });
    });
  });
  var blob = new Blob([ical.toString()], {type: 'text/calendar;charset=utf-8'});
  saveAs.saveAs(blob, 'Outside-Lands-Cal.ics');
}


var App = React.createClass({
  render: function () {
    return <div>
    <button id="ical" onClick={createiCal}>create iCal</button>
    <div id="content"></div>
    <div id="calendar"></div>
    </div>;
  }
});

React.render(<App/>, document.body);

$(document).ready(function () {
  var events = _.flatten(oslSchedule.map(function (daySchedule) {
      return _.flatten(daySchedule.stages.map(function (stageSchedule) {
        return stageSchedule.schedule.map(function (act) {
          return {
            start: Moment(daySchedule.date + ' ' + act.start + 'pm',
                'YYYY-MM-DD hA').format(),
            end: Moment(daySchedule.date + ' ' + act.end + 'pm',
                'YYYY-MM-DD hA').format(),
            title: act.name
          }
        });
      }));
    }));
  $('#calendar').fullCalendar({
    header: {
      center: 'agendaThreeDay' // buttons for switching between views
    },
    defaultView: 'agendaThreeDay',
    defaultDate: '2015-08-07',
    views: {
      agendaThreeDay: {
          type: 'agenda',
          duration: { days: 3 },
          buttonText: '3 day'
      }
    },
    events: events,
    eventClick: function(calEvent) {
      $(this).toggleClass('selected');
      if (_.includes(selectedBand, calEvent.title)) {
        selectedBand = _.remove(selectedBand, function (ev) {
          return _.includes(selectedBand, calEvent.title);
        });
      } else {
        selectedBand.push(calEvent.title);
      }
    }
  });
});

