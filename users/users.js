angular.module('ShiftManager.users', ['ShiftManager.users.Authentication']);

ShiftManager.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/login/', {
		templateUrl: 'users/login.html',
		controller: 'UserController'
	}).when('/register/', {
		templateUrl: 'users/register.html',
		controller: 'UserController'
	}).when('/users/', {
		templateUrl: 'users/users.html',
		controller: 'UsersController',
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
	}).when('/users/:id/', {
		templateUrl: 'profile/profile.html',
		controller: 'ProfileAdminViewController',
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

ShiftManager.controller('UserController', ['$scope', '$location', '$translate', 'Authentication', function($scope, $location, $translate, Authentication) {
	$scope.login = function() {
		Authentication.login($scope.user);
	}; //login

	$scope.register = function() {
		Authentication.register($scope.user);
	}; //register

	$scope.logout = function() {
		$location.path('/login/');
		console.log('logged out');
		Authentication.logout();
		$translate('LOGGED_OUT').then(function (translated) {
			noty({
		        text: translated,
		        type: 'info',
		        layout: 'topCenter',
		        timeout: 5000
		    });
		});
	}; //logout
}]); //controller

ShiftManager.controller('UsersController', ['$scope', '$location', '$firebaseArray', 'BASE_URL', function($scope, $location, $firebaseArray, BASE_URL) {
	var ref = new Firebase(BASE_URL + 'users/');
	var users = $firebaseArray(ref);

	users.$loaded().then(function() {
		$scope.users = users;
	});

	$scope.loadProfile = function(id) {
		$location.path('/users/' + id + '/');
	};
}]);

ShiftManager.controller('ProfileAdminViewController', ['$scope', '$location', '$routeParams', '$translate', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'BASE_URL', function($scope, $location, $routeParams, $translate, $firebaseAuth, $firebaseArray, $firebaseObject, BASE_URL) {
	var ref = new Firebase(BASE_URL);
	var auth = $firebaseAuth(ref);

	var refAllUsers = new Firebase(BASE_URL + '/users/');
	var arrayAllUsers = $firebaseArray(refAllUsers);

	// take numbers of shifts per day from settings
	var refSettings = new Firebase(BASE_URL + 'settings/');
	var objSeetings = $firebaseObject(refSettings);
	var degree1, degree2, degree3, role1, role2, role3;

	auth.$onAuth(function(authUser) {
		if (authUser) {
			var profileUser = new Firebase(BASE_URL + 'users/' + $routeParams.id);
			var profileInfo = $firebaseObject(profileUser);
			$scope.profileInfo = profileInfo;

			var people = [];
			arrayAllUsers.$loaded().then(function() {
				var objectPerson = {};
				angular.forEach(arrayAllUsers, function(item, key) {
					objectPerson = {'name': key + 1};
					people.push(objectPerson);
		    	});

		    	objSeetings.$loaded().then(function() {
					if ($translate.use() === 'en') {
						degree1 = objSeetings.degree1en;
						degree2 = objSeetings.degree2en;
						degree3 = objSeetings.degree3en;
						role1 = objSeetings.role1en;
						role2 = objSeetings.role2en;
						role3 = objSeetings.role3en;
					} else if ($translate.use() === 'bg') {
						degree1 = objSeetings.degree1bg;
						degree2 = objSeetings.degree2bg;
						degree3 = objSeetings.degree3bg;
						role1 = objSeetings.role1bg;
						role2 = objSeetings.role2bg;
						role3 = objSeetings.role3bg;
					}
					var people = [];
					arrayAllUsers.$loaded().then(function() {
						var objectPerson = {};
						angular.forEach(arrayAllUsers, function(item, key) {
							objectPerson = {'name': key + 1};
							people.push(objectPerson);
				    	});
					    // promises in firebase
						profileInfo.$loaded().then(function(value) {
							$scope.person = {
							    type: [
							      {name: degree1, value: 'degree1'},
							      {name: degree2, value: 'degree2'},
							      {name: degree3, value: 'degree3'}
							    ],
							    monopolyOptions: people,
							    selectedOption: {value: profileInfo.degree}, //This sets the default value of the select in the ui
							    monopolySelected: {name: profileInfo.monopoly},
							    roleType: [
						    		{name: role1, value: 'role1'},
						    		{name: role2, value: 'role2'},
						    		{name: role3, value: 'role3'}
						    	],
						    	roleOption: {value: profileInfo.role},
						    };
						    $scope.id = value.regUser;
					    });
					});
				});

				
			});
		}
	});

	$scope.changeProfileData = function(changeData, id) {
		var findUser = new Firebase(BASE_URL + 'users/').child(id).update({
			degree: changeData.selectedOption.value,
			monopoly: changeData.monopolySelected.name,
			role: changeData.roleOption.value
		}); //userinfo
		$translate('DATA_SAVED').then(function (translated) {
			noty({
	            text: translated,
	            type: 'info',
	            layout: 'topCenter',
	            timeout: 5000
	        });
		});
        $location.path("/users/");
	};
}]);