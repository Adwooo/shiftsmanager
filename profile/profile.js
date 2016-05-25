angular.module('ShiftManager.profile', ['ShiftManager.users.Authentication']);

ShiftManager.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/profile/', {
		templateUrl: 'profile/profile.html',
		controller: 'ProfileController',
		resolve: {
			currentAuth: function(Authentication) {
				return Authentication.requireAuth();
			}
		}
	});
}]);

ShiftManager.controller('ProfileController', ['$scope', '$rootScope', '$location', '$translate', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'BASE_URL', function($scope, $rootScope, $location, $translate, $firebaseAuth, $firebaseArray, $firebaseObject, BASE_URL) {
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
			var profileUser = new Firebase(BASE_URL + 'users/' + $rootScope.currentUser.$id);
			var profileInfo = $firebaseObject(profileUser);
			$scope.profileInfo = profileInfo;

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
					profileInfo.$loaded().then(function() {
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
					    	roleOption: {value: profileInfo.role}
					    };
				    });
				});
			});

		}
	});



	$scope.changeProfileData = function(changeData) {
		var findUser = new Firebase(BASE_URL + 'users/').child($rootScope.currentUser.$id).update({
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
        $location.path("/");
	};
}]);