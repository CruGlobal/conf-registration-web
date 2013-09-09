'use strict';

angular.module('confRegistrationWebApp')
  .controller('ConferenceCardCtrl', function ($scope, $rootScope) {
	
	$scope.$on('flipevent', function (event, idToFlip) {
		console.log($scope.$id, idToFlip);
		if ($scope.$id === idToFlip && !$scope.flip) {
			$scope.flip = 'js-flip'; // js-flip is a css class
		} else {
			$scope.flip = '';
		}
	});
	

	$scope.flipCard = function () {
		$rootScope.$broadcast('flipevent', $scope.$id);
	};
});
