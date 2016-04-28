angular.module('ShiftManager.users.Authentication', []).factory('Authentication', ['$rootScope', '$location', '$firebaseAuth', '$firebaseObject', 'BASE_URL', function($rootScope, $location, $firebaseAuth, $firebaseObject, BASE_URL) {
	var ref = new Firebase(BASE_URL);
	var auth = $firebaseAuth(ref);

	auth.$onAuth(function(authUser) {
		if (authUser) {
			var userRef = new Firebase(BASE_URL + 'users/' + authUser.uid);
			var userObj = $firebaseObject(userRef);
			$rootScope.currentUser = userObj;
		} else {
			$rootScope.currentUser = '';
		}
	});

	var myObject = {
		login: function(user) {
			auth.$authWithPassword({
				email: user.email,
				password: user.password
			}).then(function(loggedInUser) {
				console.log(loggedInUser);
				$location.path('/');
			}).catch(function(error) {
				console.log(error);
				$rootScope.msg = error;
			});
		}, //login
		register: function(user) {
			auth.$createUser({
				email: user.email,
				password: user.password
			}).then(function(registeredUser) {
				var regRef = new Firebase(BASE_URL + 'users/').child(registeredUser.uid).set({
					date: Firebase.ServerValue.TIMESTAMP,
					firstname: user.firstname,
					lastname: user.lastname,
					email: user.email,
					regUser: registeredUser.uid
				}); //userinfo
				console.log(registeredUser);
				myObject.login(user);
			}).catch(function(error) {
				console.log(error);
				$rootScope.msg = error.message;
			}); //createuser	
		}, //register
		logout: function() {
			return auth.$unauth();
		}, //logout
		requireAuth: function() {
			return auth.$requireAuth();
		} //requireAuth
	}; //myObject
	return myObject;
}]); //factory