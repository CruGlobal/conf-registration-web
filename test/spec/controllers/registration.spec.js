import angular from 'angular';
import 'angular-mocks';

describe('Controller: registration', () => {
  let scope, testData;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(
      (
        $rootScope,
        $controller,
        $routeParams,
        _testData_,
        _validateRegistrant_,
      ) => {
        testData = _testData_;
        scope = $rootScope.$new();
        scope.conference = testData.conference;
        scope.currentRegistration = testData.registration;
        angular.extend($routeParams, {
          reg: testData.registration.registrants[0].id,
          pageId: testData.conference.registrationPages[0].id,
        });

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

    expect(validPages.length).toEqual(2);
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

    expect(scope.validPages.length).toEqual(2);
    scope.currentRegistrant = testData.registration.registrants[1].id;
    scope.checkValidPages();

    expect(scope.currentRegistrant).toEqual(
      scope.currentRegistration.registrants[1].id,
    );

    expect(scope.validPages.length).toEqual(1);
  });
});
