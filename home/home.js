angular.module('ShiftManager.home', ['ShiftManager.users.Authentication', 'ShiftManager.calendar.API']);

ShiftManager.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
			templateUrl: 'home/home.html',
			controller: 'HomeController',
			resolve: {
				currentAuth: function(Authentication) {
					return Authentication.requireAuth();
				}
			}
	});
}]);

ShiftManager.controller('HomeController', ['$scope', 'API', function($scope, API) {
	if (localStorage.access_token) {
		API.calendarCall().then(function(result) {
			console.log(result.data);
			API.eventsCall(10, 'startTime', false, true, '2016-04-28T10:05:43.967Z').then(function(events) {
				$scope.events = events.items;
				console.log(events);
			});
		});
		// API.createNewEvent(event);
	}

  	$scope.hanleAPICall = function(event) {
  		API.handleAuthClick(event);
  	}; //hanleAPICall


  	// CREATING AN EVENT DATA
	//  var event = {
	//   'summary': 'Google I/O 20016',
	//   'location': '800 Howard St., San Francisco, CA 94103',
	//   'description': 'A chance to hear more about Google\'s developer products.',
	//   'start': {
	//     'dateTime': '2016-05-28T09:00:00-07:00',
	//     'timeZone': 'America/Los_Angeles'
	//   },
	//   'end': {
	//     'dateTime': '2016-05-28T17:00:00-07:00',
	//     'timeZone': 'America/Los_Angeles'
	//   },
	//   'recurrence': [
	//     'RRULE:FREQ=DAILY;COUNT=2'
	//   ],
	//   'attendees': [
	//     {'email': 'lpage@example.com'},
	//     {'email': 'sbrin@example.com'}
	//   ],
	//   'reminders': {
	//     'useDefault': false,
	//     'overrides': [
	//       {'method': 'email', 'minutes': 24 * 60},
	//       {'method': 'popup', 'minutes': 10}
	//     ]
	//   }
	// };
}]);