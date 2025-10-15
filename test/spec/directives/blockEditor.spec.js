import 'angular-mocks';
import { familyLifeMinistryId } from '../../../app/scripts/directives/blockEditor';

const defaultBlockTagTypeMapping = [
  { blockId: 'block1', title: 'Question 1', blockTagTypeId: 'TYPE1' },
  { blockId: 'block2', title: 'Question 2', blockTagTypeId: 'TYPE2' },
  { blockId: 'block3', title: 'Question 3', blockTagTypeId: null },
];

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
    parentScope.fetchBlockTagTypeMapping = jasmine.createSpy(
      'fetchBlockTagTypeMapping',
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

  describe('blockTagTypesLoaded', function () {
    it('should set blockTagTypes & blockTagTypeMapping upon blockTagTypesLoaded event', function () {
      // Set up parent scope with test data
      const mockBlockTagTypes = [
        { id: 'TYPE1', name: 'Block Tag Type 1' },
        { id: 'TYPE2', name: 'Block Tag Type 2' },
      ];
      const mockBlockTagTypeMapping = [
        { blockId: 'block1', title: 'Block 1', blockTagTypeId: 'TYPE1' },
        { blockId: 'block2', title: 'Block 2', blockTagTypeId: null },
      ];

      // Verify that the variables have initial values before the event is broadcast
      // blockTagTypes starts with the default type from blockTagTypeService
      expect(scope.blockTagTypes).toEqual([
        { id: null, ministryId: null, name: 'None', prettyName: 'None' },
      ]);

      expect(scope.blockTagTypeMapping).toEqual([]);

      scope.$parent.blockTagTypes = mockBlockTagTypes;
      scope.$parent.blockTagTypeMapping = mockBlockTagTypeMapping;

      // Broadcast the event
      scope.$broadcast('blockTagTypesLoaded', mockBlockTagTypes);

      // Verify that the child scope received the data from parent
      expect(scope.blockTagTypes).toEqual(mockBlockTagTypes);
      expect(scope.blockTagTypeMapping).toEqual(mockBlockTagTypeMapping);
    });
  });

  describe('blockTagTypeTypeChanged', function () {
    let blockTagTypeService, $httpBackend;

    beforeEach(inject(function (_blockTagTypeService_, _$httpBackend_) {
      blockTagTypeService = _blockTagTypeService_;
      $httpBackend = _$httpBackend_;

      // Mock HTTP response to populate the service's internal blockTagTypes
      const mockBlockTagTypesResponse = [
        {
          id: 'TYPE1',
          ministryId: null,
          name: 'Tag_Type_1',
          prettyName: 'Block Tag Type 1',
        },
        {
          id: 'TYPE2',
          ministryId: null,
          name: 'Tag_Type_2',
          prettyName: 'Block Tag Type 2',
        },
        {
          id: 'TYPE3',
          ministryId: null,
          name: 'Tag_Type_3',
          prettyName: 'Block Tag Type 3',
        },
      ];

      $httpBackend
        .whenGET(/^blockTagTypes\/.+$/)
        .respond(200, mockBlockTagTypesResponse);

      // Call loadBlockTagTypes to populate the service's internal state
      blockTagTypeService.loadBlockTagTypes('test-conference-id');
      $httpBackend.flush();

      // Set up blockTagTypeMapping with test data
      scope.blockTagTypeMapping = defaultBlockTagTypeMapping;
      scope.block.id = 'block3';

      // Spy on the service method to verify it's called correctly
      spyOn(blockTagTypeService, 'validateFieldSelection').and.callThrough();
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should store validation result when block tag type is valid', function () {
      // Select a block tag type that is not already used
      scope.blockTagTypeTypeChanged('TYPE3');

      expect(scope.blockTagTypeValidation).toEqual({
        valid: true,
        message: '',
      });

      expect(scope.$parent.fetchBlockTagTypeMapping).toHaveBeenCalledWith();
    });

    it('should not save new block tag type when block tag type is already used', function () {
      // Set the block's block tag type ID to something other than NONE
      scope.block.blockTagTypeId = 'TYPE2';

      // Try to select TYPE1 which is already used by block1
      scope.blockTagTypeTypeChanged('TYPE1');

      expect(scope.blockTagTypeValidation).toEqual({
        valid: false,
        message: `Block Tag Type 1 has already been selected on Question 1.`,
      });
      // Should reset to null because validation failed
      expect(scope.block.blockTagTypeId).toBe('TYPE2');
    });

    it('should save correctly with no validation errors when selecting null block tag type', function () {
      scope.block.blockTagTypeId = 'TYPE1';

      scope.blockTagTypeTypeChanged(null);

      expect(scope.blockTagTypeValidation).toEqual({
        valid: true,
        message: '',
      });

      expect(scope.block.blockTagTypeId).toBe(null);
    });

    it('should allow re-selecting the same block tag type for the same block', function () {
      // block3 currently has no block tag type
      scope.block.blockTagTypeId = 'TYPE3';
      scope.blockTagTypeMapping[2].blockTagTypeId = 'TYPE3';

      // Re-select TYPE3 for the same block
      scope.blockTagTypeTypeChanged('TYPE3');

      expect(scope.blockTagTypeValidation).toEqual({
        valid: true,
        message: '',
      });
      // Should not reset because it's the same block
      expect(scope.block.blockTagTypeId).toBe('TYPE3');
    });
  });

  describe('showBlockTagTypeDropdown', function () {
    it('should not show the block tag type dropdown when only "None" is available', function () {
      scope.conference.ministry = 'other-ministry-id';

      expect(scope.showBlockTagTypeDropdown()).toBe(false);
    });

    it('should show the block tag type dropdown when more than "None" is available', function () {
      scope.conference.ministry = familyLifeMinistryId;

      expect(scope.showBlockTagTypeDropdown()).toBe(true);
    });
  });

  describe('isBlockTagTypeDisabled', function () {
    beforeEach(function () {
      scope.blockTagTypeMapping = [
        ...defaultBlockTagTypeMapping,
        { blockId: 'block4', title: 'Phone', blockTagTypeId: 'TYPE4' },
      ];

      // Set current block to block3 (which has no tag type assigned)
      scope.block.id = 'block3';
      scope.block.blockTagTypeId = null;
    });

    it('should not disable the "None" option (null)', function () {
      const result = scope.isBlockTagTypeDisabled(null);

      expect(result).toBe(false);
    });

    it('should not disable a blockTagType that is not yet assigned to any block', function () {
      const result = scope.isBlockTagTypeDisabled('TYPE5');

      expect(result).toBe(false);
    });

    it('should disable a blockTagType that is already assigned to another block', function () {
      const result = scope.isBlockTagTypeDisabled('TYPE1');

      expect(result).toBe(true);
    });

    it('should not disable the currently selected blockTagType for this block', function () {
      scope.block.blockTagTypeId = 'TYPE1';
      const result = scope.isBlockTagTypeDisabled('TYPE1');

      expect(result).toBe(false);
    });

    it('should disable multiple blockTagTypes that are assigned to other blocks', function () {
      expect(scope.isBlockTagTypeDisabled('TYPE1')).toBe(true);
      expect(scope.isBlockTagTypeDisabled('TYPE2')).toBe(true);
      expect(scope.isBlockTagTypeDisabled('TYPE4')).toBe(true);
    });

    it('should not disable available blockTagTypes', function () {
      expect(scope.isBlockTagTypeDisabled('TYPE3')).toBe(false);
      expect(scope.isBlockTagTypeDisabled('TYPE5')).toBe(false);
      expect(scope.isBlockTagTypeDisabled('TYPE99')).toBe(false);
    });

    it('should handle empty blockTagTypeMapping array', function () {
      scope.blockTagTypeMapping = [];

      // All types should be available when there are no mappings
      expect(scope.isBlockTagTypeDisabled('TYPE1')).toBe(false);
      expect(scope.isBlockTagTypeDisabled('TYPE2')).toBe(false);
      expect(scope.isBlockTagTypeDisabled(null)).toBe(false);
    });
  });
});
