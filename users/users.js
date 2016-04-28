angular.module('ShiftManager.users', ['ShiftManager.users.Authentication']);

ShiftManager.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/login/', {
			templateUrl: 'users/login.html',
			controller: 'UserController'
	}).when('/register/', {
			templateUrl: 'users/register.html',
			controller: 'UserController'
	});
}]);

ShiftManager.controller('UserController', ['$scope', 'Authentication', function($scope, Authentication) {
	$scope.login = function() {
		Authentication.login($scope.user);
	}; //login

	$scope.register = function() {
		Authentication.register($scope.user);
	}; //register

	$scope.logout = function() {
		Authentication.logout();
	}; //logout
}]); //controller