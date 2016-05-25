angular.module('ShiftManager.workingPreferences', ['ShiftManager.users.Authentication']);

ShiftManager.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/workingPreferences/', {
			templateUrl: 'workingPreferences/preferences.html',
			controller: 'WorkingPreferencesController',
			resolve: {
				currentAuth: function(Authentication) {
					return Authentication.requireAuth();
				}
			}
	}).when('/allPreferedDays/', {
			templateUrl: 'workingPreferences/alldays.html',
			controller: 'AllPreferedDaysController',
			resolve: {
				currentAuth: function(Authentication) {
					return Authentication.requireAuth();
				}
			}
	});
}]);

ShiftManager.controller('WorkingPreferencesController', ['$scope', '$rootScope', '$route', '$translate', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'BASE_URL', function($scope, $rootScope, $route, $translate, $firebaseAuth, $firebaseArray, $firebaseObject, BASE_URL) {
	var d = new Date();
	var currentMonth = d.getMonth() + 1;
    var currentYear = d.getFullYear();
    var date1 = currentYear + '-' + currentMonth;

	var ref = new Firebase(BASE_URL);
	var auth = $firebaseAuth(ref);

	// take numbers of shifts per day from settings
	var numOfShiftsPerDayRef = new Firebase(BASE_URL + 'settings/ShiftsPerDay');
	var numOfShiftsPerDayObj = $firebaseObject(numOfShiftsPerDayRef);

	auth.$onAuth(function(authUser) {
		if (authUser) {
			var refWorkingPreferencesBreak = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/wordPreferences/break/');
			var workingPreferencesBreak = $firebaseObject(refWorkingPreferencesBreak);

			var refWorkingPreferencesWork = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/wordPreferences/work/');
			var workingPreferencesWork = $firebaseObject(refWorkingPreferencesWork);

			// TODO: tranform this code into a funtion
			var filteredBreak = [];
			workingPreferencesBreak.$loaded().then(function() {
		    	angular.forEach(workingPreferencesBreak, function(key, item) {
		    	  var date = item;
					var month = date.substring(5, item.length);
					var year = date.substring(0, 4);
					var daysObj = {};
					if (year >= currentYear && month >= currentMonth) {
						daysObj[item] = key;
						filteredBreak.push(daysObj);
					}
		    	});
			    $scope.workingPreferencesBreak = filteredBreak;
		    });

			// TODO: tranform this code into a funtion
		    var filteredWork = [];
			workingPreferencesWork.$loaded().then(function() {
		    	angular.forEach(workingPreferencesWork, function(key, item) {
		    	  var date = item;
					var month = date.substring(5, item.length);
					var year = date.substring(0, 4);
					var daysObj = {};
					if (year >= currentYear && month >= currentMonth) {
						daysObj[item] = key;
						filteredWork.push(daysObj);
					}
		    	});
			    $scope.workingPreferencesWork = filteredWork;
		    });
		}
	});
	
	$scope.deleteBreakShift = function(deletedShift, yearMonth) {
		new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/wordPreferences/break/' + yearMonth + '/' + deletedShift).remove();
		$route.reload();
	};

	$scope.deleteWorkShift = function(deletedShift, yearMonth) {
		new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/wordPreferences/work/' + yearMonth + '/' + deletedShift).remove();
		$route.reload();
	};

	$scope.submitPreferedDay = function(submittedDay) {
		var dateString = submittedDay.day;
    	var date = new Date(dateString);
    	var day = date.getDate();
    	var month = date.getMonth() + 1;
    	var year = date.getFullYear();
    	var shiftDay, workOrNot, workPreferencesRef, convertedDay, checkRef;
    	checkRef = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/shifts/' + year + '-' + month);
		// check object if exists in firebase
    	checkRef.once("value", function(snapshot) {
			var checkObject = snapshot.exists();
    		if (!checkObject) {
    			// TODO: fix if there are more or less then 2 shifts per day
		    	if (submittedDay.shiftDay) {
		    		shiftDay = 'Day';
		    		convertedDay = day * Number(numOfShiftsPerDayObj.$value); // fix this
		    	} else {
		    		shiftDay = 'Night';
		    		convertedDay = day * Number(numOfShiftsPerDayObj.$value) + 1; // fix this
		    	}
		    	if (submittedDay.workOrNot) {
		    		workOrNot = 'Break';

			    	workPreferencesRef = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/wordPreferences/break/' + year + '-' + month).update({
			    		[convertedDay]: convertedDay
			    	});
		    	} else {
		    		workOrNot = 'Work';
			    	workPreferencesRef = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/wordPreferences/work/' + year + '-' + month).update({
			    		[convertedDay]: convertedDay
					});
		    	}
    		} else {
    			$translate('CANNOT_ADD_PREF').then(function (translated) {
	    			noty({
		                text: translated,
		                type: 'error',
		                layout: 'topCenter',
		                timeout: 5000
		            });
				});
    		}
		});
    	$route.reload();
	};
}]);

ShiftManager.controller('AllPreferedDaysController', ['$scope', '$rootScope', '$firebaseAuth', '$firebaseObject', 'BASE_URL', function($scope, $rootScope, $firebaseAuth, $firebaseObject, BASE_URL) {
	var ref = new Firebase(BASE_URL);
	var auth = $firebaseAuth(ref);

	auth.$onAuth(function(authUser) {
		if (authUser) {
			var refWorkingPreferencesBreak = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/wordPreferences/break/');
			var allBreakDay = $firebaseObject(refWorkingPreferencesBreak);

			var refWorkingPreferencesWork = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id + '/wordPreferences/work/');
			var allWorkDay = $firebaseObject(refWorkingPreferencesWork);
			
			$scope.allBreakDay = allBreakDay;
			$scope.allWorkDay = allWorkDay;
		}
	});
}]);