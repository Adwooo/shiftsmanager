angular.module('ShiftManager.language', []);

ShiftManager.controller('LanguageSwitchController', ['$scope', '$rootScope', '$translate', function($scope, $rootScope, $translate) {
    $scope.changeLanguage = function(langKey) {
      $translate.use(langKey);
    };

    $rootScope.$on('$translateChangeSuccess', function(event, data) {
      var language = data.language;
      $rootScope.lang = language;
    });
}]);