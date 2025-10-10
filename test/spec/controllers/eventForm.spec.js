import 'angular-mocks';

describe('Controller: eventForm', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let $controller,
    $httpBackend,
    $location,
    $q,
    $timeout,
    ConfCache,
    GrowlService,
    modalMessage,
    testData,
    initController,
    scope;
  beforeEach(
    angular.mock.inject(function (
      $rootScope,
      _$controller_,
      _$httpBackend_,
      _$location_,
      _$q_,
      _$timeout_,
      _ConfCache_,
      _GrowlService_,
      _modalMessage_,
      _testData_,
    ) {
      $controller = _$controller_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $q = _$q_;
      $timeout = _$timeout_;
      ConfCache = _ConfCache_;
      GrowlService = _GrowlService_;
      modalMessage = _modalMessage_;
      testData = _testData_;

      initController = (injected) => {
        scope = $rootScope.$new();

        $controller('eventFormCtrl', {
          $scope: scope,
          conference: { ...testData.conference },
          blockIntegrationService: {
            getIntegrationTypes: () =>
              $q.resolve(testData.blockIntegrationsTypes),
            clearCache: () => {},
          },
          ...injected,
        });
      };

      initController();
    }),
  );

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('saveForm', () => {
    beforeEach(() => {
      // Trigger the conference $watch so that oldObject is set on future $watch triggers
      scope.$digest();
    });

    it('updates the conference cache and displays a notification', () => {
      spyOn(ConfCache, 'update');
      $httpBackend.expectPUT(/^conferences\/.+$/).respond(204, '');

      scope.$apply(() => {
        scope.conference.name = 'Updated';
      });
      $httpBackend.flush();

      expect(ConfCache.update).toHaveBeenCalledWith(
        scope.conference.id,
        scope.conference,
      );

      expect(scope.notify.class).toBe('alert-success');

      $timeout.flush();

      expect(scope.notify.class).toBeUndefined();
    });

    it('debounces saves', () => {
      spyOn(ConfCache, 'update');
      $httpBackend.expectPUT(/^conferences\/.+$/).respond(204, '');

      // Saves the form
      scope.$apply(() => {
        scope.conference.name = 'Updated1';
      });
      // Starts a timer to save the form later
      scope.$apply(() => {
        scope.conference.name = 'Updated2';
      });
      // Updates the timer to save the form later
      scope.$apply(() => {
        scope.conference.name = 'Updated3';
      });

      $httpBackend.flush();

      expect(ConfCache.update).toHaveBeenCalledTimes(1);

      $timeout.flush();
      $httpBackend.flush();

      expect(ConfCache.update).toHaveBeenCalledTimes(2);
    });

    it('displays errors', () => {
      $httpBackend.expectPUT(/^conferences\/.+$/).respond(500, '');

      scope.$apply(() => {
        scope.conference.name = 'Updated';
      });
      $httpBackend.flush();

      expect(scope.notify.class).toBe('alert-danger');
    });
  });

  describe('previewForm', () => {
    it('navigates to the preview page', () => {
      spyOn($location, 'path');
      scope.previewForm();

      expect($location.path).toHaveBeenCalledWith(
        `/preview/${testData.conference.id}/page/`,
      );
    });
  });

  describe('deletePage', () => {
    beforeEach(() => {
      spyOn(modalMessage, 'error');
      scope.conference.registrationPages.push(
        testData.waiverPage,
        testData.rulesPage,
      );
    });

    it('refuses to delete pages with an email profile question', () => {
      scope.deletePage(testData.conference.registrationPages[0].id);

      expect(modalMessage.error).toHaveBeenCalledTimes(1);
      expect(modalMessage.error.calls.argsFor(0)[0].message).toBe(
        'This page contains required profile questions and cannot be deleted.',
      );
    });

    it('refuses to delete pages with a name profile question', () => {
      scope.deletePage(testData.conference.registrationPages[1].id);

      expect(modalMessage.error).toHaveBeenCalledTimes(1);
      expect(modalMessage.error.calls.argsFor(0)[0].message).toBe(
        'This page contains required profile questions and cannot be deleted.',
      );
    });

    it('refuses to delete pages with a waiver profile question', () => {
      scope.deletePage(testData.waiverPage.id);

      expect(modalMessage.error).toHaveBeenCalledTimes(1);
      expect(modalMessage.error.calls.argsFor(0)[0].message).toBe(
        'This page contains required liability questions and cannot be deleted.',
      );
    });

    it('deletes pages', () => {
      spyOn(GrowlService, 'growl');
      spyOn(modalMessage, 'confirm').and.returnValue($q.resolve());
      const page = scope.conference.registrationPages[1];
      page.blocks = page.blocks.filter((block) => block.profileType === null);

      scope.deletePage(page.id, true);
      scope.$digest();

      expect(modalMessage.confirm).toHaveBeenCalledTimes(1);
      const confirmationMessage =
        modalMessage.confirm.calls.argsFor(0)[0].question;

      expect(confirmationMessage).toContain(
        `Are you sure you want to delete <strong>${page.title}</strong>?`,
      );

      expect(confirmationMessage).toContain(
        'The following rules will also be deleted:',
      );

      expect(confirmationMessage).toContain(
        '<strong>Multiple Choice Question</strong> = <strong>12</strong> on <strong>Question</strong>',
      );

      expect(GrowlService.growl).toHaveBeenCalledTimes(1);
      expect(GrowlService.growl.calls.argsFor(0)[3]).toBe(
        `Page "${page.title}" has been deleted.`,
      );
    });
  });

  describe('copyBlock', () => {
    it('copies an existing block', () => {
      const existingBlock = scope.conference.registrationPages[1].blocks[3];
      scope.copyBlock(existingBlock.id);
      const newBlock = scope.conference.registrationPages[1].blocks[4];

      expect(newBlock.id).not.toBe(existingBlock.id);
      expect(newBlock.position).toBe(4);
      expect(newBlock.title).toBe(`${existingBlock.title} (copy)`);
      expect(newBlock.rules[0].id).not.toBe(existingBlock.rules[0].id);
      expect(newBlock.rules[0].blockId).toBe(newBlock.id);
    });
  });

  describe('insertBlock', () => {
    it('adds a new block without a default profile', () => {
      const page = scope.conference.registrationPages[0];
      const previousFirstBlock = page.blocks[0];
      scope.insertBlock(
        'nameQuestion',
        page.id,
        0,
        'Name',
        undefined,
        undefined,
      );
      const newBlock = page.blocks[0];

      expect(newBlock.pageId).toBe(page.id);
      expect(newBlock.title).toBe('Name');
      expect(page.blocks[1]).toBe(previousFirstBlock);
    });

    it('adds a new block with an unused default profile', () => {
      const page = scope.conference.registrationPages[0];
      scope.insertBlock(
        'phoneQuestion',
        page.id,
        0,
        'Telephone',
        'PHONE',
        undefined,
      );

      expect(page.blocks[0].profileType).toBe('PHONE');
    });

    it('adds a new block with a used default profile', () => {
      const page = scope.conference.registrationPages[0];
      scope.insertBlock(
        'addressQuestion',
        page.id,
        0,
        'Address',
        'ADDRESS',
        undefined,
      );

      expect(page.blocks[0].profileType).toBe(null);
    });
  });

  describe('deleteBlock', () => {
    var block;
    beforeEach(() => {
      block = testData.conference.registrationPages[1].blocks[4];
    });

    it('deletes a block', () => {
      spyOn(GrowlService, 'growl');

      scope.deleteBlock(block.id, true);

      expect(GrowlService.growl).toHaveBeenCalledTimes(1);
      expect(GrowlService.growl.calls.argsFor(0)[3]).toBe(
        `"${block.title}" has been deleted.`,
      );
    });

    it('refuses to delete a block with dependent rules', () => {
      spyOn(modalMessage, 'error');
      scope.conference.registrationPages.push(testData.rulesPage);

      scope.deleteBlock(block.id, true);

      expect(modalMessage.error).toHaveBeenCalledTimes(1);
      const errorMessage = modalMessage.error.calls.argsFor(0)[0].message;

      expect(errorMessage).toContain('<li>Question</li>');
    });
  });

  describe('addNewPage', () => {
    it('adds a new page', () => {
      expect(scope.conference.registrationPages.length).toBe(3);

      scope.addNewPage();
      const newPage = scope.conference.registrationPages[3];

      expect(scope.conference.registrationPages.length).toBe(4);
      expect(newPage.title).toBe('Page 4');
      expect($location.hash()).toBe('page4');
    });
  });

  describe('togglePage', () => {
    it('toggles page visibility', () => {
      const pageId = scope.conference.registrationPages[0].id;

      scope.togglePage(pageId);

      expect(scope.isPageHidden(pageId)).toBe(true);

      scope.togglePage(pageId);

      expect(scope.isPageHidden(pageId)).toBe(false);
    });
  });

  describe('getBlockIntegrationData', () => {
    it('returns the correct integration data for a block', () => {
      const integrationData = scope.getBlockIntegrationData();

      const pageOneBlocks = scope.conference.registrationPages[0].blocks;
      const pageTwoBlocks = scope.conference.registrationPages[1].blocks;
      const pageThreeBlocks = scope.conference.registrationPages[2].blocks;

      expect(integrationData).toEqual([
        {
          blockId: pageOneBlocks[0].id,
          title: pageOneBlocks[0].title,
          integrationTypeId: testData.blockIntegrationsTypes[0].id,
        },
        {
          blockId: pageTwoBlocks[0].id,
          title: pageTwoBlocks[0].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[1].id,
          title: pageTwoBlocks[1].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[2].id,
          title: pageTwoBlocks[2].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[3].id,
          title: pageTwoBlocks[3].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[4].id,
          title: pageTwoBlocks[4].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[5].id,
          title: pageTwoBlocks[5].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[6].id,
          title: pageTwoBlocks[6].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[7].id,
          title: pageTwoBlocks[7].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[8].id,
          title: pageTwoBlocks[8].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[9].id,
          title: pageTwoBlocks[9].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[10].id,
          title: pageTwoBlocks[10].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[11].id,
          title: pageTwoBlocks[11].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[12].id,
          title: pageTwoBlocks[12].title,
          integrationTypeId: null,
        },
        {
          blockId: pageTwoBlocks[13].id,
          title: pageTwoBlocks[13].title,
          integrationTypeId: null,
        },
        {
          blockId: pageThreeBlocks[0].id,
          title: pageThreeBlocks[0].title,
          integrationTypeId: null,
        },
        {
          blockId: pageThreeBlocks[1].id,
          title: pageThreeBlocks[1].title,
          integrationTypeId: null,
        },
        {
          blockId: pageThreeBlocks[2].id,
          title: pageThreeBlocks[2].title,
          integrationTypeId: testData.blockIntegrationsTypes[2].id,
        },
      ]);
    });
  });
});
