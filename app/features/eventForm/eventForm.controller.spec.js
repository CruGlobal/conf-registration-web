import 'angular-mocks';
import { Rollbar } from 'scripts/errorNotify.js';

describe('Controller: eventForm', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let $controller,
    $httpBackend,
    $location,
    $q,
    $rootScope,
    $timeout,
    ConfCache,
    GrowlService,
    modalMessage,
    testData,
    initController,
    scope;
  beforeEach(
    angular.mock.inject(function (
      _$rootScope_,
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
      $rootScope = _$rootScope_;
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
          blockTagTypeService: {
            loadBlockTagTypes: () => $q.resolve(testData.blockTagTypes),
            blockTagTypes: () => testData.blockTagTypes,
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
    const NAME_BLOCK_ID = '122a15bf-0608-4813-834a-0d31a8c44c64';
    let payloads;

    const payloadBlockIds = (payload) =>
      _.map(_.flatMap(payload.registrationPages, 'blocks'), 'id');

    // Captures the body of exactly one PUT. The mock backend has a catch-all
    // whenPUT for conferences, so a stray second PUT never throws on its own.
    // Pair this with $httpBackend.flush(1) and verifyNoOutstandingRequest().
    const expectOnePut = (status = 204) => {
      $httpBackend
        .expectPUT(/^conferences\/.+$/, (body) => {
          payloads.push(JSON.parse(body));
          return true;
        })
        .respond(status, '');
    };

    beforeEach(() => {
      // Trigger the conference $watch so that oldObject is set on future $watch triggers
      scope.$digest();
      payloads = [];
    });

    it('updates the conference cache and displays a notification', () => {
      spyOn(ConfCache, 'update');
      expectOnePut();

      scope.$apply(() => {
        scope.conference.name = 'Updated';
      });
      // The save is debounced, so nothing has been sent yet
      $httpBackend.verifyNoOutstandingRequest();

      $timeout.flush();
      $httpBackend.flush(1);

      expect(payloads.length).toBe(1);
      expect(payloads[0].name).toBe('Updated');
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
      expectOnePut();

      scope.$apply(() => {
        scope.conference.name = 'Updated1';
      });
      scope.$apply(() => {
        scope.conference.name = 'Updated2';
      });
      scope.$apply(() => {
        scope.conference.name = 'Updated3';
      });
      $httpBackend.verifyNoOutstandingRequest();

      $timeout.flush();
      $httpBackend.flush(1);

      expect(payloads.length).toBe(1);
      expect(payloads[0].name).toBe('Updated3');
      expect(ConfCache.update).toHaveBeenCalledTimes(1);

      $timeout.flush();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('displays errors', () => {
      expectOnePut(500);

      scope.$apply(() => {
        scope.conference.name = 'Updated';
      });
      $timeout.flush();
      $httpBackend.flush(1);

      expect(scope.notify.class).toBe('alert-danger');
    });

    it('sends one PUT with the block intact when a block is moved by remove-then-insert across two digests', () => {
      expectOnePut();
      const sourcePage = scope.conference.registrationPages[1];
      const targetPage = scope.conference.registrationPages[0];
      const totalBlocks = payloadBlockIds(scope.conference).length;
      const nameBlock = sourcePage.blocks[1];

      expect(nameBlock.id).toBe(NAME_BLOCK_ID);

      // angular-ui-tree removes the node in one $timeout and inserts it in a
      // second $timeout, so a full digest runs between the two splices.
      scope.$apply(() => {
        sourcePage.blocks.splice(1, 1);
      });
      scope.$apply(() => {
        targetPage.blocks.splice(1, 0, nameBlock);
      });
      $httpBackend.verifyNoOutstandingRequest();

      $timeout.flush();
      $httpBackend.flush(1);

      expect(payloads.length).toBe(1);
      const ids = payloadBlockIds(payloads[0]);

      expect(ids.length).toBe(totalBlocks);
      expect(ids).toContain(NAME_BLOCK_ID);
      expect(payloads[0].registrationPages[0].blocks[1].id).toBe(NAME_BLOCK_ID);

      $timeout.flush();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('sends one PUT with every page and block when a page is moved across two digests', () => {
      expectOnePut();
      const pages = scope.conference.registrationPages;
      const movedPage = pages[1];
      const movedBlockIds = _.map(movedPage.blocks, 'id');

      expect(pages.length).toBe(3);
      expect(movedBlockIds.length).toBe(14);

      scope.$apply(() => {
        pages.splice(1, 1);
      });
      scope.$apply(() => {
        pages.splice(2, 0, movedPage);
      });
      $httpBackend.verifyNoOutstandingRequest();

      $timeout.flush();
      $httpBackend.flush(1);

      expect(payloads.length).toBe(1);
      expect(payloads[0].registrationPages.length).toBe(3);
      expect(payloads[0].registrationPages[2].id).toBe(movedPage.id);
      const ids = payloadBlockIds(payloads[0]);

      expect(_.difference(movedBlockIds, ids)).toEqual([]);

      $timeout.flush();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('sends a pending save immediately on $destroy and does not send it twice', () => {
      expectOnePut();

      scope.$apply(() => {
        scope.conference.name = 'Updated';
      });
      $httpBackend.verifyNoOutstandingRequest();

      scope.$destroy();
      $httpBackend.flush(1);

      expect(payloads.length).toBe(1);
      expect(payloads[0].name).toBe('Updated');

      // The cancelled debounce timer must not send a second PUT
      $timeout.flush();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('sends a pending save immediately on $locationChangeStart', () => {
      expectOnePut();

      scope.$apply(() => {
        scope.conference.name = 'Updated';
      });
      $httpBackend.verifyNoOutstandingRequest();

      $rootScope.$broadcast('$locationChangeStart');
      $httpBackend.flush(1);

      expect(payloads.length).toBe(1);
      expect(payloads[0].name).toBe('Updated');

      $timeout.flush();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('sends nothing on $destroy when no save is pending', () => {
      scope.$destroy();

      $httpBackend.verifyNoOutstandingRequest();

      expect(payloads.length).toBe(0);
    });

    it('sends a second PUT with the latest data when an edit happens while a PUT is in flight', () => {
      expectOnePut();

      scope.$apply(() => {
        scope.conference.name = 'Updated1';
      });
      $timeout.flush();
      // First PUT is now in flight
      scope.$apply(() => {
        scope.conference.name = 'Updated2';
      });
      $httpBackend.flush(1);

      expectOnePut();
      $timeout.flush();
      $httpBackend.flush(1);

      expect(payloads.length).toBe(2);
      expect(payloads[0].name).toBe('Updated1');
      expect(payloads[1].name).toBe('Updated2');

      $timeout.flush();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('still sends the queued second PUT when $destroy happens while a PUT is in flight', () => {
      expectOnePut();

      scope.$apply(() => {
        scope.conference.name = 'Updated1';
      });
      $timeout.flush();
      // First PUT is now in flight
      scope.$apply(() => {
        scope.conference.name = 'Updated2';
      });
      scope.$destroy();
      $httpBackend.flush(1);

      expectOnePut();
      $timeout.flush();
      $httpBackend.flush(1);

      expect(payloads.length).toBe(2);
      expect(payloads[1].name).toBe('Updated2');

      $timeout.flush();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('missing block guard', () => {
      const REFUSED_MESSAGE =
        'eventForm: refused to save conference missing blocks';

      beforeEach(() => {
        spyOn(Rollbar, 'error');
      });

      it('refuses to send a payload that silently drops a block', () => {
        scope.$apply(() => {
          scope.conference.registrationPages[1].blocks.splice(1, 1);
        });
        $timeout.flush();

        $httpBackend.verifyNoOutstandingRequest();

        expect(payloads.length).toBe(0);
        expect(scope.notify.class).toBe('alert-danger');
        expect(scope.notify.message.toString()).toContain('Not saved.');
        expect(Rollbar.error).toHaveBeenCalledTimes(1);
        expect(Rollbar.error).toHaveBeenCalledWith(REFUSED_MESSAGE, {
          conferenceId: scope.conference.id,
          missingBlockIds: [NAME_BLOCK_ID],
        });
      });

      it('allows a save after deleteBlock removes a block', () => {
        expectOnePut();
        const block = scope.conference.registrationPages[1].blocks[4];

        scope.$apply(() => {
          scope.deleteBlock(block.id);
        });
        $timeout.flush();
        $httpBackend.flush(1);

        expect(payloads.length).toBe(1);
        expect(payloadBlockIds(payloads[0])).not.toContain(block.id);
        expect(scope.notify.class).toBe('alert-success');
        expect(Rollbar.error).not.toHaveBeenCalled();

        $timeout.flush();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('allows a save after deletePage removes a page and its blocks', () => {
        expectOnePut();
        spyOn(modalMessage, 'confirm').and.returnValue($q.resolve());
        const page = scope.conference.registrationPages[2];
        const pageBlockIds = _.map(page.blocks, 'id');

        expect(pageBlockIds.length).toBe(3);

        scope.deletePage(page.id);
        scope.$digest();
        $timeout.flush();
        $httpBackend.flush(1);

        expect(payloads.length).toBe(1);
        expect(payloads[0].registrationPages.length).toBe(2);
        const ids = payloadBlockIds(payloads[0]);

        expect(_.intersection(pageBlockIds, ids)).toEqual([]);
        expect(scope.notify.class).toBe('alert-success');
        expect(Rollbar.error).not.toHaveBeenCalled();

        $timeout.flush();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('protects a block that was added and saved', () => {
        expectOnePut();
        const page = scope.conference.registrationPages[0];

        scope.$apply(() => {
          scope.insertBlock(
            'textQuestion',
            page.id,
            0,
            'New question',
            undefined,
            undefined,
          );
        });
        const newBlockId = page.blocks[0].id;
        $timeout.flush();
        $httpBackend.flush(1);

        expect(payloadBlockIds(payloads[0])).toContain(newBlockId);

        scope.$apply(() => {
          page.blocks.splice(0, 1);
        });
        $timeout.flush();

        $httpBackend.verifyNoOutstandingRequest();

        expect(payloads.length).toBe(1);
        expect(scope.notify.class).toBe('alert-danger');
        expect(Rollbar.error).toHaveBeenCalledWith(REFUSED_MESSAGE, {
          conferenceId: scope.conference.id,
          missingBlockIds: [newBlockId],
        });
      });

      it('protects a block again after a delete is undone', () => {
        expectOnePut();
        const block = scope.conference.registrationPages[1].blocks[4];
        const beforeDelete = angular.copy(scope.conference);

        scope.$apply(() => {
          scope.deleteBlock(block.id);
        });
        // Growl Undo swaps the conference for the pre-delete copy inside the
        // debounce window, so the block never left the saved form
        scope.$apply(() => {
          scope.conference = beforeDelete;
        });
        $timeout.flush();
        $httpBackend.flush(1);

        expect(payloadBlockIds(payloads[0])).toContain(block.id);

        scope.$apply(() => {
          _.remove(scope.conference.registrationPages[1].blocks, {
            id: block.id,
          });
        });
        $timeout.flush();

        $httpBackend.verifyNoOutstandingRequest();

        expect(payloads.length).toBe(1);
        expect(scope.notify.class).toBe('alert-danger');
        expect(Rollbar.error).toHaveBeenCalledWith(REFUSED_MESSAGE, {
          conferenceId: scope.conference.id,
          missingBlockIds: [block.id],
        });
      });

      it('allows a deleteBlock that happens while a PUT is in flight', () => {
        expectOnePut();
        const block = scope.conference.registrationPages[1].blocks[4];

        scope.$apply(() => {
          scope.conference.name = 'Updated';
        });
        $timeout.flush();
        // First PUT (which still contains the block) is now in flight
        scope.$apply(() => {
          scope.deleteBlock(block.id);
        });
        $httpBackend.flush(1);

        expect(payloadBlockIds(payloads[0])).toContain(block.id);

        expectOnePut();
        $timeout.flush();
        $httpBackend.flush(1);

        expect(payloads.length).toBe(2);
        expect(payloadBlockIds(payloads[1])).not.toContain(block.id);
        expect(scope.notify.class).toBe('alert-success');
        expect(Rollbar.error).not.toHaveBeenCalled();

        $timeout.flush();
        $httpBackend.verifyNoOutstandingRequest();
      });
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

    it('adds the first campus question with the CAMPUS_V2 profile', () => {
      const page = scope.conference.registrationPages[0];
      scope.insertBlock(
        'campusV2Question',
        page.id,
        0,
        'Campus',
        'CAMPUS_V2',
        undefined,
      );

      expect(page.blocks[0].type).toBe('campusV2Question');
      expect(page.blocks[0].profileType).toBe('CAMPUS_V2');
    });

    it('rejects a second campus question and warns instead of adding it', () => {
      const page = scope.conference.registrationPages[0];
      page.blocks.push({
        id: 'existing-campus',
        type: 'campusV2Question',
        profileType: 'CAMPUS_V2',
      });
      const blockCount = page.blocks.length;

      scope.insertBlock(
        'campusV2Question',
        page.id,
        0,
        'Campus',
        'CAMPUS_V2',
        undefined,
      );

      expect(page.blocks.length).toBe(blockCount);
      expect(scope.notify.class).toBe('alert-danger');
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

  describe('buildBlockTagTypeMappings', () => {
    it('builds the blockTagTypeMapping correctly', () => {
      scope.buildBlockTagTypeMappings();

      const pageOneBlocks = scope.conference.registrationPages[0].blocks;
      const pageTwoBlocks = scope.conference.registrationPages[1].blocks;
      const pageThreeBlocks = scope.conference.registrationPages[2].blocks;
      const mockRegistrantTypes = [
        { id: '67c70823-35bd-9262-416f-150e35a03514', name: 'Child' },
        { id: '47de2c40-19dc-45b3-9663-5c005bd6464b', name: 'Staff' },
        { id: '2b7ca963-0503-47c4-b9cf-6348d59542c3', name: 'Student' },
        { id: 'b2c3d4e5-f6a7-8901-bcde-234567890abc', name: 'Couple' },
        { id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef', name: 'Spouse' },
        { id: 'f3c2e1d4-7b8a-4c6f-9e2b-9876543210fe', name: 'Spouse' },
      ];

      expect(scope.blockTagTypeMapping).toEqual([
        {
          blockId: pageOneBlocks[0].id,
          title: pageOneBlocks[0].title,
          blockTagTypeId: testData.blockTagTypes[0].id,
          hiddenFromRegistrantTypes: [
            { id: '47de2c40-19dc-45b3-9663-5c005bd6464b', name: 'Staff' },
            { id: 'b2c3d4e5-f6a7-8901-bcde-234567890abc', name: 'Couple' },
          ],
          includedInRegistrantTypes: [
            { id: '67c70823-35bd-9262-416f-150e35a03514', name: 'Child' },
            { id: '2b7ca963-0503-47c4-b9cf-6348d59542c3', name: 'Student' },
            { id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef', name: 'Spouse' },
            { id: 'f3c2e1d4-7b8a-4c6f-9e2b-9876543210fe', name: 'Spouse' },
          ],
        },
        {
          blockId: pageTwoBlocks[0].id,
          title: pageTwoBlocks[0].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [
            { id: 'f3c2e1d4-7b8a-4c6f-9e2b-9876543210fe', name: 'Spouse' },
          ],
          includedInRegistrantTypes: [
            { id: '67c70823-35bd-9262-416f-150e35a03514', name: 'Child' },
            { id: '47de2c40-19dc-45b3-9663-5c005bd6464b', name: 'Staff' },
            { id: '2b7ca963-0503-47c4-b9cf-6348d59542c3', name: 'Student' },
            { id: 'b2c3d4e5-f6a7-8901-bcde-234567890abc', name: 'Couple' },
            { id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef', name: 'Spouse' },
          ],
        },
        {
          blockId: pageTwoBlocks[1].id,
          title: pageTwoBlocks[1].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[2].id,
          title: pageTwoBlocks[2].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: mockRegistrantTypes,
          includedInRegistrantTypes: [],
        },
        {
          blockId: pageTwoBlocks[3].id,
          title: pageTwoBlocks[3].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[4].id,
          title: pageTwoBlocks[4].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[5].id,
          title: pageTwoBlocks[5].title,
          blockTagTypeId: '7a09d6f3-0c25-4281-aa60-b7702e713b9c',
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[6].id,
          title: pageTwoBlocks[6].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[7].id,
          title: pageTwoBlocks[7].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[8].id,
          title: pageTwoBlocks[8].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[9].id,
          title: pageTwoBlocks[9].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[10].id,
          title: pageTwoBlocks[10].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[11].id,
          title: pageTwoBlocks[11].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[12].id,
          title: pageTwoBlocks[12].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageTwoBlocks[13].id,
          title: pageTwoBlocks[13].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageThreeBlocks[0].id,
          title: pageThreeBlocks[0].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageThreeBlocks[1].id,
          title: pageThreeBlocks[1].title,
          blockTagTypeId: null,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
        {
          blockId: pageThreeBlocks[2].id,
          title: pageThreeBlocks[2].title,
          blockTagTypeId: testData.blockTagTypes[2].id,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: mockRegistrantTypes,
        },
      ]);
    });
  });
});
