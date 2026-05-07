angular.module('confRegistrationWebApp').directive('readFile', ($q) => {
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
        readFile(file, $scope).then((result) => {
          $scope.ngModel = result;
        });
      }

      el.bind('change', (e) => {
        const file = e.target.files[0];
        // files can be empty if a file was uploaded, then the user clicks the
        // Choose File button again but closes the dialog without selecting a file
        if (file) {
          getFile(file);
        } else {
          // Clear the uploaded file if the uploaded file was removed
          $scope.$apply(() => {
            $scope.ngModel = '';
          });
        }
      });
    },
  };
});
