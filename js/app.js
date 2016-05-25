var ShiftManager = angular.module('ShiftManager',
	['ngRoute',
	'firebase',
	'pascalprecht.translate',
	'ShiftManager.language',
	'ShiftManager.users',
	'ShiftManager.home',
	'ShiftManager.calendar.API',
	'ShiftManager.createShifts',
	'ShiftManager.changeShift',
	'ShiftManager.workingPreferences',
	'ShiftManager.deleteShift',
	'ShiftManager.profile',
	'ShiftManager.settings']);

ShiftManager.run(['$rootScope', '$location', '$translate', function($rootScope, $location, $translate) {
	$rootScope.lang = 'bg';

	$rootScope.$on('$routeChangeError', function(event, next, previous, error) {
		if (error === 'AUTH_REQUIRED') {
			$translate('REGISTERED_USER_ERROR').then(function (translated) {
				noty({
			        text: translated,
			        type: 'error',
			        layout: 'topCenter',
			        timeout: 5000
			    });
			});
			$location.path('/login/');
		}
		if (error === 'adminOnly') {
			$translate('ADMIN_ONLY').then(function (translated) {
				noty({
			        text: translated,
			        type: 'error',
			        layout: 'topCenter',
			        timeout: 5000
			    });
			});
		    $location.path('/');
		}
	});
}]);

ShiftManager.config(['$routeProvider', '$translateProvider', function($routeProvider, $translateProvider) {
	$routeProvider.otherwise({redirectTo: '/login/'});

	$translateProvider.useStaticFilesLoader({
	    prefix: 'translations/locale-',
	    suffix: '.json'
	}).preferredLanguage('bg').useMissingTranslationHandlerLog().useSanitizeValueStrategy('escape');
}]).constant({
	'BASE_URL': 'https://shiftsmanager.firebaseio.com/',
	'CLIENT_ID': 'FILL_IT',
	'SCOPES': ["https://www.googleapis.com/auth/calendar"]
});