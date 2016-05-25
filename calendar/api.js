angular.module('ShiftManager.calendar.API', []).factory('API', ['$rootScope', '$http', '$location', '$q', 'CLIENT_ID', 'SCOPES', function($rootScope, $http, $location, $q, CLIENT_ID, SCOPES) {
	var calApi = {
		// Initiate auth flow in response to user clicking authorize button. @param {Event} event Button click event.
	    alreadyRegistered: function(event) {
	    	var deferred = $q.defer();
			$http({
			    method: 'JSONP',
			    url: 'https://accounts.google.com/o/oauth2/v4/auth?response_type=code&client_id=' + CLIENT_ID + '&redirect_uri=http://localhost:80/shiftsmanager/&scope=' + SCOPES + '&access_type=offline',
			    headers: 
			    	{'Access-Control-Allow-Origin': '*',
	                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	                'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'},
    			dataType: 'jsonp'
			}).then(function(response) {
				deferred.resolve(response.data);
	  			console.log(response.data);
			}, function(error) {
				deferred.reject(error);
				console.log(error);
			});
			return deferred.promise;
	    }, //alreadyRegistered
		// Initiate auth flow in response to user clicking authorize button. @param {Event} event Button click event.
	    // handleAuthClick: function(event) {
	    // 	var deferred = $q.defer();
	    // 	gapi.auth.authorize(
	    // 		{client_id: CLIENT_ID, scope: SCOPES, immediate: false}, function(authResult) {
					// localStorage.access_token = authResult.access_token;
					// deferred.resolve(authResult);
					// console.log(authResult);
	    // 		});
	    // 	return deferred.promise;
	    // }, //handleAuthClick
    	calendarCall: function() {
	    	var deferred = $q.defer();
    		$http.defaults.headers.common.Authorization = 'Bearer ' + localStorage.access_token;
			$http.get('https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest?fields=rootUrl%2CservicePath%2Cresources%2Cparameters%2Cmethods&pp=0').then(function(response) {
				deferred.resolve(response.data);
				console.log(response.data);
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
    	}, //createNewEvent
    	checkIfAccessToken: function() {
    		var deferred = $q.defer();
    		$http.get('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + localStorage.access_token).then(function(getToken) {
    			deferred.resolve(getToken.data);
    		}, function(error) {
    			if (error.data.error_description === 'Invalid Value') {
    				window.location.href = 'http://localhost:80/shiftsmanager/calendar/oauth_callback.php';
    			}
    			deferred.reject(error);
    		});
    		return deferred.promise;
    	}
	}; //var calApi
	return calApi;
}]); //factory