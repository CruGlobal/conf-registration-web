/* eslint-disable angular/no-private-call */

angular
  .module('confRegistrationWebApp')
  .controller(
    'eventOverviewCtrl',
    function ($rootScope, $scope, $location, $filter, conference) {
      $rootScope.globalPage = {
        type: 'admin',
        mainClass: 'container event-overview',
        bodyClass: '',
        confId: conference.id,
        footer: true,
      };

      $scope.conference = conference;

      $scope.displayAddress = $filter('eventAddressFormat')(
        $scope.conference.locationCity,
        $scope.conference.locationState,
        $scope.conference.locationZipCode,
        $scope.conference.locationCountry,
      );

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

      angular.forEach(conference.registrantTypes, function (t) {
        $scope.registrationUrl[t.id] = baseUrl + '?regType=' + t.id;
      });

      $scope.nonAllowedTypeKeys = ['SPOUSE'];
      $scope.excludeNonAllowedType = function (type) {
        if (type.defaultTypeKey === 'SPOUSE') {
          const coupleTypes = _.filter(conference.registrantTypes, {
            defaultTypeKey: 'COUPLE',
          });

          if (coupleTypes.length === 0) {
            return true;
          }

          // Check if this spouse is associated with any couple
          const spouseIsAssociated = coupleTypes.some((coupleType) => {
            if (
              !coupleType.allowedRegistrantTypeSet ||
              coupleType.allowedRegistrantTypeSet.length === 0
            ) {
              return false;
            }

            const hasAssociation = coupleType.allowedRegistrantTypeSet.some(
              (association) => {
                const isMatch = association.childRegistrantTypeId === type.id;

                const hasChildRegistrants =
                  association.numberOfChildRegistrants > 0;

                return isMatch && hasChildRegistrants;
              },
            );
            return hasAssociation;
          });
          return !spouseIsAssociated;
        }

        return $scope.nonAllowedTypeKeys.indexOf(type.defaultTypeKey) === -1;
      };
    },
  );
