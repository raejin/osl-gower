var $ = require('jquery');
var _ = require('lodash');
var Moment = require('moment');
var React = require('react');
var fullCalendar = require('fullcalendar');
var oslSchedule = require('lineup.json');
var saveAs = require('filesaver.js');
var icalendar = require('icalendar');
var currentUser;
var selectedBand = [];

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
              'YYYY-MM-DD h:mmA').toDate(), Moment(daySchedule.date + ' ' + act.end + 'pm',
              'YYYY-MM-DD h:mmA').toDate());
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
                'YYYY-MM-DD h:mmA').format(),
            end: Moment(daySchedule.date + ' ' + act.end + 'pm',
                'YYYY-MM-DD h:mmA').format(),
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
        selectedBand = _.remove(selectedBand, calEvent.title);
      } else {
        selectedBand.push(calEvent.title);
      }
    }
  });
});

