import 'angular-mocks';

describe('Controller: ReviewRegistrationCtrl', function () {
    var scope;

    beforeEach(angular.mock.module('confRegistrationWebApp'));

    beforeEach(angular.mock.inject(function ($rootScope, $controller, testData) {

        scope = $rootScope.$new();
        scope.answers = testData.registration.registrants[0].answers;

        $controller('ReviewRegistrationCtrl', {
            $scope: scope, currentRegistration: testData.registration, conference: testData.conference
        });
    }));

    it('findAnswer should return answer', function () {
        expect(scope.findAnswer('9b83eebd-b064-4edf-92d0-7982a330272a').value).toBe('M');
    });

    it('blockVisibleForRegistrant should be true', function () {
        expect(scope.blockVisibleForRegistrant(scope.conference.registrationPages[1].blocks[0], scope.currentRegistration.registrants[0])).toBe(true);
    });
});
