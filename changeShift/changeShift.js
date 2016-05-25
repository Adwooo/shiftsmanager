angular.module('ShiftManager.changeShift', ['ShiftManager.users.Authentication']);

ShiftManager.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/changeShift/', {
			templateUrl: 'changeShift/change.html',
			controller: 'ChangeShiftController',
			resolve: {
				currentAuth: function(Authentication) {
					return Authentication.requireAuth();
				}
			}
	});
}]);

ShiftManager.controller('ChangeShiftController', ['$scope', '$rootScope', '$location', '$translate', '$firebaseAuth', '$firebaseObject', 'BASE_URL', function($scope, $rootScope, $location, $translate, $firebaseAuth, $firebaseObject, BASE_URL) {
	var d = new Date();
	var currentMonth = d.getMonth() + 1;
    var currentYear = d.getFullYear();
    var date1 = currentYear + '-' + currentMonth;

	var ref = new Firebase(BASE_URL);
	var auth = $firebaseAuth(ref);

	// take numbers of shifts per day from settings
	var numOfShiftsPerDayRef = new Firebase(BASE_URL + 'settings/ShiftsPerDay');
	var numOfShiftsPerDayObj = $firebaseObject(numOfShiftsPerDayRef);
	numOfShiftsPerDayObj.$loaded().then(function() {
		$scope.NumbersOfShiftsPerDay = Number(numOfShiftsPerDayObj.$value);
	});

	var refCheckIfThereAreAnyRequests = new Firebase(BASE_URL + 'users/');
	var ObjCheckIfThereAreAnyRequests = $firebaseObject(refCheckIfThereAreAnyRequests);

	var requests = [];
    ObjCheckIfThereAreAnyRequests.$loaded().then(function() {
		angular.forEach(ObjCheckIfThereAreAnyRequests, function(value, key) {
			if (value.changeRequest) {
		    angular.forEach(value.changeRequest, function(value, key) {
		    	if (value.id === $rootScope.currentUser.$id) {
				    console.log(key, value);
				    requests.push(value);
		    	}
		    });
			}
		});
	    $scope.requests = requests;
	    console.log(requests);
    });

	auth.$onAuth(function(authUser) {
		if (authUser) {
			var usersRef = new Firebase(BASE_URL + 'users/');
			var usersObj = $firebaseObject(usersRef);

			var filteredArray = [];
			usersObj.$loaded().then(function() {
		    	angular.forEach(usersObj, function(item, key) {
		    		angular.forEach(item.shifts, function(item2, key2) {
		    			// sorting days
		    			var sorted = {};
	    				var shiftsSort = new Firebase(BASE_URL + 'users/' + item.regUser + '/shifts/' + key2);
	    				// sort days
						shiftsSort.orderByValue().on("value", function(snapshot) {
							snapshot.forEach(function(data) {
						  		sorted[data.key()] = data.val();
						  	});
				    		var date = key2;
							var month = date.substring(5, item.length);
							var year = date.substring(0, 4);
							var daysObj = {};
							if (year === $rootScope.myYear && month === $rootScope.myMonth && item.regUser !== authUser.uid) {
								daysObj[key2] = {'items': sorted, 'firstname': item.firstname, 'lastname': item.lastname, regUser: item.regUser};
								filteredArray.push(daysObj);
							}
						});
		    		});
		    	});
			    $scope.allShifts = filteredArray;
		    });
		}
	});

	$scope.changeShift = function(id, shiftToChange, yearMonth) {
		var date = yearMonth;
		var shift = (shiftToChange / 2) % 1 === 0 ? 'day shift' : 'night shift';
		var day = Math.floor(shiftToChange / 2);
		var month = date.substring(5, yearMonth.length);
		var year = date.substring(0, 4);
		var dateToStore = day + '-' + month + '-' + year;
		new Firebase(BASE_URL + 'users/' + id + '/changeRequest/').update({
			[shiftToChange]: {
				'id': $rootScope.currentUser.$id,
				'name': $rootScope.currentUser.firstname + ' ' + $rootScope.currentUser.lastname,
				'myDate': dateToStore,
				'myShift': $rootScope.myShiftToChange,
				'myDayOrNight': shift,
				'yearMonth': yearMonth,
				'yourDate': $rootScope.myShiftToChangeDate,
				'yourShift': Number(shiftToChange),
				'yourDayOrNight': $rootScope.dayOrNight,
				'yourYearMonth': $rootScope.myYearMonth}
		});
		$translate('REQUEST_FOR_CHANGE').then(function (translated) {
			noty({
	            text: translated,
	            type: 'info',
	            layout: 'topCenter',
	            timeout: 10000
	        });
		});
		$location.path("/");
		console.log(id, shiftToChange, $rootScope.currentUser.$id, $rootScope.myShiftToChange);
	};
}]);