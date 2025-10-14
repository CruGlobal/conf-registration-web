import 'angular-mocks';
import { familyLifeMinistryId } from '../../../app/scripts/directives/blockEditor';

describe('Directive: blockEditor', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testData;
  beforeEach(inject(function (
    _$compile_,
    _$rootScope_,
    $templateCache,
    _testData_,
  ) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    testData = _testData_;

    scope = $rootScope.$new();
    $templateCache.put('views/components/blockEditor.html', '');

    scope.conference = testData.conference;
    scope.block = testData.conference.registrationPages[1].blocks[5];

    element = $compile('<div block-editor></div>')(scope);
    scope.$digest();

    const parentScope = $rootScope.$new();
    parentScope.fetchBlockIntegrations = jasmine.createSpy(
      'fetchBlockIntegrations',
    );
    scope.$parent = parentScope;

    scope = element.isolateScope() || element.scope();
  }));

  it('updates forceSelection', function () {
    scope.block.content.forceSelections = { someValue: true };

    scope.onChoiceOptionChange();

    expect(scope.block.content.forceSelections['someValue']).toBeUndefined();
  });

  it('should open modal for Advanced Option', function () {
    scope.conference.currency = {
      code: 'USD',
      name: 'US Dollar',
      shortSymbol: 'US',
    };
    scope.editBlockOptionAdvanced();
  });

  it('set new answer rules operand to OR by default', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '18ccfb09-3006-4981-ab5e-bbbbbbbbbbbb',
    });
    scope.block = block;

    scope.editBlockAddOption('EEE');

    expect(scope.block.content.choices[4].operand).toBe('OR');
  });

  it('should not create an error message if there are not multiple questions with the same Cru Profile type', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '9b83eebd-b064-4edf-92d0-7982a330272b',
    });
    scope.block = block;
    scope.block.profileType = null;

    scope.toggleProfileType(true);

    expect(scope.pType).toBeUndefined();
  });

  it('Duplicate Cru Profile Gender Question: Changes gender to sex in error message', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '9b83eebd-b064-4edf-92d0-7982a330272a',
    });
    scope.block = block;

    scope.toggleProfileType(true);

    expect(scope.pType).toBe('Sex');
  });

  it('returns whether a question type exists or not using eventHasQuestionType()', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '9b83eebd-b064-4edf-92d0-7982a330272a',
    });
    scope.block = block;

    expect(scope.eventHasQuestionType('genderQuestion')).toBe(true);

    expect(scope.eventHasQuestionType('ethnicityQuestion')).toBe(false);
  });

  describe('integrationTypesLoaded', function () {
    it('should set integrationTypes & blockIntegrations upon integrationTypesLoaded event', function () {
      // Set up parent scope with test data
      const mockIntegrationTypes = [
        { id: 'TYPE1', name: 'Integration Type 1' },
        { id: 'TYPE2', name: 'Integration Type 2' },
      ];
      const mockBlockIntegrations = [
        { blockId: 'block1', title: 'Block 1', integrationTypeId: 'TYPE1' },
        { blockId: 'block2', title: 'Block 2', integrationTypeId: null },
      ];

      // Verify that the variables have initial values before the event is broadcast
      // integrationTypes starts with the default type from blockIntegrationService
      expect(scope.integrationTypes).toEqual([
        { id: null, ministryId: null, name: 'None', prettyName: 'None' },
      ]);

      expect(scope.blockIntegrations).toEqual([]);

      scope.$parent.integrationTypes = mockIntegrationTypes;
      scope.$parent.blockIntegrations = mockBlockIntegrations;

      // Broadcast the event
      scope.$broadcast('integrationTypesLoaded', mockIntegrationTypes);

      // Verify that the child scope received the data from parent
      expect(scope.integrationTypes).toEqual(mockIntegrationTypes);
      expect(scope.blockIntegrations).toEqual(mockBlockIntegrations);
    });
  });

  describe('integrationTypeChanged', function () {
    var blockIntegrationService, $httpBackend;

    beforeEach(inject(function (_blockIntegrationService_, _$httpBackend_) {
      blockIntegrationService = _blockIntegrationService_;
      $httpBackend = _$httpBackend_;

      // Mock HTTP response to populate the service's internal integrationTypes
      const mockIntegrationTypesResponse = [
        {
          id: 'TYPE1',
          ministryId: null,
          name: 'Integration_Type_1',
          prettyName: 'Integration Type 1',
        },
        {
          id: 'TYPE2',
          ministryId: null,
          name: 'Integration_Type_2',
          prettyName: 'Integration Type 2',
        },
        {
          id: 'TYPE3',
          ministryId: null,
          name: 'Integration_Type_3',
          prettyName: 'Integration Type 3',
        },
      ];

      $httpBackend
        .whenGET(/^blockTagTypes\/.+$/)
        .respond(200, mockIntegrationTypesResponse);

      // Call loadIntegrationTypes to populate the service's internal state
      blockIntegrationService.loadIntegrationTypes('test-conference-id');
      $httpBackend.flush();

      // Set up blockIntegrations with test data
      scope.blockIntegrations = [
        { blockId: 'block1', title: 'Question 1', integrationTypeId: 'TYPE1' },
        { blockId: 'block2', title: 'Question 2', integrationTypeId: 'TYPE2' },
        { blockId: 'block3', title: 'Question 3', integrationTypeId: null },
      ];
      scope.block.id = 'block3';

      // Spy on the service method to verify it's called correctly
      spyOn(
        blockIntegrationService,
        'validateFieldSelection',
      ).and.callThrough();
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should store validation result when integration type is valid', function () {
      // Select an integration type that is not already used
      scope.integrationTypeChanged('TYPE3');

      expect(scope.integrationValidation).toEqual({ valid: true, message: '' });
      expect(scope.$parent.fetchBlockIntegrations).toHaveBeenCalledWith();
    });

    it('should not save new integration type when integration type is already used', function () {
      // Set the block's integration ID to something other than NONE
      scope.block.blockTagTypeId = 'TYPE2';

      // Try to select TYPE1 which is already used by block1
      scope.integrationTypeChanged('TYPE1');

      expect(scope.integrationValidation).toEqual({
        valid: false,
        message: `Integration Type 1 has already been selected on Question 1.`,
      });
      // Should reset to null because validation failed
      expect(scope.block.blockTagTypeId).toBe('TYPE2');
    });

    it('should save correctly with no validation errors when selecting null integration type', function () {
      scope.block.blockTagTypeId = 'TYPE1';

      scope.integrationTypeChanged(null);

      expect(scope.integrationValidation).toEqual({ valid: true, message: '' });
      expect(scope.block.blockTagTypeId).toBe(null);
    });

    it('should allow re-selecting the same integration type for the same block', function () {
      // block3 currently has no integration type
      scope.block.blockTagTypeId = 'TYPE3';
      scope.blockIntegrations[2].integrationTypeId = 'TYPE3';

      // Re-select TYPE3 for the same block
      scope.integrationTypeChanged('TYPE3');

      expect(scope.integrationValidation).toEqual({ valid: true, message: '' });
      // Should not reset because it's the same block
      expect(scope.block.blockTagTypeId).toBe('TYPE3');
    });
  });

  describe('showIntegrationDropdown', function () {
    it('should not show the integration dropdown when only "None" is available', function () {
      scope.conference.ministry = 'other-ministry-id';

      expect(scope.showIntegrationDropdown()).toBe(false);
    });

    it('should show the integration dropdown when more than "None" is available', function () {
      scope.conference.ministry = familyLifeMinistryId;

      expect(scope.showIntegrationDropdown()).toBe(true);
    });
  });
});
