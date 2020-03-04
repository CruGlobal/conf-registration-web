import 'angular-mocks';

describe('Controller: eventOverview', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let scope;
  let testData;
  let $httpBackend;
  let conference;

  beforeEach(
    angular.mock.inject(
      ($rootScope, $controller, _testData_, _$httpBackend_) => {
        testData = _testData_;
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        conference = testData.conference;

        $controller('eventOverviewCtrl', {
          $scope: scope,
          $rootScope: $rootScope,
          conference: testData.conference,
        });
      },
    ),
  );

  it('resetImage should set image and includeImageToAllPages to the value taken from the conference', () => {
    scope.image.includeImageToAllPages = false;
    scope.image.imageSrc = 'new-image';
    scope.resetImage();
    expect(scope.image.includeImageToAllPages).toEqual(
      conference.image.includeImageToAllPages,
    );
    expect(scope.image.image).toEqual(conference.image.image);
  });

  it('saveImage should save image and includeImageToAllPages', () => {
    scope.image.includeImageToAllPages = false;
    scope.image.image = 'new-image';
    $httpBackend
      .whenPUT(/^conferences\/[-a-zA-Z0-9]+\/image\.*/)
      .respond((verb, url, data) => {
        return [200, data, {}];
      });
    scope.saveImage();

    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    expect(scope.image.includeImageToAllPages).toEqual(
      conference.image.includeImageToAllPages,
    );
    expect(scope.image.image).toEqual(conference.image.image);
  });

  it('deleteImage should delete image and set includeImageToAllPages to false', () => {
    $httpBackend
      .whenPUT(/^conferences\/[-a-zA-Z0-9]+\/image\.*/)
      .respond((verb, url, data) => {
        return [200, data, {}];
      });
    scope.deleteImage();

    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    expect(conference.image.includeImageToAllPages).toEqual(false);
    expect(conference.image.image).toEqual('');
  });
});
