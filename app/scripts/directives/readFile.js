angular
  .module('confRegistrationWebApp')
  .directive('readFile', ($timeout, $q) => {
    function readFile(file, scope) {
      const deferred = $q.defer();
      const reader = new FileReader();
      reader.onload = () => {
        scope.$apply(() => {
          deferred.resolve(reader.result);
        });
      };
      reader.onerror = () => {
        scope.$apply(() => {
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
      link: ($scope, el) => {
        function getFile(file) {
          readFile(file, $scope).then(result => {
            $timeout(() => {
              $scope.ngModel = result;
            });
          });
        }

        el.bind('change', e => {
          getFile((e.srcElement || e.target).files[0]);
        });
      },
    };
  });
