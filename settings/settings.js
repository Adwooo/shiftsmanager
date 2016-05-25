angular.module('ShiftManager.settings', ['ShiftManager.users.Authentication']);

ShiftManager.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/settings/', {
		templateUrl: 'settings/settings.html',
		controller: 'SettingsController',
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

ShiftManager.controller('SettingsController', ['$scope', '$location', '$translate', '$firebaseObject', 'BASE_URL', function($scope, $location, $translate, $firebaseObject, BASE_URL) {
	var ref = new Firebase(BASE_URL + 'settings/');
	var settingsObj = $firebaseObject(ref);

	settingsObj.$loaded().then(function() {
		$scope.settings = {
			shiftsPerDay: settingsObj.ShiftsPerDay,
			degree1en: settingsObj.degree1en,
			degree1bg: settingsObj.degree1bg,
			degree2en: settingsObj.degree2en,
			degree2bg: settingsObj.degree2bg,
			degree3en: settingsObj.degree3en,
			degree3bg: settingsObj.degree3bg,
			role1en: settingsObj.role1en,
			role1bg: settingsObj.role1bg,
			role2en: settingsObj.role2en,
			role2bg: settingsObj.role2bg,
			role3en: settingsObj.role3en,
			role3bg: settingsObj.role3bg
		};
	});


	$scope.changeSettings = function(settings) {
		console.log(settings);
		new Firebase(BASE_URL + 'settings/').update({
			'ShiftsPerDay': settings.shiftsPerDay,
			'degree1en': settings.degree1en,
			'degree1bg': settings.degree1bg,
			'degree2en': settings.degree2en,
			'degree2bg': settings.degree2bg,
			'degree3en': settings.degree3en,
			'degree3bg': settings.degree3bg,
			'role1en': settings.role1en,
			'role1bg': settings.role1bg,
			'role2en': settings.role2en,
			'role2bg': settings.role2bg,
			'role3en': settings.role3en,
			'role3bg': settings.role3bg
		});
		$translate('SAVE_SETTINGS').then(function (translated) {
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