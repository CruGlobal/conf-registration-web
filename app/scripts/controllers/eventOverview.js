/* eslint-disable angular/no-private-call */

angular
  .module('confRegistrationWebApp')
  .controller('eventOverviewCtrl', function(
    $rootScope,
    $scope,
    $location,
    $route,
    $http,
    $sce,
    ConfCache,
    conference,
  ) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container event-overview',
      bodyClass: '',
      confId: conference.id,
      footer: true,
    };

    $scope.conference = conference;
    $scope.imageSrc = '';
    $scope.selectedImage = '';
    $scope.includeImageToAllPages = false;

    $scope.saveImage = function() {
      $http({
        method: 'PUT',
        url: 'conferences/' + conference.id + '/image',
        data: {
          image: $scope.imageSrc,
          includeImageToAllPages: $scope.includeImageToAllPages,
        },
      }).then(function() {
        $scope.conference.image = $scope.imageSrc;
        $scope.conference.includeImageToAllPages =
          $scope.includeImageToAllPages;
        ConfCache.update(conference.id, $scope.conference);
        $scope.notify = {
          class: 'alert-success',
          message: $sce.trustAsHtml(
            '<strong>Saved!</strong> Event image details have been updated.',
          ),
        };
      });
    };

    var port = '';
    if ($location.$$port !== 80 && $location.$$port !== 443) {
      port = ':' + $location.$$port;
    }
    var baseUrl =
      $location.$$protocol +
      '://' +
      $location.$$host +
      port +
      '/register/' +
      conference.id;
    $scope.registrationUrl = {};
    $scope.registrationUrl[0] = baseUrl;

    angular.forEach(conference.registrantTypes, function(t) {
      $scope.registrationUrl[t.id] = baseUrl + '?regType=' + t.id;
    });
  });
