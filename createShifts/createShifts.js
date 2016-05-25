angular.module('ShiftManager.createShifts', ['ShiftManager.users.Authentication', 'ShiftManager.calendar.API']);

ShiftManager.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/createShifts/', {
		templateUrl: 'createShifts/create.html',
		controller: 'CreateShiftsController',
		resolve: {
			currentAuth: function(Authentication) {
				return Authentication.requireAuth();
			}, 
			load: function($q, Authentication){
		      var defer = $q.defer();
		      if(Authentication.checkRole()){
		        defer.resolve();
		      } else {
		        defer.reject("adminOnly");
		      }
		      return defer.promise;
		    }
		}
	});
}]);

ShiftManager.controller('CreateShiftsController', ['$scope', '$location', '$translate', '$firebaseObject', '$firebaseArray', 'API', 'BASE_URL', function($scope, $location, $translate, $firebaseObject, $firebaseArray, API, BASE_URL) {
	//Month is 1 based
	function daysInMonth(month,year) {
	    return new Date(year, month, 0).getDate();
	}

	function isWeekday(year, month, day) {
		var day2 = new Date(year, month, day).getDay();
		return day2 !== 6 && day2 !== 0;
	}

	function closeNumber(a) {
	    a.sort(function (a, b) { return a - b; });
	    return a.some(function (b, i, aa) {
	        return i && b - aa[i - 1] <= 1;
	    });
	}

	Array.prototype.shuffle = function() {
	    var input = this;
	    for (var i = input.length-1; i >=0; i--) {
	     
	        var randomIndex = Math.floor(Math.random()*(i+1)); 
	        var itemAtIndex = input[randomIndex]; 
	         
	        input[randomIndex] = input[i]; 
	        input[i] = itemAtIndex;
	    }
	    return input;
	};
	// TODO: if there is not an access token you need to go and get one. and later redirect to this website...
	API.checkIfAccessToken().then(function(result) {
		// console.log(result);
	});

	// take the last shift
	var lastShiftRef = new Firebase(BASE_URL + 'lastShift/');
	var lastShiftObj = $firebaseObject(lastShiftRef);

	// take numbers of shifts per day from settings
	var numOfShiftsPerDayRef = new Firebase(BASE_URL + 'settings/ShiftsPerDay');
	var numOfShiftsPerDayObj = $firebaseObject(numOfShiftsPerDayRef);

	var d = new Date();
	var currentMonth = d.getMonth() + 1;
    var currentYear = d.getFullYear();
	$scope.date = {
    availableOptions: [
      {id: '1', name: 'January'},
      {id: '2', name: 'February'},
      {id: '3', name: 'March'},
      {id: '4', name: 'April'},
      {id: '5', name: 'May'},
      {id: '6', name: 'June'},
      {id: '7', name: 'July'},
      {id: '8', name: 'August'},
      {id: '9', name: 'September'},
      {id: '10', name: 'Octomber'},
      {id: '11', name: 'November'},
      {id: '12', name: 'December'}
    ],
    selectedOption: {id: currentMonth} //This sets the default value of the select in the ui
    };
    $scope.currentYear = currentYear;

    var allUsersRef = new Firebase(BASE_URL + 'users/');
	var allUsers = $firebaseObject(allUsersRef);

    // counting the people that need to take the shifts and also putting there id's into an array workingPeople
	var workingPeople = [];
	var consultantPeople = [];
	allUsers.$loaded().then(function() {
		var personObject = {};
        angular.forEach(allUsers, function(value, key) {
        	if (value.degree === 'degree1' || value.degree === 'degree2') {
        		personObject = {'id': key,
        			'monopoly': value.monopoly,
        			'firstname': value.firstname,
        			'lastname': value.lastname,
        			'email': value.email,
        			'degree': value.degree,
        			'shifts': value.shifts,
        			'wordPreferences': value.wordPreferences
        		};
        		workingPeople.push(personObject);
        	}
        	if (value.degree === 'degree2') {
        		personObject = {'id': key};
        		consultantPeople.push(personObject);
        	}
       });
        $scope.loaded = 'loaded';
    });

	$scope.getDate = function creatingShifts(getDate) {
		if (!getDate.year) {
			getDate.year = currentYear;
		}
		// how many days are in the currently selected month and year
		var days = daysInMonth(getDate.selectedOption.id, getDate.year);

		// put in an array all the working days for the selected month and year
		var workDays = [];
		for (var d = 1; d <= days; d++) {
		    if (isWeekday(getDate.year, Number(getDate.selectedOption.id) - 1, d)) {
		    	// console.log('calendar number: ' + d);
		    	workDays.push(d);
		    }
		}

		// how many shifts needs to be 'places' in the currently selected month
		var numbersOfShifts = days * Number(numOfShiftsPerDayObj.$value);

		// shuffling all shifts in the currently selected month and put it into an array
		var arrayShifts = [];
	    for (var a = 2; a <= numbersOfShifts + 1; a++) {
	        arrayShifts.push(a);
	    }

	    // check the array so the array dont have next numbers to each others
	    for (var i4 = 0; i4 < arrayShifts.length; i4++) {
		    while (Math.abs(arrayShifts[i4] - arrayShifts[i4+1]) === 1) {
		    	i4 = 0;
		    	arrayShifts.shuffle();
		    	// console.log("shuffeling");
		    }
	    }

	    // sort working people by monopoly
	    workingPeople.sort(function(a, b) { 
		    return a.monopoly - b.monopoly;
		});

        var numOfShiftsPerPerson = Math.floor(arrayShifts.length / workingPeople.length);
        var numOfConsultansPerPerson = Math.floor(workDays.length / consultantPeople.length);

	    console.log('How many people will take the shifts: ' + workingPeople.length);
	    console.log('How many working shifts a peron have to give in the currently selected month: ' + numOfShiftsPerPerson);
	    console.log('How many people will take the consulting shifts: ' + consultantPeople.length);
	    console.log('How many consult shifts a peron have to give in the currently selected month: ' + numOfConsultansPerPerson);

		// counting the people that need to take the shifts and also putting there id's into an array workingPeople
	    var s = 0;
	    var event;
	    var test = false; // FOR DELETION
	    var tempArray = arrayShifts;
	    var beginShiftingFromThisNumber = 0;
	    var preferedDaysToWork = [];
	    var preferedBreakDays = [];
	    var yearMonth = getDate.year + '-' + getDate.selectedOption.id;
        for (var h = 0; h < workingPeople.length; h++) {
        	// remove all shifts before store new ones and also all consulting shifts
			new Firebase(BASE_URL + 'users/' + workingPeople[h].id + '/shifts/' + yearMonth).remove();
			new Firebase(BASE_URL + 'users/' + workingPeople[h].id + '/consulting/' + yearMonth).remove();
    		if (workingPeople[h].wordPreferences) {
    			for (var i = 0; i < tempArray.length; i++) {
    				if (workingPeople[h].wordPreferences['work']) {
    					if (workingPeople[h].wordPreferences['work'][yearMonth]) {
	        				if (workingPeople[h].wordPreferences['work'][yearMonth][arrayShifts[i]]) {
							    // if there are work days that a person prefer to work just add those days to the person /check how many shifts are per person
	        					// if person have more shifts that desire to work then the shifts are are requred - break the loop
	        					if (s === numOfShiftsPerPerson) {
	        						break;
	        					}
	        					shiftNum = 'shift' + s;
	        					var shiftIndex = arrayShifts.indexOf(workingPeople[h].wordPreferences['work'][yearMonth][arrayShifts[i]]);
	        					shift = Number(arrayShifts.splice(shiftIndex, 1));
								new Firebase(BASE_URL + 'users/' + workingPeople[h].id + '/shifts/' + yearMonth).update({
									[shiftNum]: shift
								});
								// store in an array how much prefered days are stored in the db so far
								preferedDaysToWork[workingPeople[h].id] = s;
								console.log("preferences... shift: " + shift, workingPeople[h].id, workingPeople[h].firstname, workingPeople[h].lastname, getDate.year + '-' + getDate.selectedOption.id + '-' + startDate + 'T' + workHour + ':00:00');

								s++;
								beginShiftingFromThisNumber = s;
								if (test) {
									console.log("creating event...");
								  	// CREATING AN EVENT DATA
									 event = {
									  'summary': workingPeople[h].firstname + ' ' + workingPeople[h].lastname,
									  'location': 'Hospital',
									  'description': 'Working shift for the hospital.',
									  'start': {
									  	'dateTime': getDate.year + '-' + getDate.selectedOption.id + '-' + startDate + 'T' + workHour + ':00:00',
									    'timeZone': 'Europe/Sofia'
									  },
									  'end': {
									  	'dateTime': getDate.year + '-' + getDate.selectedOption.id + '-' + endDate + 'T' + endTime + ':00:00',
									    'timeZone': 'Europe/Sofia'
									  },
									  'attendees': [
									    {'email': workingPeople[h].email}
									  ],
									  'reminders': {
									    'useDefault': true
									  }
									};

									API.createNewEvent(event);
								}
	        				}
    					}
    				}
    				if (workingPeople[h].wordPreferences['break']) {
        				if (workingPeople[h].wordPreferences['break'][yearMonth]) {
	        				if (workingPeople[h].wordPreferences['break'][yearMonth][arrayShifts[i]]) {
		        				if (!preferedBreakDays[workingPeople[h].id]) {
		        					preferedBreakDays[workingPeople[h].id] = [];	
		        				}
	        					preferedBreakDays[workingPeople[h].id].push(arrayShifts[i]);
	        				}
        				}
    				}
    			}
				s = 0;
    		}
        }

        var addingShifts = [];
	    var shiftNum, shift, shiftsRef;
		var y = 0, i2 = 0, i3 = 0, j = 0, n = 0;
	    var remainingShifts = false;
	    var beginShiftsFrom = numOfShiftsPerPerson;
	    // for each person working in the hospital we need a loop and assign them how many shifts a employee have to do
	    while (arrayShifts.length !== 0) {
			for (y; y < workingPeople.length; y++) {
				if (arrayShifts.length === 0) {
					var lastShiftRef = new Firebase(BASE_URL + 'lastShift/').set({
						date: Firebase.ServerValue.TIMESTAMP,
						lastPersonIndex: y
					}); // lastShiftRef
					break;
				}
				// if there are any prefered shifts stored in the db then skip and go to next shifts...
				if (preferedDaysToWork[workingPeople[y].id] || preferedDaysToWork[workingPeople[y].id] === 0) {
					i2 = preferedDaysToWork[workingPeople[y].id] + 1;
				}
				for (i2; i2 < numOfShiftsPerPerson; i2++) {
					// check if there is a break day and if there is a break day skip to the next day
					if (preferedBreakDays[workingPeople[y].id]) {
						for (i3; i3 < preferedBreakDays[workingPeople[y].id].length; i3++) {
							if (preferedBreakDays[workingPeople[y].id][i3] === arrayShifts[n]) {
								i3 = 0;
								n++;
							}
						}
					} 
					
					shift = Number(arrayShifts.splice(n, 1));
					n = 0;
					i3 = 0;

					
					addingShifts.push(shift);

					// store the shifts in FB
					if (remainingShifts) {
						shiftNum = 'shift' + beginShiftsFrom;
						new Firebase(BASE_URL + 'users/' + workingPeople[y].id + '/shifts/' + yearMonth).update({
							[shiftNum]: shift
						});
					}

					// get date 
					var startDate = Math.floor(shift / 2);
					var endDate = startDate;

					//check if its a day or night shift
					var workHour = '08'; // day shift
					var endTime = '20';
					if ((shift / 2) % 1 !== 0) {
						// night shift
						endDate++;
						workHour = '20';
						endTime = '08';
					}

					console.log("shift: " + shift, workingPeople[y].id, workingPeople[y].firstname, workingPeople[y].lastname, getDate.year + '-' + getDate.selectedOption.id + '-' + startDate + 'T' + workHour + ':00:00', getDate.year + '-' + getDate.selectedOption.id + '-' + endDate + 'T' + endTime + ':00:00');

					if (test) {
						console.log("creating event...");
					  	// CREATING AN EVENT DATA
						 event = {
						  'summary': workingPeople[y].firstname + ' ' + workingPeople[y].lastname,
						  'location': 'Hospital',
						  'description': 'Working shift for the hospital.',
						  'start': {
						  	'dateTime': getDate.year + '-' + getDate.selectedOption.id + '-' + startDate + 'T' + workHour + ':00:00',
						    'timeZone': 'Europe/Sofia'
						  },
						  'end': {
						  	'dateTime': getDate.year + '-' + getDate.selectedOption.id + '-' + endDate + 'T' + endTime + ':00:00',
						    'timeZone': 'Europe/Sofia'
						  },
						  'attendees': [
						    {'email': workingPeople[y].email}
						  ],
						  'reminders': {
						    'useDefault': true
						  }
						};

						API.createNewEvent(event);
					}
					test = false;
				}
				// checking if the array consists of close numbers to each other if it dosent then add all shifts
				if (!remainingShifts && !closeNumber(addingShifts)) {
					for (var b = 0; b < addingShifts.length; b++) {
						shiftNum = 'shift' + beginShiftingFromThisNumber;
						new Firebase(BASE_URL + 'users/' + workingPeople[y].id + '/shifts/' + yearMonth).update({
							[shiftNum]: addingShifts[b]
						});
						beginShiftingFromThisNumber++;
					}
				}
				// if it consists close numbers then add numbers to from and end of the array and then get back to the same person and do everything all over again
				if (!remainingShifts && closeNumber(addingShifts)) {
					for (var b2 = 0; b2 < addingShifts.length; b2 = b2 + 2) {
						arrayShifts.push(addingShifts[b2]);
					}
					for (var b3 = 1; b3 < addingShifts.length; b3 = b3 + 2) {
						arrayShifts.unshift(addingShifts[b3]);
					}
					y--;
				}
				addingShifts = [];
				i2 = 0;
			}
			if (remainingShifts) {
				console.log("restarting people");
				j = y = 0; // restart the looping over the people
			} else {
				console.log("continued from the person that you left of the last time...");
				j = lastShiftObj.lastPersonIndex * 3; // get names of the person
				y = lastShiftObj.lastPersonIndex; // start looping truth all the people again from the last person last time was ended
			}
			numOfShiftsPerPerson = 1; // reset so it gives only 1 shift per person of the remaining shifts
			remainingShifts = true;
		}

		// adding all remining consulting shifts in the db
		var checkArrayValues = [], consultingPeople = [];
		allUsers.$loaded().then(function() {
	    	angular.forEach(allUsers, function(value, key) {
	    		var refAllShifts = new Firebase(BASE_URL + 'users/' + key + '/shifts/' + yearMonth);
	    		var objAllShifts = $firebaseObject(refAllShifts);
	    		if (value.shifts) {
	    			if (value.shifts[yearMonth]) {
			    		personObject = {};
    					if (value.degree === 'degree2') {
			        		personObject = {'id': key, 'monopoly': value.monopoly, 'shifts': value.shifts[yearMonth]};
			        		consultingPeople.push(personObject);
			        	}
			        	angular.forEach(value.shifts[yearMonth], function(value2, key2) {
			        		checkArrayValues.push(value2);
			        	});
	    			}
	    		}
	    		if (key) {
	    			if (closeNumber(checkArrayValues)) {
	    				creatingShifts(getDate); // restart creation of shifts because there is a shift that is close to other number!!!
		    			console.log(closeNumber(checkArrayValues), checkArrayValues, key);
	    			}
	    		}
	    		checkArrayValues = [];
	    	});
			consultingPeople.sort(function(a, b) {
				return b.monopoly - a.monopoly;
			});
			while (workDays.length > 0) {
				for (var key in consultingPeople) {
					var legitableForAdd = true;
					var workDay2 = Number(workDays.splice(0, 1));
					var workDayShift2 = workDay2;
					for (var key2 in consultingPeople[key].shifts) {
						var currentShift = consultingPeople[key].shifts[key2] / 2;
						// console.log('legitable shift: ' + currentShift, workDay2, consultingPeople[key].id);
						if (currentShift === workDay2 || currentShift === workDay2 - 0.5 || currentShift === workDay2 + 0.5) {
							legitableForAdd = false;
							// console.log('NOT legitable: ' + currentShift, workDay2, consultingPeople[key].id);
							workDays.push(workDay2);
						}
					}
					if (legitableForAdd && workDay2 !== 0 && consultingPeople[key].id) {
						console.log('adding value...', workDay2, consultingPeople[key].id);
						new Firebase(BASE_URL + 'users/' + consultingPeople[key].id + '/consulting/' + yearMonth).update({
							[workDay2]: workDay2
						});
						legitableForAdd = true;
					}
				}
			}
	   });
		$scope.successCreation = yearMonth;
		// $translate('SHIFTS_CREATED').then(function (translated) {
		// 	noty({
	 //            text: translated,
	 //            type: 'info',
	 //            layout: 'topCenter',
	 //            timeout: 5000
	 //        });
		// });
		// $location.path("/");
		console.log(arrayShifts, workDays);
	};
}]);