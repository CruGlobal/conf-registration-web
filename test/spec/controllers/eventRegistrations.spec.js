/* eslint-disable angular/log, no-console */
import 'angular-mocks';

describe('Controller: eventRegistrations', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var fakeModal = {
    result: {
      then: function (confirmCallback, cancelCallback) {
        this.confirmCallBack = confirmCallback;
        this.cancelCallback = cancelCallback;
      },
    },
    close: function (item) {
      this.result.confirmCallBack(item);
    },
    dismiss: function (type) {
      this.result.cancelCallback(type);
    },
  };

  var openModal;
  beforeEach(inject(function ($uibModal) {
    openModal = spyOn($uibModal, 'open').and.returnValue(fakeModal);
  }));

  let $controller,
    $httpBackend,
    $q,
    $uibModal,
    $window,
    RegistrationCache,
    testData,
    initController,
    scope;
  beforeEach(
    angular.mock.inject(function (
      $rootScope,
      _$controller_,
      _$httpBackend_,
      _$q_,
      _$uibModal_,
      _$window_,
      _RegistrationCache_,
      _testData_,
    ) {
      $controller = _$controller_;
      $httpBackend = _$httpBackend_;
      $q = _$q_;
      $uibModal = _$uibModal_;
      $window = _$window_;
      RegistrationCache = _RegistrationCache_;
      testData = _testData_;

      spyOn(RegistrationCache, 'getAllForConference').and.returnValue(
        $q.resolve({
          registrations: [testData.registration],
        }),
      );

      initController = (injected) => {
        scope = $rootScope.$new();

        $controller('eventRegistrationsCtrl', {
          $scope: scope,
          conference: testData.conference,
          $uibModal: $uibModal,
          permissions: {},
          ...injected,
        });

        // Make RegistrationCache.getAllForConference() call the then handler in refreshRegistrations
        // to populate $scope.registrations and $scope.registrants
        scope.$digest();
      };

      initController();
    }),
  );

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('queryParameters changes', () => {
    it('goes to the first page when another filter changes', () => {
      scope.$apply(() => {
        scope.queryParameters.page = 2;
      });
      scope.$apply(() => {
        scope.queryParameters.orderBy = 50;
      });

      expect(scope.queryParameters.page).toBe(1);
      expect(scope.queryParameters.orderBy).toBe(50);
    });

    it('scrolls to the top of window when the page changes', () => {
      const scrollTo = spyOn($window, 'scrollTo');
      scope.$apply(() => {
        scope.queryParameters.page = 2;
      });

      expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('builtInColumnsVisible', () => {
    it('uses saved column visibility when available', () => {
      initController({
        $window: {
          localStorage: {
            getItem: () => '{"Email":false}',
          },
        },
      });

      expect(scope.builtInColumnsVisible).toEqual({
        Email: false,
      });
    });

    it('uses default column visibility when saved visibility is unavailable', () => {
      expect(scope.builtInColumnsVisible).toEqual({
        Email: true,
        Group: true,
        GroupId: false,
        Started: true,
        Completed: true,
      });
    });
  });

  describe('toggleColumn', () => {
    it('toggles the column visibility', () => {
      const setItem = spyOn($window.localStorage, 'setItem');
      const block1Index = 0;
      const block1 = scope.blocks[block1Index];
      scope.toggleColumn(block1Index);

      expect(block1.visible).toBe(true);
      expect(setItem).toHaveBeenCalledWith(
        `visibleBlocks:${testData.conference.id}`,
        `["${block1.id}"]`,
      );

      expect(scope.queryParameters.block).toEqual([block1.id]);

      const block2Index = 1;
      const block2 = scope.blocks[block2Index];
      scope.toggleColumn(block2Index);

      expect(block2.visible).toBe(true);
      expect(setItem).toHaveBeenCalledWith(
        `visibleBlocks:${testData.conference.id}`,
        `["${block1.id}","${block2.id}"]`,
      );

      expect(scope.queryParameters.block).toEqual([block1.id, block2.id]);

      scope.toggleColumn(block1Index);

      expect(scope.blocks[0].visible).toBe(false);
      expect(setItem).toHaveBeenCalledWith(
        `visibleBlocks:${testData.conference.id}`,
        `["${block2.id}"]`,
      );

      expect(scope.queryParameters.block).toEqual([block2.id]);
    });
  });

  describe('toggleBuiltInColumn', () => {
    it('toggles the column visibility', () => {
      const setItem = spyOn($window.localStorage, 'setItem');
      scope.toggleBuiltInColumn('Email');

      expect(scope.builtInColumnsVisible.Email).toBe(false);
      expect(setItem).toHaveBeenCalledWith(
        `builtInColumnsVisibleStorage`,
        '{"Email":false,"Group":true,"GroupId":false,"Started":true,"Completed":true}',
      );

      scope.toggleBuiltInColumn('Email');

      expect(scope.builtInColumnsVisible.Email).toBe(true);
      expect(setItem).toHaveBeenCalledWith(
        `builtInColumnsVisibleStorage`,
        '{"Email":true,"Group":true,"GroupId":false,"Started":true,"Completed":true}',
      );
    });
  });

  describe('resetStrFilter', () => {
    it('clears the filter', () => {
      scope.strFilter = 'Filter';
      scope.resetStrFilter();

      expect(scope.strFilter).toBe('');
    });
  });

  describe('isRegistrantReported', () => {
    it('returns true if the registrant is reported', () => {
      scope.registrations = [{ ...testData.registration, reported: true }];

      expect(
        scope.isRegistrantReported(testData.registration.registrants[0]),
      ).toBe(true);
    });

    it('returns false if the registrant is not reported', () => {
      scope.registrations = [{ ...testData.registration, reported: false }];

      expect(
        scope.isRegistrantReported(testData.registration.registrants[0]),
      ).toBe(false);
    });
  });

  describe('answerSort', () => {
    it('returns 0 if no orderBy is defined', () => {
      scope.queryParameters.orderBy = undefined;

      expect(scope.answerSort(testData.registration.registrants[0])).toBe(0);
    });

    it('returns "" if the answer does not exist', () => {
      scope.queryParameters.orderBy = 'last_name';

      expect(scope.answerSort(testData.registration.registrants[0])).toBe('');
    });

    it('returns the value of simple answers', () => {
      const answer = testData.registration.registrants[0].answers[0];
      scope.queryParameters.orderBy = answer.blockId;

      expect(scope.answerSort(testData.registration.registrants[0])).toBe(
        answer.value,
      );
    });

    it('returns the values of complex answers', () => {
      const answer = testData.registration.registrants[0].answers[6];
      scope.queryParameters.orderBy = answer.blockId;

      expect(scope.answerSort(testData.registration.registrants[0])).toBe(
        'Test,Person',
      );
    });

    it('returns the keys of checkbox answers', () => {
      const answer = testData.registration.registrants[0].answers[4];
      scope.queryParameters.orderBy = answer.blockId;

      expect(scope.answerSort(testData.registration.registrants[0])).toBe(
        '651',
      );
    });
  });

  describe('setOrder', () => {
    it('sorts by the specified field', () => {
      scope.queryParameters.orderBy = 'last_name';
      scope.setOrder('first_name');

      expect(scope.queryParameters.orderBy).toBe('first_name');
      expect(scope.queryParameters.order).toBe('ASC');
    });

    it('reverse sorts when the order field is toggled again', () => {
      scope.queryParameters.orderBy = 'last_name';
      scope.setOrder('first_name');
      scope.setOrder('first_name');

      expect(scope.queryParameters.orderBy).toBe('first_name');
      expect(scope.queryParameters.order).toBe('DESC');
    });
  });

  it('editRegistrant should open modal window', function () {
    var registrant = testData.registration.registrants[0];

    $httpBackend
      .whenGET(/registrations\/.*$/)
      .respond(201, [testData.registration]);

    scope.editRegistrant(registrant);
    $httpBackend.flush();

    expect(openModal).toHaveBeenCalled(); /* eslint-disable-line */

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it("getGroupName should return Registration's groupName", function () {
    var id = testData.registration.id;

    expect(scope.getGroupName(id)).toBe('Test Person');
  });

  it('showGroup does not open if user has no permission', function () {
    $controller('eventRegistrationsCtrl', {
      $scope: scope,
      conference: testData.conference,
      $uibModal: $uibModal,
      permissions: { permissionInt: 2 },
    });

    scope.showGroup();

    expect(openModal.calls.mostRecent().args[0].templateUrl).not.toBe(
      'views/modals/showGroup.html',
    );
  });

  it('showGroup should open modal window', function () {
    scope.showGroup();

    expect(openModal).toHaveBeenCalled(); /* eslint-disable-line */
  });

  it('registerUser should open modal window', function () {
    scope.registerUser();

    expect(openModal).toHaveBeenCalled(); /* eslint-disable-line */
  });

  it('isGroupRegistrant should return true for primary user group registrations', () => {
    let registrant = {
      registrantTypeId: '47de2c40-19dc-45b3-9663-5c005bd6464b',
    };

    let result = scope.isGroupRegistrant(registrant);

    expect(result).toBeTruthy();
  });

  it('isGroupRegistrant should return true for dependent user group registrations', () => {
    let registrant = {
      registrantTypeId: '67c70823-35bd-9262-416f-150e35a03514',
    };

    let result = scope.isGroupRegistrant(registrant);

    expect(result).toBeTruthy();
  });

  it('isGroupRegistrant should return false for not dependent and not primary user group registrations', () => {
    let registrant = {
      registrantTypeId: '2b7ca963-0503-47c4-b9cf-6348d59542c3',
    };

    let result = scope.isGroupRegistrant(registrant);

    expect(result).toBeFalsy();
  });

  it('refreshRegistrations should assign reported attribute to registrants', () => {
    RegistrationCache.getAllForConference.and.callThrough();
    $httpBackend
      .whenGET(/^conferences\/.*\/registrations.*/)
      .respond(201, [testData.registration]);

    scope.refreshRegistrations();

    $httpBackend.flush();

    for (const registrant of scope.registrants) {
      expect(registrant.reported).toBe(true);
    }
  });

  describe('expandRegistration', () => {
    beforeEach(() => {
      $httpBackend.expectGET(/^registrants\/.+$/).respond(200, {
        ...testData.registration.registrants[0],
        firstName: 'Updated',
      });
    });

    it('opens unexpanded registrations', () => {
      const registrantId = testData.registration.registrants[0].id;

      scope.expandRegistration(registrantId);

      expect(scope.expandedStatus(registrantId)).toBe('loading');

      $httpBackend.flush();

      expect(scope.expandedStatus(registrantId)).toBe('open');
      expect(scope.registrants[0].firstName).toBe('Updated');
      expect(scope.registrations[0].registrants[0].firstName).toBe('Updated');
    });

    it('closes expanded registrations', () => {
      const registrantId = testData.registration.registrants[0].id;
      scope.expandRegistration(registrantId);
      $httpBackend.flush();

      expect(scope.expandedStatus(registrantId)).toBe('open');

      scope.expandRegistration(registrantId);

      expect(scope.expandedStatus(registrantId)).toBeUndefined();
    });
  });

  describe('editRegistrant', () => {
    it('edits registrants', () => {
      $httpBackend.expectGET(/^registrations\/.+$/).respond(200, {});

      scope.editRegistrant(testData.registration.registrants[0]);

      const newRegistration = {
        ...testData.registration,
        registrants: [
          { ...testData.registration.registrants[0], firstName: 'Updated' },
          testData.registration.registrants[1],
        ],
      };

      $httpBackend.flush();
      fakeModal.close(newRegistration);

      expect(scope.registrants[0].firstName).toBe('Updated');
      expect(scope.registrations[0]).toBe(newRegistration);
    });
  });

  describe('withdrawRegistrant', () => {
    it('withdraws a registrant', () => {
      spyOn(scope, 'showModal').and.returnValue($q.resolve());

      $httpBackend
        .expectPUT(/^registrants\/.+$/, (raw) => {
          const data = JSON.parse(raw);
          return data.withdrawn && angular.isString(data.withdrawnTimestamp);
        })
        .respond(204, '');

      const registrant = {
        ...testData.registration.registrants[0],
        withdrawn: false,
        withdrawnTimestamp: null,
      };

      scope.withdrawRegistrant(registrant, true);
      scope.$digest();

      expect(registrant.withdrawn).toBe(true);
      expect(registrant.withdrawnTimestamp).not.toBeNull();
      expect(scope.loadingMsg).toBe(`Withdrawing ${registrant.firstName}`);

      $httpBackend.flush();

      expect(scope.loadingMsg).toBe('');
    });

    it('reinstates a registrant', () => {
      spyOn(scope, 'showModal').and.returnValue($q.resolve());

      $httpBackend
        .expectPUT(/^registrants\/.+$/, (data) => !JSON.parse(data).withdrawn)
        .respond(204, '');

      const registrant = {
        ...testData.registration.registrants[0],
        withdrawn: true,
        withdrawnTimestamp: '2023-01-01T00:00:00.000Z',
      };

      scope.withdrawRegistrant(registrant, false);
      scope.$digest();

      expect(registrant.withdrawn).toBe(false);
      expect(scope.loadingMsg).toBe(`Reinstating ${registrant.firstName}`);

      $httpBackend.flush();

      expect(scope.loadingMsg).toBe('');
    });

    it('reverts changes to withdrawn on failure', () => {
      spyOn(scope, 'showModal').and.returnValue($q.resolve());

      $httpBackend
        .expectPUT(/^registrants\/.+$/, (data) => JSON.parse(data).withdrawn)
        .respond(500, '');

      const registrant = {
        ...testData.registration.registrants[0],
        withdrawn: false,
        withdrawnTimestamp: null,
      };
      scope.withdrawRegistrant(registrant, true);
      scope.$digest();

      $httpBackend.flush();

      expect(registrant.withdrawn).toBe(false);
    });
  });

  describe('checkInRegistrant', () => {
    it('checks in registrant', () => {
      $httpBackend
        .expectPUT(/^registrants\/.+$/, (data) =>
          angular.isString(JSON.parse(data).checkedInTimestamp),
        )
        .respond(204, '');

      const registrant = {
        ...testData.registration.registrants[0],
        checkedInTimestamp: null,
      };
      scope.checkInRegistrant(registrant, true);

      expect(registrant.checkedInTimestamp).not.toBeNull();
      expect(scope.loadingMsg).toBe(`Checking in ${registrant.firstName}`);

      $httpBackend.flush();

      expect(scope.loadingMsg).toBe('');
    });

    it('removes check in from registrant', () => {
      $httpBackend
        .expectPUT(
          /^registrants\/.+$/,
          (data) => JSON.parse(data).checkedInTimestamp === null,
        )
        .respond(204, '');

      const registrant = {
        ...testData.registration.registrants[0],
        checkedInTimestamp: '2023-01-01T00:00:00.000Z',
      };
      scope.checkInRegistrant(registrant, false);

      expect(registrant.checkedInTimestamp).toBeNull();
      expect(scope.loadingMsg).toBe(
        `Removing check-in for ${registrant.firstName}`,
      );

      $httpBackend.flush();

      expect(scope.loadingMsg).toBe('');
    });

    it('reverts changes to checkedInTimestamp on failure', () => {
      $httpBackend
        .expectPUT(/^registrants\/.+$/, (data) =>
          angular.isString(JSON.parse(data).checkedInTimestamp),
        )
        .respond(500, '');

      const registrant = {
        ...testData.registration.registrants[0],
        checkedInTimestamp: null,
      };
      scope.checkInRegistrant(registrant, true);

      expect(registrant.checkedInTimestamp).not.toBeNull();

      $httpBackend.flush();

      expect(registrant.checkedInTimestamp).toBeNull();
    });
  });

  describe('deleteRegistrant', () => {
    it('deletes a registrant in a group', () => {
      spyOn(scope, 'showModal').and.returnValue($q.resolve());
      $httpBackend
        .expectGET(/^registrations\/.+$/)
        .respond(200, testData.registration);
      $httpBackend.expectDELETE(/^registrants\/.+$/).respond(204, '');

      const registrant = scope.registrants[0];
      scope.deleteRegistrant(registrant);
      scope.$digest();
      $httpBackend.flush();
      $httpBackend.flush();

      expect(scope.registrants.length).toBe(1);
      expect(scope.registrations[0].registrants.map((r) => r.id)).not.toContain(
        registrant.id,
      );

      expect(scope.registrations[0].groupRegistrants.length).toBe(0);
    });

    it('deletes the entire registration if there is one registrant', () => {
      spyOn(scope, 'showModal').and.returnValue($q.resolve());
      RegistrationCache.getAllForConference.and.returnValue(
        $q.resolve({
          registrations: [testData.singleRegistration],
        }),
      );
      scope.refreshRegistrations();
      scope.$digest();

      $httpBackend
        .expectGET(/^registrations\/.+$/)
        .respond(200, testData.singleRegistration);
      $httpBackend.expectDELETE(/^registrations\/.+$/).respond(204, '');

      scope.deleteRegistrant(scope.registrants[0]);
      scope.$digest();
      $httpBackend.flush();
      $httpBackend.flush();

      expect(scope.registrants.length).toBe(0);
    });

    it('deletes couple-spouse pairs together', () => {
      spyOn(scope, 'showModal').and.returnValue($q.resolve());

      RegistrationCache.getAllForConference.and.returnValue(
        $q.resolve({
          registrations: [testData.coupleRegistration],
        }),
      );
      scope.refreshRegistrations();
      scope.$digest();

      $httpBackend
        .expectGET(/^registrations\/.+$/)
        .respond(200, testData.coupleRegistration);

      $httpBackend
        .expectDELETE('registrations/709738ff-da79-4eed-aacd-d9f005fc7f4e')
        .respond(204, '');

      const registrant = scope.registrants[0];
      scope.deleteRegistrant(registrant);

      $httpBackend.flush();
      $httpBackend.flush();

      expect(scope.registrants.length).toBe(0);
    });
  });
});
