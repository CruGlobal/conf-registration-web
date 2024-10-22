import angular from 'angular';
import 'angular-mocks';

describe('Controller: registration', () => {
  let scope, $httpBackend, $location, modalMessage, testData;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(
      (
        $rootScope,
        $controller,
        $routeParams,
        _$httpBackend_,
        _$location_,
        _modalMessage_,
        _testData_,
        _validateRegistrant_,
      ) => {
        modalMessage = _modalMessage_;
        testData = _testData_;
        $httpBackend = _$httpBackend_;
        $location = _$location_;
        scope = $rootScope.$new();
        scope.conference = testData.conference;
        scope.currentRegistration = testData.registration;
        angular.extend($routeParams, {
          reg: testData.registration.registrants[0].id,
          pageId: testData.conference.registrationPages[0].id,
        });
        $rootScope.registerMode = 'register';

        $controller('RegistrationCtrl', {
          $rootScope,
          $scope: scope,
          conference: testData.conference,
          currentRegistration: testData.registration,
          $routeParams,
          validateRegistrant: _validateRegistrant_,
        });
      },
    ),
  );

  it('should have validPages based on current registrant', () => {
    let validPages = scope.validPages;

    expect(validPages.length).toEqual(3);
  });

  it('should getFirstValidPage', () => {
    let currentRegistrant = scope.currentRegistrant;

    expect(currentRegistrant).toEqual(testData.registration.registrants[0].id);
    let validFirstPage = scope.getValidFirstPage(currentRegistrant);

    expect(validFirstPage).toEqual(scope.conference.registrationPages[0]);
  });

  it('should run checkValidPages and update validPages', () => {
    scope.conference.registrationPages = [
      {
        id: '5c69bfcc-9e35-4bd8-8358-fe50fd86052d',
        conferenceId: 'c63b8abf-52ff-4cc4-afbc-5923b01f1ab0',
        title: 'Some number questions',
        position: 0,
        blocks: [
          {
            id: 'e088fefc-eb9c-4904-b849-017facc9e063',
            pageId: '5c69bfcc-9e35-4bd8-8358-fe50fd86052d',
            title: 'Number',
            exportFieldTitle: null,
            type: 'numberQuestion',
            required: true,
            position: 0,
            content: null,
            profileType: null,
            registrantTypes: [],
            rules: [],
          },
        ],
      },
      {
        id: '5c69bfcc-9e35-4bd8-8358-fe50fd86052d',
        conferenceId: 'c63b8abf-52ff-4cc4-afbc-5923b01f1ab0',
        title: 'Some more number questions',
        position: 0,
        blocks: [
          {
            id: 'e088fefc-eb9c-4904-b849-017facc9e063',
            pageId: '5c69bfcc-9e35-4bd8-8358-fe50fd86052d',
            title: 'Other number question',
            exportFieldTitle: null,
            type: 'numberQuestion',
            required: false,
            position: 0,
            content: null,
            profileType: null,
            registrantTypes: ['47de2c40-19dc-45b3-9663-5c005bd6464b'],
            rules: [],
          },
        ],
      },
    ];

    expect(scope.validPages.length).toEqual(3);
    scope.currentRegistrant = testData.registration.registrants[1].id;
    scope.checkValidPages();

    expect(scope.currentRegistrant).toEqual(
      scope.currentRegistration.registrants[1].id,
    );

    expect(scope.validPages.length).toEqual(1);
  });

  it('should run nextPage', () => {
    const currentPage = scope.page;

    expect(currentPage).toEqual(scope.conference.registrationPages[0]);

    const checkValidPagesSpy = spyOn(scope, 'checkValidPages');

    const nextPage = scope.nextPage();

    expect(checkValidPagesSpy).toHaveBeenCalledWith();

    expect(scope.validPages.length).toEqual(3);

    expect(nextPage).toEqual(scope.conference.registrationPages[1]);
  });

  describe('when saveAnswers fails', () => {
    beforeEach(() => {
      $httpBackend.expectPUT(/answers\/.+/).respond(500, {
        parameterViolations: [
          {
            message: 'Failed validation',
          },
        ],
      });
      spyOn($location, 'path');
      scope.currentRegistration.registrants[0].answers[0].value = 'Changed';
    });

    it('previousPage does not change the URL', () => {
      scope.previousPage();
      $httpBackend.flush();

      expect($location.path).not.toHaveBeenCalledWith(
        `/reviewRegistration/${scope.conference.id}`,
      );
    });

    it('goToNext does not change the URL', () => {
      scope.goToNext();
      $httpBackend.flush();

      expect($location.path).not.toHaveBeenCalledWith(
        `/register/${scope.conference.id}/page/${scope.conference.registrationPages[1].id}`,
      );
    });

    it('reviewRegistration does not change the URL', () => {
      scope.reviewRegistration();
      $httpBackend.flush();

      expect($location.path).not.toHaveBeenCalledWith(
        `/reviewRegistration/${scope.conference.id}`,
      );
    });

    it('saveAllAnswers shows an error modal', () => {
      spyOn(modalMessage, 'error');

      scope.reviewRegistration();
      $httpBackend.flush();

      expect(modalMessage.error).toHaveBeenCalledWith('Failed validation');
    });
  });

  describe('when saveAnswers succeeds', () => {
    beforeEach(() => {
      $httpBackend.expectPUT(/answers\/.+/).respond(200, {});
      spyOn($location, 'path');
      scope.currentRegistration.registrants[0].answers[0].value = 'Changed';
    });

    it('previousPage changes the URL', () => {
      scope.previousPage();
      $httpBackend.flush();

      expect($location.path).toHaveBeenCalledWith(
        `/reviewRegistration/${scope.conference.id}`,
      );
    });

    it('goToNext changes the URL', () => {
      scope.goToNext();
      $httpBackend.flush();

      expect($location.path).toHaveBeenCalledWith(
        `/register/${scope.conference.id}/page/${scope.conference.registrationPages[1].id}`,
      );
    });

    it('reviewRegistration changes the URL', () => {
      scope.reviewRegistration();
      $httpBackend.flush();

      expect($location.path).toHaveBeenCalledWith(
        `/reviewRegistration/${scope.conference.id}`,
      );
    });
  });
});
