angular
  .module('confRegistrationWebApp')
  .directive('readFile', function($timeout, $q) {
    function readFile(file, scope) {
      const deferred = $q.defer();
      const reader = new FileReader();
      reader.onload = function() {
        scope.$apply(function() {
          deferred.resolve(reader.result);
        });
      };
      reader.onerror = function() {
        scope.$apply(function() {
          deferred.reject(reader.result);
        });
      };
      reader.readAsDataURL(file);
      return deferred.promise;
    }

    return {
      scope: {
        ngModel: '=',
      },
      link: function($scope, el) {
        function getFile(file) {
          readFile(file, $scope).then(function(result) {
            $timeout(function() {
              $scope.ngModel = result;
            });
          });
        }

        el.bind('change', function(e) {
          getFile((e.srcElement || e.target).files[0]);
        });
      },
    };
  });
