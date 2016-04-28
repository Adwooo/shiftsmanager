var ShiftManager = angular.module('ShiftManager',
	['ngRoute',
	'firebase',
	'ShiftManager.users',
	'ShiftManager.home',
	'ShiftManager.calendar.API']);

ShiftManager.run(['$rootScope', '$location', function($rootScope, $location) {
	$rootScope.$on('$routeChangeError', function(event, next, previous, error) {
		if (error === 'AUTH_REQUIRED') {
			$rootScope.msg = 'Sorry, you must be logged in in order to access this page';
			$location.path('/login/');
		}
	});
}]);

ShiftManager.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/login/'});
}]).constant({
	'BASE_URL': 'https://shiftsmanager.firebaseio.com/',
	'CLIENT_ID': '149265155618-ekc1bl9hdv62gtgvqhra5glf5geerkr3.apps.googleusercontent.com',
	'SCOPES': ["https://www.googleapis.com/auth/calendar"]});