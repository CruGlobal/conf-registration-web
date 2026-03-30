import angular from 'angular';
import 'angular-mocks';
import {
  familyLifeMinistryId,
  aiaMinistryId,
} from '../../../app/scripts/constants/ministryIds';
import {
  familyLifeGtmTagId,
  aiaGtmTagId,
} from '../../../app/scripts/constants/gtmTagIds';

describe('Controller: registration', () => {
  let scope,
    $rootScope,
    $httpBackend,
    $location,
    $document,
    modalMessage,
    testData,
    MinistriesCache,
    initializeController;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(
      (
        _$rootScope_,
        $controller,
        $routeParams,
        _$httpBackend_,
        _$location_,
        _$document_,
        _modalMessage_,
        _testData_,
        _MinistriesCache_,
      ) => {
        $rootScope = _$rootScope_;
        modalMessage = _modalMessage_;
        testData = _testData_;
        $httpBackend = _$httpBackend_;
        $location = _$location_;
        $document = _$document_;
        MinistriesCache = _MinistriesCache_;

        MinistriesCache.get();
        $httpBackend.flush();
        scope = $rootScope.$new();
        angular.extend($routeParams, {
          reg: testData.registration.registrants[0].id,
          pageId: testData.conference.registrationPages[0].id,
        });
        $rootScope.registerMode = 'register';

        initializeController = (conference) => {
          $controller('RegistrationCtrl', {
            $scope: scope,
            conference,
            currentRegistration: testData.registration,
            ministryPurposes: testData.ministryPurposes,
          });
        };

        initializeController(testData.conference);
      },
    ),
  );

  describe('currentRegistrationErrorMessage', () => {
    it('should show error modal when currentRegistrationErrorMessage is defined', () => {
      spyOn(modalMessage, 'error');
      $rootScope.currentRegistrationErrorMessage = 'Something went wrong';
      initializeController(testData.conference);

      expect(modalMessage.error).toHaveBeenCalledWith('Something went wrong');
    });

    it('should not show error modal when currentRegistrationErrorMessage is undefined', () => {
      spyOn(modalMessage, 'error');
      delete $rootScope.currentRegistrationErrorMessage;
      initializeController(testData.conference);

      expect(modalMessage.error).not.toHaveBeenCalled();
    });
  });

  describe('closed/full/open', () => {
    it('should initialize as open when registration is open and are no registration limits', () => {
      initializeController({
        ...testData.conference,
        registrationOpen: true,
        useTotalCapacity: false,
      });

      expect(scope.closed).toBe(false);
      expect(scope.full).toBe(false);
      expect(scope.open).toBe(true);
    });

    it('should initialize as open when registration is open and there is available capacity', () => {
      initializeController({
        ...testData.conference,
        registrationOpen: true,
        useTotalCapacity: true,
        availableCapacity: 10,
      });

      expect(scope.closed).toBe(false);
      expect(scope.full).toBe(false);
      expect(scope.open).toBe(true);
    });

    it('should initialize as closed when registration is closed', () => {
      initializeController({
        ...testData.conference,
        registrationOpen: false,
        useTotalCapacity: false,
      });

      expect(scope.closed).toBe(true);
      expect(scope.full).toBe(false);
      expect(scope.open).toBe(false);
    });

    it('should initialize as closed when registration is manually closed', () => {
      initializeController({
        ...testData.conference,
        registrationOpen: true,
        manuallyClosed: true,
        useTotalCapacity: false,
      });

      expect(scope.closed).toBe(true);
      expect(scope.full).toBe(false);
      expect(scope.open).toBe(false);
    });

    it('should initialize as full when there is no available capacity and no primary exempt type', inject((
      $routeParams,
    ) => {
      const nonExemptTypeId = testData.conference.registrantTypes[0].id;
      $routeParams.regType = nonExemptTypeId;
      initializeController({
        ...testData.conference,
        useTotalCapacity: true,
        availableCapacity: 0,
      });

      expect(scope.closed).toBe(false);
      expect(scope.full).toBe(true);
      expect(scope.open).toBe(false);
    }));

    it('should not be full when regType parameter is an exempt type', inject((
      $routeParams,
    ) => {
      const exemptTypeId = testData.conference.registrantTypes[2].id;
      $routeParams.regType = exemptTypeId;

      initializeController({
        ...testData.conference,
        useTotalCapacity: true,
        availableCapacity: 0,
      });

      expect(scope.closed).toBe(false);
      expect(scope.full).toBe(false);
      expect(scope.open).toBe(true);
    }));

    it('should not be full when user already has registrants in their registration group', inject(() => {
      initializeController({
        ...testData.conference,
        useTotalCapacity: true,
        availableCapacity: 0,
      });

      expect(scope.closed).toBe(false);
      expect(scope.full).toBe(false);
      expect(scope.open).toBe(true);
    }));
  });

  describe('almostFull', () => {
    it('should initialize as true when >= 80% full but not 100% full', () => {
      initializeController({
        ...testData.conference,
        useTotalCapacity: true,
        availableCapacity: 15,
        totalCapacity: 100,
      });

      expect(scope.almostFull).toBe(true);
    });

    it('should initialize as false when < 80% full', () => {
      initializeController({
        ...testData.conference,
        useTotalCapacity: true,
        availableCapacity: 25,
        totalCapacity: 100,
      });

      expect(scope.almostFull).toBe(false);
    });

    it('should initialize as false when 100% full or greater', () => {
      let conference = {
        ...testData.conference,
        useTotalCapacity: true,
        availableCapacity: 0,
        totalCapacity: 100,
      };
      initializeController(conference);

      expect(scope.almostFull).toBe(false);

      conference = {
        ...conference,
        availableCapacity: -5,
      };
      initializeController(conference);

      expect(scope.almostFull).toBe(false);
    });
  });

  describe('Event info', () => {
    it('should return the ministry name for the conference', () => {
      initializeController({
        ...testData.conference,
        ministry: testData.ministries[0].id,
      });

      expect(scope.ministryName).toEqual(testData.ministries[0].name);
    });

    it('should return a null if the conference ministry is not found', () => {
      initializeController({
        ...testData.conference,
        ministry: 'non-existent-ministry-id',
      });

      expect(scope.ministryName).toBeNull();
    });

    it('should return the activity name for the conference', () => {
      initializeController({
        ...testData.conference,
        ministry: testData.ministries[0].id,
        ministryActivity: testData.ministries[0].activities[0].id,
      });

      expect(scope.activityName).toEqual(
        testData.ministries[0].activities[0].name,
      );
    });

    it('should return a null if the conference activity is not found', () => {
      initializeController({
        ...testData.conference,
        ministry: testData.ministries[0].id,
        ministryActivity: 'non-existent-activity-id',
      });

      expect(scope.activityName).toBeNull();
    });

    it('should return the ministry purpose name for the conference', () => {
      initializeController({
        ...testData.conference,
        type: testData.ministryPurposes[0].id,
      });

      expect(scope.ministryPurposeName).toEqual(
        testData.ministryPurposes[0].name,
      );
    });

    it('should return a null if the conference ministry purpose is not found', () => {
      initializeController({
        ...testData.conference,
        type: 'non-existent-purpose-id',
      });

      expect(scope.ministryPurposeName).toBeNull();
    });

    it('should return null for activity when ministry is not found', () => {
      initializeController({
        ...testData.conference,
        ministry: 'non-existent-ministry-id',
        ministryActivity: 'some-activity-id',
      });

      expect(scope.activityName).toBeNull();
    });
  });

  describe('isFamilyLifeEvent', () => {
    beforeEach(() => {
      $document[0].querySelectorAll('#fl-gtm').forEach((el) => el.remove());
      $document[0].querySelectorAll('noscript').forEach((el) => el.remove());
    });

    afterEach(() => {
      $document[0].querySelectorAll('#fl-gtm').forEach((el) => el.remove());
      $document[0].querySelectorAll('noscript').forEach((el) => el.remove());
    });

    it('should render GTM script when event is Family Life', () => {
      initializeController({
        ...testData.conference,
        ministry: familyLifeMinistryId,
      });

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScript = scripts.find((s) =>
        s.innerHTML.includes(familyLifeGtmTagId),
      );
      const noScripts = Array.from($document[0].querySelectorAll('noscript'));
      const gtmNoScript = noScripts.find((s) =>
        s.innerHTML.includes(familyLifeGtmTagId),
      );

      expect(gtmScript).not.toBeUndefined();
      expect(gtmNoScript).not.toBeUndefined();
    });

    it('should not render GTM script when event is not Family Life', () => {
      initializeController({
        ...testData.conference,
        ministry: 'some-other-ministry',
      });

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScript = scripts.find((s) =>
        s.innerHTML.includes(familyLifeGtmTagId),
      );
      const noScripts = Array.from($document[0].querySelectorAll('noscript'));
      const gtmNoScript = noScripts.find((s) =>
        s.innerHTML.includes(familyLifeGtmTagId),
      );

      expect(gtmScript).toBeUndefined();
      expect(gtmNoScript).toBeUndefined();
    });

    it('should not render duplicate GTM script if already rendered', () => {
      const conference = {
        ...testData.conference,
        ministry: familyLifeMinistryId,
      };
      initializeController(conference);
      initializeController(conference);

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScripts = scripts.filter((s) =>
        s.innerHTML.includes(familyLifeGtmTagId),
      );
      const noScripts = Array.from($document[0].querySelectorAll('noscript'));
      const gtmNoScripts = noScripts.filter((s) =>
        s.innerHTML.includes(familyLifeGtmTagId),
      );

      expect(gtmScripts.length).toEqual(1);
      expect(gtmNoScripts.length).toEqual(1);
    });

    it('should remove GTM script when navigating away from registration', () => {
      initializeController({
        ...testData.conference,
        ministry: familyLifeMinistryId,
      });

      $rootScope.$broadcast('$routeChangeStart', {
        originalPath: '/eventDashboard',
        params: {},
      });

      const gtmScript = $document[0].querySelectorAll('#fl-gtm');
      const noScripts = Array.from($document[0].querySelectorAll('noscript'));
      const gtmNoScript = noScripts.find((s) =>
        s.innerHTML.includes(familyLifeGtmTagId),
      );

      expect(gtmScript.length).toEqual(0);
      expect(gtmNoScript).toBeUndefined();
    });

    it('should not remove GTM script when navigating within registration', () => {
      initializeController({
        ...testData.conference,
        ministry: familyLifeMinistryId,
      });

      $rootScope.$broadcast('$routeChangeStart', {
        originalPath: '/register/:conferenceId/page/:pageId?',
        params: {},
      });

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScript = scripts.find((s) =>
        s.innerHTML.includes(familyLifeGtmTagId),
      );

      expect(gtmScript).not.toBeUndefined();
    });

    it('should not remove GTM script when navigating to review registration', () => {
      initializeController({
        ...testData.conference,
        ministry: familyLifeMinistryId,
      });

      $rootScope.$broadcast('$routeChangeStart', {
        originalPath: '/reviewRegistration/:conferenceId',
        params: {},
      });

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScript = scripts.find((s) =>
        s.innerHTML.includes(familyLifeGtmTagId),
      );

      expect(gtmScript).not.toBeUndefined();
    });

    it('should not render GTM script when GTM tag ID is invalid', () => {
      initializeController({
        ...testData.conference,
        ministry: familyLifeMinistryId,
      });

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScript = scripts.find((s) =>
        s.innerHTML.includes('GTM-INVALID'),
      );
      const noScripts = Array.from($document[0].querySelectorAll('noscript'));
      const gtmNoScript = noScripts.find((s) =>
        s.innerHTML.includes('GTM-INVALID'),
      );

      expect(gtmScript).toBeUndefined();
      expect(gtmNoScript).toBeUndefined();
    });
  });

  describe('isAthletesInActionEvent', () => {
    beforeEach(() => {
      $document[0].querySelectorAll('#aia-gtm').forEach((el) => el.remove());
      $document[0].querySelectorAll('noscript').forEach((el) => el.remove());
    });

    afterEach(() => {
      $document[0].querySelectorAll('#aia-gtm').forEach((el) => el.remove());
      $document[0].querySelectorAll('noscript').forEach((el) => el.remove());
    });

    it('should render GTM script when event is Athletes In Action', () => {
      initializeController({
        ...testData.conference,
        ministry: aiaMinistryId,
      });

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScript = scripts.find((s) => s.innerHTML.includes(aiaGtmTagId));
      const noScripts = Array.from($document[0].querySelectorAll('noscript'));
      const gtmNoScript = noScripts.find((s) =>
        s.innerHTML.includes(aiaGtmTagId),
      );

      expect(gtmScript).not.toBeUndefined();
      expect(gtmNoScript).not.toBeUndefined();
    });

    it('should not render GTM script when event is not Athletes In Action', () => {
      initializeController({
        ...testData.conference,
        ministry: 'some-other-ministry',
      });

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScript = scripts.find((s) => s.innerHTML.includes(aiaGtmTagId));
      const noScripts = Array.from($document[0].querySelectorAll('noscript'));
      const gtmNoScript = noScripts.find((s) =>
        s.innerHTML.includes(aiaGtmTagId),
      );

      expect(gtmScript).toBeUndefined();
      expect(gtmNoScript).toBeUndefined();
    });

    it('should not render duplicate GTM script if already rendered', () => {
      const conference = {
        ...testData.conference,
        ministry: aiaMinistryId,
      };
      initializeController(conference);
      initializeController(conference);

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScripts = scripts.filter((s) =>
        s.innerHTML.includes(aiaGtmTagId),
      );
      const noScripts = Array.from($document[0].querySelectorAll('noscript'));
      const gtmNoScripts = noScripts.filter((s) =>
        s.innerHTML.includes(aiaGtmTagId),
      );

      expect(gtmScripts.length).toEqual(1);
      expect(gtmNoScripts.length).toEqual(1);
    });

    it('should remove GTM script when navigating away from registration', () => {
      initializeController({
        ...testData.conference,
        ministry: aiaMinistryId,
      });

      $rootScope.$broadcast('$routeChangeStart', {
        originalPath: '/eventDashboard',
        params: {},
      });

      const gtmScript = $document[0].querySelectorAll('#aia-gtm');
      const noScripts = Array.from($document[0].querySelectorAll('noscript'));
      const gtmNoScript = noScripts.find((s) =>
        s.innerHTML.includes(aiaGtmTagId),
      );

      expect(gtmScript.length).toEqual(0);
      expect(gtmNoScript).toBeUndefined();
    });

    it('should not remove GTM script when navigating within registration', () => {
      initializeController({
        ...testData.conference,
        ministry: aiaMinistryId,
      });

      $rootScope.$broadcast('$routeChangeStart', {
        originalPath: '/register/:conferenceId/page/:pageId?',
        params: {},
      });

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScript = scripts.find((s) => s.innerHTML.includes(aiaGtmTagId));

      expect(gtmScript).not.toBeUndefined();
    });

    it('should not remove GTM script when navigating to review registration', () => {
      initializeController({
        ...testData.conference,
        ministry: aiaMinistryId,
      });

      $rootScope.$broadcast('$routeChangeStart', {
        originalPath: '/reviewRegistration/:conferenceId',
        params: {},
      });

      const scripts = Array.from($document[0].querySelectorAll('script'));
      const gtmScript = scripts.find((s) => s.innerHTML.includes(aiaGtmTagId));

      expect(gtmScript).not.toBeUndefined();
    });
  });

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
