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

ShiftManager.controller('HomeController', ['$scope', '$rootScope', '$location', '$route', '$translate', '$firebaseAuth', '$firebaseObject', 'API', 'CLIENT_ID', 'SCOPES', 'BASE_URL', function($scope, $rootScope, $location, $route, $translate, $firebaseAuth, $firebaseObject, API, CLIENT_ID, SCOPES, BASE_URL) {
	var d = new Date();
	var currentMonth = d.getMonth() + 1;
    var currentYear = d.getFullYear();

	var ref = new Firebase(BASE_URL);
	var auth = $firebaseAuth(ref);

	// take numbers of shifts per day from settings
	var numOfShiftsPerDayRef = new Firebase(BASE_URL + 'settings/ShiftsPerDay');
	var numOfShiftsPerDayObj = $firebaseObject(numOfShiftsPerDayRef);
	numOfShiftsPerDayObj.$loaded().then(function() {
		$scope.NumbersOfShiftsPerDay = Number(numOfShiftsPerDayObj.$value);
	});

	auth.$onAuth(function(authUser) {
		if (authUser) {
			var refChangeShift = new Firebase(BASE_URL + 'users/' + authUser.uid + '/changeRequest/');
			refChangeShift.once("value", function(snapshot) {
				var checkObject = snapshot.exists();
	    		if (checkObject) {
					var objChangeShift = $firebaseObject(refChangeShift);
					$scope.changeShift = objChangeShift;
	    		}
	    	});

	    	var refShifts = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/shifts/');
			var objShifts = $firebaseObject(refShifts);

			var filtered = [];
			objShifts.$loaded().then(function() {
		    	angular.forEach(objShifts, function(item, key) {
		    		var sorted = {};
		    		var shiftsSort = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/shifts/' + key);
			    	// sort days
					shiftsSort.orderByValue().on("value", function(snapshot) {
					  	snapshot.forEach(function(data) {
					  		sorted[data.key()] = data.val();
					  	});
			    		var date = key;
						var month = date.substring(5, key.length);
						var year = date.substring(0, 4);
						var daysObj = {};
						if (year >= currentYear && month >= currentMonth) {
							daysObj[key] = sorted;
							filtered.push(daysObj);
						}
					});
		    	});
			    $scope.objShifts = filtered;
		    });

		    var refConsulting = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/consulting/');
		    var objConsulting = $firebaseObject(refConsulting);

			objConsulting.$loaded().then(function() {
		    filteredConsults = [];
		    	angular.forEach(objConsulting, function(item, key) {
		    		var sorted = {};
		    		var consultingSoft = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/consulting/' + key);
			    	// sort days
					consultingSoft.orderByValue().on("value", function(snapshot) {
					  	snapshot.forEach(function(data) {
					  		sorted[data.key()] = data.val();
					  	});
			    		var date = key;
						var month = date.substring(5, key.length);
						var year = date.substring(0, 4);
						var daysObj = {};
						if (year >= currentYear && month >= currentMonth) {
							daysObj[key] = sorted;
							filteredConsults.push(daysObj);
						}
					});
		    	});
			    $scope.consultings = filteredConsults;
		    });
		}
	});


	// API.checkIfAccessToken().then(function(result) {
	// 	API.calendarCall().then(function(result) {
	// 		API.eventsCall(10, 'startTime', false, true, '2016-04-28T10:05:43.967Z').then(function(events) {
	// 			if (events.items) {
	// 				$scope.events = events.items;
	// 				console.log(events);
	// 			} else {
	// 				$scope.noevents = true;
	// 			}
	// 		});
	// 	});
	// 	// API.createNewEvent(event);
	// });

	$scope.alreadyAPICall = function(event) {
  		window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=' + CLIENT_ID + '&redirect_uri=http://localhost:80/shiftsmanager/calendar/oauth_callback.php&scope=' + SCOPES + '&access_type=offline';
  	}; //alreadyAPICall

  	$scope.deny = function(shift) {
  		$translate('DENING_REQUEST').then(function (translated) {
	  		$translate('YES').then(function (yes) {
		  		$translate('NO').then(function (no) {
			  		noty({
						text: translated,
						type: 'confirm',
						layout: 'topCenter',
						buttons: [
							{text: yes,
								onClick: function($noty) {
									new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/changeRequest/' + shift).remove();
									$noty.close();
								}
							},
							{text: no, 
								onClick: function($noty) {
									$noty.close();
								}
							}
						]
					});
				});
	  		});
	  	});
  	};

  	$scope.approve = function(shift, data) {
  		$translate('APPROVING_REQUEST').then(function (translated) {
	  		$translate('YES').then(function (yes) {
		  		$translate('NO').then(function (no) {
			  		noty({
						text: translated,
						type: 'confirm',
						layout: 'topCenter',
						buttons: [
							{text: yes,
								onClick: function($noty) {
									// update my firebase data
									var refYearAndMonth =  new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/shifts/' + data.yearMonth);
									var objYearAndMonth = $firebaseObject(refYearAndMonth);
									objYearAndMonth.$loaded().then(function() {
								    	angular.forEach(objYearAndMonth, function(item, key) {
								    		item = Number(item);
								    		var shiftObj = key;
								    		console.log(key);
								    		if (item === data.yourShift) {
								    			// store my shift
								    			var changeShiftRef = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/shifts/');
								    			changeShiftRef.child(data.yourYearMonth).child(shiftObj).set(data.myShift);
								    			console.log(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/shifts/' + data.yearMonth + '/' + shiftObj, data.myShift);
								    		}
								    	});
								    });
								    // update your firebase data
								    var refYearAndMonth2 =  new Firebase(BASE_URL + 'users/' + data.id + '/shifts/' + data.yourYearMonth);
									var objYearAndMonth2 = $firebaseObject(refYearAndMonth2);
									objYearAndMonth2.$loaded().then(function() {
								    	angular.forEach(objYearAndMonth2, function(item, key) {
								    		item = Number(item);
								    		var shiftObj = key;
								    		console.log(key);
								    		if (item === data.myShift) {
								    			// store there shift
								    			var changeShiftRef = new Firebase(BASE_URL + 'users/' + data.id + '/shifts/');
								    			changeShiftRef.child(data.yourYearMonth).child(shiftObj).set(data.yourShift);
								    			console.log(BASE_URL + 'users/' + data.id + '/shifts/' + data.yourYearMonth + '/' + shiftObj, data.yourShift);
								    		}
								    	});
								    });
								    // finally delete the request for changing shifts
								    new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/changeRequest/' + data.yourShift).remove();
									$noty.close();
								    $route.reload();
									console.log(data);
								}
							},
							{text: no, 
								onClick: function($noty) {
									$noty.close();
								}
							}
						]
					});
		  		});
		  	});
		});
  	};

  	$scope.sendShiftChange = function(shift, yearMonth) {
  		shift = Number(shift);
  		var date = yearMonth;
		var dayOrNight = (shift / 2) % 1 === 0 ? 'day shift' : 'night shift';
		var day = Math.floor(shift / 2);
		var month = date.substring(5, yearMonth.length);
		var year = date.substring(0, 4);
		var myShiftToChangeDate = day + '-' + month + '-' + year;
  		$rootScope.myShiftToChange = shift;
  		$rootScope.myShiftToChangeDate = myShiftToChangeDate;
  		$rootScope.dayOrNight = dayOrNight;
  		$rootScope.myYearMonth = yearMonth;
  		$rootScope.myMonth = month;
  		$rootScope.myYear = year;
  		$location.path( "/changeShift/" );
  	};

  	// this code is redunded as it is not getting the access offline i need
  	// $scope.hanleAPICall = function(event) {
  	// 	API.handleAuthClick(event).then(function(authResult) {
  	// 		API.calendarCall().then(function(getCalendar) {
			// 	console.log(getCalendar);
			// 	API.eventsCall(10, 'startTime', false, true, '2016-04-28T10:05:43.967Z').then(function(events) {
			// 		$scope.events = events.items;
			// 		console.log(events);
			// 	});
			// });
  	// 	});
  	// }; //hanleAPICall


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