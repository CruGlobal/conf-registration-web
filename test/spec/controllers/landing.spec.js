import 'angular-mocks';
import moment from 'moment';

describe('Controller: landingCtrl', function () {
  var scope;
  let testData;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(($rootScope, $controller, _testData_) => {
      testData = _testData_;
      scope = $rootScope.$new();

      $controller('landingCtrl', {
        $scope: scope,
        conference: testData.conference,
      });
    }),
  );

  describe('isEventRegistrationClosed', () => {
    it('returns true if useTotalCapacity is true and availableCapacity is 0', () => {
      testData.conference.useTotalCapacity = true;
      testData.conference.availableCapacity = 0;
      testData.conference.manuallyClosed = false;

      expect(scope.isEventRegistrationClosed(testData.conference)).toBe(true);
    });

    it('returns true if useTotalCapacity is true and availableCapacity is negative', () => {
      testData.conference.useTotalCapacity = true;
      testData.conference.availableCapacity = -5;
      testData.conference.manuallyClosed = false;

      expect(scope.isEventRegistrationClosed(testData.conference)).toBe(true);
    });

    it('returns true if manuallyClosed is true', () => {
      testData.conference.useTotalCapacity = false;
      testData.conference.availableCapacity = 10;
      testData.conference.manuallyClosed = true;

      expect(scope.isEventRegistrationClosed(testData.conference)).toBe(true);
    });

    it('returns false if useTotalCapacity is false and manuallyClosed is false', () => {
      testData.conference.useTotalCapacity = false;
      testData.conference.availableCapacity = 10;
      testData.conference.manuallyClosed = false;

      expect(scope.isEventRegistrationClosed(testData.conference)).toBe(false);
    });

    it('returns false if useTotalCapacity is true and availableCapacity > 0 and manuallyClosed is false', () => {
      testData.conference.useTotalCapacity = true;
      testData.conference.availableCapacity = 5;
      testData.conference.manuallyClosed = false;

      expect(scope.isEventRegistrationClosed(testData.conference)).toBe(false);
    });
  });

  describe('dateFilter', () => {
    beforeEach(() => {
      jasmine.clock().mockDate(moment('2017-03-01').toDate());
      scope.eventFilters = {
        date: null,
      };
    });

    afterEach(() => {
      jasmine.clock().uninstall();
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
