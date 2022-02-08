import 'angular-mocks';
import moment from 'moment';

describe('Controller: landingCtrl', function () {
  var scope;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();

      $controller('landingCtrl', {
        $scope: scope,
      });
    }),
  );

  describe('dateFilter', () => {
    beforeEach(() => {
      jasmine.clock().mockDate(moment('2017-03-01').toDate());
      scope.eventFilters = {
        date: null,
      };
    });

    it('should return true if not set', function () {
      expect(scope.dateFilter({ eventStartTime: moment() })).toEqual(true);

      expect(
        scope.dateFilter({ eventStartTime: moment().add(1, 'year') }),
      ).toEqual(true);
    });

    it('should return true for This Week', function () {
      scope.eventFilters.date = 'This Week';

      expect(
        scope.dateFilter({ eventStartTime: moment().add(3, 'days') }),
      ).toEqual(true);

      expect(
        scope.dateFilter({ eventStartTime: moment().add(1, 'weeks') }),
      ).toEqual(false);
    });

    it('should return true for Next Week', function () {
      scope.eventFilters.date = 'Next Week';

      expect(
        scope.dateFilter({ eventStartTime: moment().add(3, 'days') }),
      ).toEqual(false);

      expect(
        scope.dateFilter({ eventStartTime: moment().add(1, 'weeks') }),
      ).toEqual(true);
    });

    it('should return true for This Month', function () {
      scope.eventFilters.date = 'This Month';

      expect(
        scope.dateFilter({ eventStartTime: moment().add(1, 'weeks') }),
      ).toEqual(true);

      expect(
        scope.dateFilter({ eventStartTime: moment().add(3, 'weeks') }),
      ).toEqual(true);

      expect(
        scope.dateFilter({ eventStartTime: moment().add(2, 'months') }),
      ).toEqual(false);
    });

    it('should return true for Next Month', function () {
      scope.eventFilters.date = 'Next Month';

      expect(
        scope.dateFilter({ eventStartTime: moment().add(1, 'weeks') }),
      ).toEqual(false);

      expect(
        scope.dateFilter({ eventStartTime: moment().add(1, 'months') }),
      ).toEqual(true);
    });

    it('should return true for Greater Than Next Month', function () {
      scope.eventFilters.date = 'Greater Than Next Month';

      expect(
        scope.dateFilter({ eventStartTime: moment().add(1, 'months') }),
      ).toEqual(false);

      expect(
        scope.dateFilter({ eventStartTime: moment().add(2, 'months') }),
      ).toEqual(true);
    });
  });
});
