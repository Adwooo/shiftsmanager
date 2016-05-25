angular.module('ShiftManager.deleteShift', ['ShiftManager.users.Authentication']);

ShiftManager.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/deleteShifts/', {
			templateUrl: 'deleteShifts/delete.html',
			controller: 'DeleteShiftsController',
			resolve: {
				currentAuth: function(Authentication) {
					return Authentication.requireAuth();
				}, 
				load: function($q, Authentication){
			      var defer = $q.defer();
			      console.log(Authentication.checkRole());
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

ShiftManager.controller('DeleteShiftsController', ['$scope', '$location', '$firebaseAuth', '$firebaseObject', 'BASE_URL', function($scope, $location, $firebaseAuth, $firebaseObject, BASE_URL) {
	var ref2 = new Firebase(BASE_URL);
	var auth = $firebaseAuth(ref2);

	auth.$onAuth(function(authUser) {
		var refShifts = new Firebase(BASE_URL + 'users/' + authUser.uid + '/shifts/');
		var objShifts = $firebaseObject(refShifts);

		objShifts.$loaded().then(function() {
			$scope.months = objShifts;
		});
	});

	$scope.deleteShifts = function(yearMonth) {
		var ref = new Firebase(BASE_URL + '/users/');
		var users = $firebaseObject(ref);

		users.$loaded().then(function() {
	    	angular.forEach(users, function(item, key) {
	    		new Firebase(BASE_URL + 'users/' + key + '/shifts/' + yearMonth).remove();
	    		new Firebase(BASE_URL + 'users/' + key + '/consulting/' + yearMonth).remove();
	    	});
	    });
	};

	$scope.deletePosition = function() {
		new Firebase(BASE_URL + '/lastShift/').remove();
		$location.path("/");
	};
}]);