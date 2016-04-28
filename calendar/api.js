angular.module('ShiftManager.calendar.API', []).factory('API', ['$rootScope', '$http', '$q', 'CLIENT_ID', 'SCOPES', function($rootScope, $http, $q, CLIENT_ID, SCOPES) {
	var calApi = {
		// Initiate auth flow in response to user clicking authorize button. @param {Event} event Button click event.
	    handleAuthClick: function(event) {
	    	gapi.auth.authorize(
	    		{client_id: CLIENT_ID, scope: SCOPES, immediate: false},
	    		calApi.handleAuthResult);
	    	return false;
	    }, //handleAuthClick
		// Handle response from authorization server. * @param {Object} authResult Authorization result.
		handleAuthResult: function(authResult) {
			localStorage.access_token = authResult.access_token;
			console.log(authResult);
		}, //handleAuthResult
    	calendarCall: function() {
	    	var deferred = $q.defer();
    		$http.defaults.headers.common.Authorization = 'Bearer ' + localStorage.access_token;
			$http.get('https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest?fields=rootUrl%2CservicePath%2Cresources%2Cparameters%2Cmethods&pp=0').then(function(response) {
				deferred.resolve(response);
				console.log(response);
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
    	}, // calendarCall
    	eventsCall: function(maxResults, orderBy, showDeleted, singleEvents, timeMin) {
    		var deferred = $q.defer();
    		$http.defaults.headers.common.Authorization = 'Bearer ' + localStorage.access_token;
    		$http.get('https://content.googleapis.com/calendar/v3/calendars/primary/events?maxResults=' + maxResults + '&orderBy=' + orderBy + '&showDeleted=' + showDeleted + '&singleEvents=' + singleEvents + '&timeMin=' + timeMin).then(function(response) {
				deferred.resolve(response.data);
				console.log(response.data);
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
    	}, //eventsCall
    	createNewEvent: function(event) {
    		var deferred = $q.defer();
			$http.defaults.headers.common.Authorization = 'Bearer ' + localStorage.access_token;
			$http({
			    method: 'POST',
			    url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events?key=' + CLIENT_ID,
			    headers: {'Content-Type': 'application/json'},
			    data: event
			}).then(function(response) {
				deferred.resolve(response.data);
				console.log(response.data);
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
    	} //createNewEvent
	}; //var calApi
	return calApi;
}]); //factory